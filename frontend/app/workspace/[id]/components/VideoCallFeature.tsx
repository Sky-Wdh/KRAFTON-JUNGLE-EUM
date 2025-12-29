'use client';

import { useState, useEffect } from 'react';
import {
    LiveKitRoom,
    RoomAudioRenderer,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { apiClient } from '@/app/lib/api';
import { useAuth } from '@/app/lib/auth-context';
import CustomVideoConference from '@/components/video/CustomVideoConference';
import WhiteboardCanvas from '@/components/video/WhiteboardCanvas';
import ParticipantSidebar from '@/components/video/ParticipantSidebar';
import ChatPanel from '@/components/video/ChatPanel';

const LIVEKIT_URL = process.env.NEXT_PUBLIC_LIVEKIT_URL || 'ws://localhost:7880';

interface VideoCallFeatureProps {
    roomId: string;
    roomTitle?: string;
    onLeave: () => void;
}

export default function VideoCallFeature({ roomId, roomTitle, onLeave }: VideoCallFeatureProps) {
    const { user } = useAuth();
    const [token, setToken] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const participantName = user?.nickname || 'Anonymous';

    useEffect(() => {
        const fetchToken = async () => {
            try {
                const response = await apiClient.getVideoToken(roomId, participantName);
                setToken(response.token);
            } catch (err) {
                console.error('Failed to get token:', err);
                setError('토큰을 가져오는데 실패했습니다.');
            }
        };

        if (roomId && participantName) {
            fetchToken();
        }
    }, [roomId, participantName]);

    // Force Layout Recalculation on Toggle
    useEffect(() => {
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 100);
    }, [isWhiteboardOpen]);

    if (error) {
        return (
            <div className="fixed inset-0 z-50 min-h-screen bg-gray-900 flex items-center justify-center p-4">
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 max-w-md w-full text-center">
                    <h2 className="text-xl font-bold text-white mb-2">연결 실패</h2>
                    <p className="text-gray-400 mb-6">{error}</p>
                    <button
                        onClick={onLeave}
                        className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
                    >
                        돌아가기
                    </button>
                </div>
            </div>
        );
    }

    if (!token) {
        return (
            <div className="fixed inset-0 z-50 min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white text-lg">연결 준비 중...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-gray-900">
            <LiveKitRoom
                serverUrl={LIVEKIT_URL}
                token={token}
                connect={true}
                video={true}
                audio={true}
                onDisconnected={onLeave}
                onError={(err) => {
                    console.error('LiveKit error:', err);
                    setError(err.message);
                }}
                options={{
                    adaptiveStream: false,
                    dynacast: true,
                    disconnectOnPageLeave: true,
                    videoCaptureDefaults: {
                        resolution: { width: 1280, height: 720, frameRate: 30 },
                    },
                    publishDefaults: {
                        simulcast: true,
                        videoCodec: 'vp8',
                    },
                }}
                className="h-full w-full overflow-hidden relative"
            >
                {/* Audio Renderer - Always Active */}
                <RoomAudioRenderer />

                {/* Content Switcher */}
                {isWhiteboardOpen ? (
                    <div className="absolute inset-0 z-50 flex overflow-hidden bg-gray-900/95 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex-1 flex flex-col relative h-full rounded-2xl overflow-hidden m-4 bg-white shadow-2xl ring-1 ring-white/10">
                            <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-gray-100 border-b border-gray-200">
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-900 font-bold text-lg">📝 화이트보드</span>
                                    <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">실시간 저장됨</span>
                                </div>
                                <button
                                    onClick={() => setIsWhiteboardOpen(false)}
                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                                >
                                    닫기
                                </button>
                            </div>
                            <div className="flex-1 relative">
                                <WhiteboardCanvas />
                            </div>
                        </div>

                        <div className="w-80 h-full p-4 pl-0">
                            <div className="h-full bg-gray-800 rounded-2xl overflow-hidden border border-gray-700">
                                <ParticipantSidebar />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="absolute inset-0 w-full h-full flex flex-col z-0 animate-in fade-in duration-300">
                        <CustomVideoConference customRoomName={roomTitle} />
                    </div>
                )}

                {/* Floating Toggle Buttons */}
                {!isWhiteboardOpen && (
                    <div className="absolute bottom-8 right-8 z-40 flex gap-3">
                        <button
                            onClick={() => {
                                setIsChatOpen(!isChatOpen);
                                if (!isChatOpen) setUnreadCount(0);
                            }}
                            className={`relative p-4 rounded-full shadow-xl transition-transform hover:scale-105 flex items-center gap-2 group ${isChatOpen
                                ? 'bg-black text-white'
                                : 'bg-white text-stone-900 hover:bg-stone-50 border border-black/5'
                                }`}
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            {unreadCount > 0 && !isChatOpen && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>

                        <button
                            onClick={() => setIsWhiteboardOpen(true)}
                            className="bg-white text-gray-900 p-4 rounded-full shadow-xl hover:bg-gray-100 transition-transform hover:scale-105 flex items-center gap-2 group"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Chat Panel */}
                {isChatOpen && !isWhiteboardOpen && (
                    <div className="absolute top-4 right-4 bottom-4 w-80 z-50">
                        <ChatPanel
                            roomId={roomId}
                            onClose={() => setIsChatOpen(false)}
                            onNewMessage={() => {
                                if (!isChatOpen) setUnreadCount(prev => prev + 1);
                            }}
                        />
                    </div>
                )}
            </LiveKitRoom>
        </div>
    );
}
