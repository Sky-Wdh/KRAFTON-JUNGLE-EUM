'use client';

import { useTracks, useParticipants, useLocalParticipant } from '@livekit/components-react';
import { Track, Participant } from 'livekit-client';
import { useState, useMemo, useEffect, useRef } from 'react';

interface ParticipantSidebarProps {
    maxVisible?: number;
}

export default function ParticipantSidebar({ maxVisible = 4 }: ParticipantSidebarProps) {
    const participants = useParticipants();
    const { localParticipant } = useLocalParticipant();
    const [startIndex, setStartIndex] = useState(0);

    // 李멸????몃옓 媛?몄삤湲?
    const tracks = useTracks(
        [{ source: Track.Source.Camera, withPlaceholder: true }],
        { onlySubscribed: false }
    );

    // ??蹂몄씤)瑜?泥?踰덉㎏濡? ?섎㉧吏 李멸??먮뱾 ?뺣젹
    const sortedParticipants = useMemo(() => {
        const others = participants.filter(p => p.identity !== localParticipant?.identity);
        if (localParticipant) {
            return [localParticipant, ...others];
        }
        return others;
    }, [participants, localParticipant]);

    // ?꾩옱 蹂댁씠??李멸??먮뱾
    const visibleParticipants = useMemo(() => {
        return sortedParticipants.slice(startIndex, startIndex + maxVisible);
    }, [sortedParticipants, startIndex, maxVisible]);

    // ?붿궡???쒖떆 ?щ?
    const showUpArrow = startIndex > 0;
    const showDownArrow = startIndex + maxVisible < sortedParticipants.length;
    const totalParticipants = sortedParticipants.length;

    const handleUp = () => {
        setStartIndex(Math.max(0, startIndex - 1));
    };

    const handleDown = () => {
        setStartIndex(Math.min(totalParticipants - maxVisible, startIndex + 1));
    };

    // 李멸????몃옓 李얘린
    const getTrackForParticipant = (participant: Participant) => {
        return tracks.find(t => t.participant.identity === participant.identity);
    };

    return (
        <div className="flex flex-col h-full w-32 bg-white/80 backdrop-blur-sm border-l border-black/5">
            {/* 위 화살표 */}
            <button
                onClick={handleUp}
                disabled={!showUpArrow}
                className={`flex-shrink-0 h-8 flex items-center justify-center transition-colors ${showUpArrow
                    ? 'text-stone-600 hover:bg-black/5 cursor-pointer'
                    : 'text-stone-300 cursor-not-allowed'
                    }`}
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
            </button>

            {/* 李멸???紐⑸줉 */}
            <div className="flex-1 flex flex-col gap-2 p-2 overflow-hidden">
                {visibleParticipants.map((participant, index) => {
                    const trackRef = getTrackForParticipant(participant);
                    const isLocal = participant.identity === localParticipant?.identity;
                    const videoTrack = trackRef?.publication?.track;

                    return (
                        <div
                            key={participant.identity}
                            className="relative aspect-video bg-stone-100 rounded-lg overflow-hidden ring-1 ring-black/5 shadow-sm"
                        >
                            {/* 鍮꾨뵒??*/}
                            {videoTrack ? (
                                <VideoRenderer track={videoTrack} />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-stone-100">
                                    <div className="w-8 h-8 bg-stone-200 rounded-full flex items-center justify-center text-stone-500 text-xs font-bold ring-2 ring-white">
                                        {participant.identity.charAt(0).toUpperCase()}
                                    </div>
                                </div>
                            )}

                            {/* ?대쫫 ?쇰꺼 */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1">
                                <p className="text-white text-[10px] truncate text-center">
                                    {isLocal ? '나' : participant.identity}
                                </p>
                            </div>

                            {/* ?뚯냼嫄??쒖떆 */}
                            {participant.isMicrophoneEnabled === false && (
                                <div className="absolute top-1 right-1 bg-red-500/80 rounded-full p-0.5">
                                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* 아래 화살표 */}
            <button
                onClick={handleDown}
                disabled={!showDownArrow}
                className={`flex-shrink-0 h-8 flex items-center justify-center transition-colors ${showDownArrow
                    ? 'text-stone-600 hover:bg-black/5 cursor-pointer'
                    : 'text-stone-300 cursor-not-allowed'
                    }`}
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* 참가자 수 표시 */}
            <div className="flex-shrink-0 p-2 text-center border-t border-black/5 bg-stone-50/50">
                <span className="text-stone-500 text-xs font-semibold">{totalParticipants}명</span>
            </div>
        </div>
    );
}

// 鍮꾨뵒???뚮뜑??而댄룷?뚰듃
function VideoRenderer({ track }: { track: any }) {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current && track) {
            track.attach(videoRef.current);
            return () => {
                track.detach(videoRef.current!);
            };
        }
    }, [track]);

    return (
        <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            playsInline
            muted
        />
    );
}

