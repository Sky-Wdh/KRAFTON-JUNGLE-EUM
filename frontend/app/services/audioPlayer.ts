import { AUDIO_SAMPLE_RATE } from "@/app/constants";
import { audioProcessor } from "./audioProcessor";
import { noiseSuppress } from "./noiseSuppress";

export interface AudioProcessingOptions {
  noiseSuppressionEnabled: boolean;
  dspEnabled: boolean;
}

export class AudioPlayerService {
  private audioContext: AudioContext | null = null;
  private options: AudioProcessingOptions = {
    noiseSuppressionEnabled: true,
    dspEnabled: true,
  };

  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext({ sampleRate: AUDIO_SAMPLE_RATE });
    }
    return this.audioContext;
  }

  setOptions(options: Partial<AudioProcessingOptions>): void {
    this.options = { ...this.options, ...options };
  }

  getOptions(): AudioProcessingOptions {
    return { ...this.options };
  }

  /**
   * 오디오 재생 파이프라인:
   * 1. RNNoise (노이즈 제거)
   * 2. DSP (하이패스 필터 + 컴프레서 + 게인)
   * 3. 재생
   */
  async play(audioData: Float32Array): Promise<void> {
    const audioContext = this.getAudioContext();

    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    let processedData = audioData;

    // 1. RNNoise 노이즈 제거
    if (this.options.noiseSuppressionEnabled) {
      try {
        processedData = await noiseSuppress.process(processedData);
      } catch (error) {
        console.warn("RNNoise processing failed, using original audio:", error);
      }
    }

    // 2. DSP 처리 (하이패스 필터 + 컴프레서 + 게인)
    if (this.options.dspEnabled) {
      try {
        processedData = await audioProcessor.processAudio(processedData);
      } catch (error) {
        console.warn("DSP processing failed:", error);
      }
    }

    // 3. 재생
    const audioBuffer = audioContext.createBuffer(
      1,
      processedData.length,
      AUDIO_SAMPLE_RATE
    );
    const channelData = audioBuffer.getChannelData(0);
    channelData.set(processedData);

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start();
  }

  /**
   * MP3 오디오 재생 (TTS 응답용)
   * Web Audio API의 decodeAudioData를 사용하여 MP3 디코딩
   */
  async playMp3(mp3Data: ArrayBuffer): Promise<void> {
    const audioContext = this.getAudioContext();

    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    try {
      // MP3 디코딩
      const audioBuffer = await audioContext.decodeAudioData(mp3Data);

      // 재생
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();

      console.log(`🔊 Playing MP3: ${audioBuffer.duration.toFixed(2)}s`);
    } catch (error) {
      console.error("Failed to decode MP3 audio:", error);
    }
  }

  /**
   * MP3 데이터인지 확인 (magic bytes 체크)
   */
  static isMp3(data: ArrayBuffer): boolean {
    if (data.byteLength < 3) return false;
    const bytes = new Uint8Array(data);
    // ID3 header (ID3v2 tag)
    if (bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) {
      return true;
    }
    // MPEG Audio Frame sync (0xFF 0xFB, 0xFF 0xFA, 0xFF 0xF3, 0xFF 0xF2, 0xFF 0xE3, 0xFF 0xE2)
    if (bytes[0] === 0xFF && (bytes[1] & 0xE0) === 0xE0) {
      return true;
    }
    return false;
  }

  async close(): Promise<void> {
    noiseSuppress.destroy();
    await audioProcessor.close();
    if (this.audioContext) {
      await this.audioContext.close();
      this.audioContext = null;
    }
  }
}

export const audioPlayer = new AudioPlayerService();
