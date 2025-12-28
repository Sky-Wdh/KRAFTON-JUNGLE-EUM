"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useMicVAD } from "@ricky0123/vad-react";
import { VAD_DEFAULT_OPTIONS, SPEECH_LOG_MAX_ENTRIES, WS_AUDIO_URL, AUDIO_SAMPLE_RATE } from "@/app/constants";
import { audioPlayer, AudioPlayerService } from "@/app/services";
import { audioSocket, ConnectionState, TranscriptMessage } from "@/app/services/audioSocket";
import { int16ToFloat32, arrayBufferToInt16, float32ToInt16, int16ToArrayBuffer } from "@/app/utils/audioEncoder";
import type { SpeechLogEntry } from "@/app/types";

interface UseVoiceActivityOptions {
  autoPlayback?: boolean;
  useEchoServer?: boolean;
}

export function useVoiceActivity(options: UseVoiceActivityOptions = {}) {
  const { autoPlayback = true, useEchoServer = true } = options;

  const [speechLog, setSpeechLog] = useState<SpeechLogEntry[]>([]);
  const [audioLevel, setAudioLevel] = useState(0);
  const [connectionState, setConnectionState] = useState<ConnectionState>("disconnected");
  const [subtitle, setSubtitle] = useState<string>("");
  const isConnectedRef = useRef(false);
  const subtitleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 실시간 스트리밍 관련
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const isSpeakingRef = useRef(false);
  const chunkCountRef = useRef(0);

  const addLogEntry = useCallback(
    (type: SpeechLogEntry["type"], message: string) => {
      const entry: SpeechLogEntry = {
        id: crypto.randomUUID(),
        timestamp: new Date().toLocaleTimeString(),
        type,
        message,
      };
      setSpeechLog((prev) =>
        [...prev, entry].slice(-SPEECH_LOG_MAX_ENTRIES)
      );
    },
    []
  );

  // WebSocket 연결 관리
  useEffect(() => {
    if (!useEchoServer) return;

    audioSocket.connect(WS_AUDIO_URL, {
      onConnectionChange: (state) => {
        setConnectionState(state);
        isConnectedRef.current = state === "connected";
        if (state === "connected") {
          addLogEntry("info", "서버 연결됨");
        } else if (state === "disconnected") {
          addLogEntry("info", "서버 연결 끊김");
        } else if (state === "error") {
          addLogEntry("error", "서버 연결 오류");
        }
      },
      onMessage: (data) => {
        if (data instanceof ArrayBuffer) {
          if (AudioPlayerService.isMp3(data)) {
            addLogEntry("end", "🔊 TTS 재생");
            audioPlayer.playMp3(data);
          } else {
            const int16Data = arrayBufferToInt16(data);
            const float32Data = int16ToFloat32(int16Data);
            audioPlayer.play(float32Data);
          }
        } else if (typeof data === "string") {
          try {
            const response = JSON.parse(data);
            if (response.status === "ready") {
              addLogEntry("info", `세션: ${response.session_id?.slice(0, 8)}...`);
            }
          } catch {
            console.log("Message:", data);
          }
        }
      },
      onTranscript: (transcript: TranscriptMessage) => {
        setSubtitle(transcript.text);
        addLogEntry("info", `📝 ${transcript.text}`);

        if (subtitleTimeoutRef.current) {
          clearTimeout(subtitleTimeoutRef.current);
        }
        subtitleTimeoutRef.current = setTimeout(() => {
          setSubtitle("");
        }, 5000);
      },
      onError: (error) => {
        console.error("WebSocket error:", error);
      },
    });

    return () => {
      audioSocket.disconnect();
    };
  }, [useEchoServer, addLogEntry]);

  // ★ 실시간 오디오 스트리밍 설정 (100ms 단위)
  useEffect(() => {
    console.log(`🚀 Streaming useEffect: useEchoServer=${useEchoServer}`);
    if (!useEchoServer) return;

    let processorInterval: NodeJS.Timeout | null = null;
    let audioBuffer: Float32Array[] = [];

    const setupStreaming = async () => {
      console.log("🚀 setupStreaming called");
      try {
        console.log("🚀 Requesting getUserMedia...");
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
          }
        });
        streamRef.current = stream;

        // 기본 샘플레이트 사용 (디바이스 네이티브)
        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;
        const nativeSampleRate = audioContext.sampleRate;
        console.log(`🎧 AudioContext created: state=${audioContext.state}, sampleRate=${nativeSampleRate}`);

        // AudioContext가 suspended 상태면 resume
        if (audioContext.state === "suspended") {
          await audioContext.resume();
          console.log(`🎧 AudioContext resumed: state=${audioContext.state}`);
        }

        const source = audioContext.createMediaStreamSource(stream);
        console.log(`🎧 MediaStream connected: tracks=${stream.getAudioTracks().length}`);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        source.connect(analyser);

        // ScriptProcessor로 오디오 캡처 (deprecated지만 간단함)
        const processor = audioContext.createScriptProcessor(4096, 1, 1);
        source.connect(processor);
        processor.connect(audioContext.destination);
        console.log(`🎧 ScriptProcessor connected: bufferSize=4096`);

        // 리샘플링 함수 (native -> 16kHz)
        const resampleTo16k = (input: Float32Array, fromRate: number): Float32Array => {
          const ratio = fromRate / AUDIO_SAMPLE_RATE;
          const outputLength = Math.floor(input.length / ratio);
          const output = new Float32Array(outputLength);
          for (let i = 0; i < outputLength; i++) {
            const srcIndex = i * ratio;
            const srcIndexFloor = Math.floor(srcIndex);
            const srcIndexCeil = Math.min(srcIndexFloor + 1, input.length - 1);
            const t = srcIndex - srcIndexFloor;
            output[i] = input[srcIndexFloor] * (1 - t) + input[srcIndexCeil] * t;
          }
          return output;
        };

        // 100ms @ 16kHz = 1600 samples, but at native rate it's different
        const CHUNK_SIZE_16K = 1600;
        const CHUNK_SIZE_NATIVE = Math.floor(CHUNK_SIZE_16K * (nativeSampleRate / AUDIO_SAMPLE_RATE));
        console.log(`🎧 Chunk sizes: native=${CHUNK_SIZE_NATIVE} (${nativeSampleRate}Hz), target=1600 (16kHz)`);

        processor.onaudioprocess = (e) => {
          const inputData = e.inputBuffer.getChannelData(0);

          // 디버그: 프로세서가 작동하는지 확인 (가끔씩만)
          if (Math.random() < 0.02) {
            const maxAmp = Math.max(...Array.from(inputData).map(Math.abs));
            if (maxAmp > 0.01) {
              console.log(`🔊 Audio: amp=${maxAmp.toFixed(3)}, speaking=${isSpeakingRef.current}, connected=${isConnectedRef.current}`);
            }
          }

          if (!isSpeakingRef.current || !isConnectedRef.current) return;

          audioBuffer.push(new Float32Array(inputData));

          // 버퍼가 100ms 이상이면 전송 (네이티브 샘플레이트 기준)
          const totalSamples = audioBuffer.reduce((acc, arr) => acc + arr.length, 0);
          if (totalSamples >= CHUNK_SIZE_NATIVE) {
            chunkCountRef.current++;
            const chunkNum = chunkCountRef.current;

            // 네이티브 샘플레이트로 합치기
            const nativeChunk = new Float32Array(totalSamples);
            let offset = 0;
            for (const arr of audioBuffer) {
              nativeChunk.set(arr, offset);
              offset += arr.length;
            }

            // 16kHz로 리샘플링
            const resampled = resampleTo16k(nativeChunk, nativeSampleRate);

            const durationMs = (resampled.length / AUDIO_SAMPLE_RATE) * 1000;
            const byteSize = resampled.length * 2;
            console.log(`🎤 [${chunkNum}] Sending: ${resampled.length} samples (${durationMs.toFixed(0)}ms, ${byteSize} bytes)`);
            addLogEntry("info", `📤 청크 #${chunkNum}: ${durationMs.toFixed(0)}ms`);

            audioSocket.sendAudio(resampled);
            audioBuffer = [];
          }
        };

      } catch (err) {
        console.error("❌ Audio setup failed:", err);
        addLogEntry("error", `오디오 설정 실패: ${err}`);
      }
    };

    console.log("🚀 Calling setupStreaming()...");
    setupStreaming();

    return () => {
      if (processorInterval) clearInterval(processorInterval);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [useEchoServer, addLogEntry]);

  const vad = useMicVAD({
    ...VAD_DEFAULT_OPTIONS,
    onSpeechStart: () => {
      chunkCountRef.current = 0;
      addLogEntry("start", "🎤 음성 감지 - 스트리밍 시작");
      console.log("🎤 Speech started - streaming begins");
      isSpeakingRef.current = true;
    },
    onSpeechEnd: () => {
      addLogEntry("end", `음성 종료 - 총 ${chunkCountRef.current}개 청크 전송됨`);
      console.log(`🔇 Speech ended - sent ${chunkCountRef.current} chunks`);
      isSpeakingRef.current = false;
    },
    onFrameProcessed: (probs) => {
      setAudioLevel(probs.isSpeech);
    },
  });

  const clearLog = useCallback(() => {
    setSpeechLog([]);
  }, []);

  useEffect(() => {
    return () => {
      if (subtitleTimeoutRef.current) {
        clearTimeout(subtitleTimeoutRef.current);
      }
    };
  }, []);

  return {
    ...vad,
    audioLevel,
    speechLog,
    clearLog,
    connectionState,
    subtitle,
  };
}
