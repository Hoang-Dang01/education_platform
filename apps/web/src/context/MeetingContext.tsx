import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { jitsiService } from '../lib/jitsiService';
import { api } from '../lib/api';
import type { UserRole } from '../lib/roles';
import { roleFromJitsi, isInstructor } from '../lib/roles';
import { getDeviceInfo } from '../lib/deviceInfo';
import type { Participant, ChatMessage, DiagnosticAlert } from './ClassContext';
import { getMockParticipants, getInitialChatMessages } from '../lib/mockData';

// Determine if we are in mock mode (?mock=true)
const isMockMode = () =>
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('mock') === 'true';

const qualityFromMetrics = (rtt: number, loss: number, jitter: number): Participant['connectionQuality'] => {
  if (loss > 5 || rtt > 300 || jitter > 50) return 'critical';
  if (loss > 3 || rtt > 200 || jitter > 30) return 'poor';
  if (loss > 1 || rtt > 100 || jitter > 20) return 'good';
  return 'excellent';
};

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const drift = (range: number) => (Math.random() - 0.5) * 2 * range;

interface MeetingContextType {
  screen: 'lms' | 'classroom';
  roomName: string;
  sessionId: string | null;
  participants: Participant[];
  chatMessages: ChatMessage[];
  raiseHandQueue: string[];
  dominantSpeakerId: string;
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  isHandRaised: boolean;
  isScreenSharing: boolean;
  screenStream: MediaStream | null;
  screenTrack: any | null;
  screenSharingUserId: string;
  shareApprovalPending: boolean;
  shareApproved: boolean;
  chatOpen: boolean;
  panelOpen: boolean;
  activeTab: 'chat' | 'attendance';
  diagnosticAlerts: DiagnosticAlert[];
  simulationMode: 'none' | 'local' | 'teacher' | 'infrastructure';
  isBreakoutActive: boolean;
  breakoutTimeLeft: number;
  breakoutRoomsCount: number;
  loading: boolean;
  error: string | null;
  joinSession: (sessionId: string, userName: string, userRole: UserRole) => Promise<void>;
  leaveSession: () => Promise<void>;
  endSession: () => Promise<void>;
  toggleAudio: () => void;
  toggleVideo: () => void;
  requestScreenShare: () => void;
  toggleHandRaise: () => void;
  toggleChat: () => void;
  togglePanel: () => void;
  setActiveTab: (tab: 'chat' | 'attendance') => void;
  sendMessage: (text: string) => void;
  muteParticipant: (id: string) => void;
  lowerParticipantHand: (id: string) => void;
  dismissAlert: (id: string) => void;
  triggerSimulation: (mode: 'none' | 'local' | 'teacher' | 'infrastructure') => void;
  startBreakout: (rooms: number, mins: number) => void;
  stopBreakout: () => void;
}

const MeetingContext = createContext<MeetingContextType | undefined>(undefined);

export const MeetingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [screen, setScreen] = useState<'lms' | 'classroom'>('lms');
  const [roomName, setRoomName] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Connection session tracking for attendance duration calculation
  const joinedAtSecondsRef = useRef<number | null>(null);

  // Roster / Chat states
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [dominantSpeakerId, setDominantSpeakerId] = useState<string>('');
  const [simulateTelemetry, setSimulateTelemetry] = useState(false);

  // Media States
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [screenTrack, setScreenTrack] = useState<any | null>(null);
  const [screenSharingUserId, setScreenSharingUserId] = useState<string>('');
  const [shareApprovalPending, setShareApprovalPending] = useState(false);
  const [shareApproved, setShareApproved] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);

  // Panel state
  const [chatOpen, setChatOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'attendance'>('chat');

  // Diagnostics and Breakouts
  const [diagnosticAlerts, setDiagnosticAlerts] = useState<DiagnosticAlert[]>([]);
  const [simulationMode, setSimulationMode] = useState<'none' | 'local' | 'teacher' | 'infrastructure'>('none');
  const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>([]);
  const [isBreakoutActive, setIsBreakoutActive] = useState(false);
  const [breakoutTimeLeft, setBreakoutTimeLeft] = useState(0);
  const [breakoutRoomsCount, setBreakoutRoomsCount] = useState(2);

  // Hand raise queue
  const raiseHandQueue = participants
    .filter(p => p.isHandRaised && p.handRaiseTime)
    .sort((a, b) => (a.handRaiseTime || 0) - (b.handRaiseTime || 0))
    .map(p => p.id);

  // Sync classroom ticks for attendance time counting
  useEffect(() => {
    if (screen !== 'classroom') return;

    const timer = setInterval(() => {
      setParticipants(prev =>
        prev.map(p => {
          return { ...p, activeTimeSeconds: p.activeTimeSeconds + 1 };
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [screen]);

  // Simulate networking drops for mock environment
  useEffect(() => {
    if (!simulateTelemetry || screen !== 'classroom') return;
    const id = setInterval(() => {
      setParticipants(prev =>
        prev.map(p => {
          if (p.latency === undefined) return p;
          const latency = clamp(p.latency + drift(15), 15, 400);
          const packetLoss = clamp((p.packetLoss ?? 0) + drift(0.4), 0, 12);
          const jitter = clamp((p.jitter ?? 0) + drift(3), 1, 60);
          const framerate = clamp((p.framerate ?? 30) + drift(2), 12, 30);
          return {
            ...p,
            latency: Math.round(latency),
            packetLoss: Math.round(packetLoss * 10) / 10,
            jitter: Math.round(jitter),
            framerate: Math.round(framerate),
            connectionQuality: qualityFromMetrics(latency, packetLoss, jitter),
          };
        })
      );
    }, 2500);
    return () => clearInterval(id);
  }, [simulateTelemetry, screen]);

  // Keep a reference to the latest participants to avoid resetting the telemetry interval
  const participantsRef = useRef<Participant[]>([]);
  useEffect(() => {
    participantsRef.current = participants;
  }, [participants]);

  // Periodic telemetry ingestion (every 10 seconds)
  useEffect(() => {
    if (screen !== 'classroom' || !sessionId || isMockMode() || sessionId.length !== 36) return;

    const interval = setInterval(async () => {
      const localUser = participantsRef.current.find(p => p.isLocal);
      if (!localUser) return;

      const pingMs = localUser.latency !== undefined ? localUser.latency : 0;
      const packetLoss = localUser.packetLoss !== undefined ? localUser.packetLoss : 0;
      const jitterMs = localUser.jitter !== undefined ? localUser.jitter : 0;
      const bitrateKbps = localUser.bitrate !== undefined ? localUser.bitrate : undefined;
      const fps = localUser.framerate !== undefined ? localUser.framerate : undefined;

      try {
        await api.ingestTelemetry({
          sessionId,
          pingMs,
          packetLoss,
          jitterMs,
          bitrateKbps,
          fps,
        });
      } catch (err) {
        console.error('Failed to ingest telemetry:', err);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [screen, sessionId]);

  // Network Diagnostics rule engine
  useEffect(() => {
    if (screen !== 'classroom') {
      setDiagnosticAlerts([]);
      return;
    }

    const runRuleEngine = () => {
      const alerts: DiagnosticAlert[] = [];
      const now = new Date();

      const participantsWithStats = participants.map(p => {
        let ping = p.latency ?? 30;
        let loss = p.packetLoss ?? 0;
        let jit = p.jitter ?? 2;
        let quality = p.connectionQuality;

        if (simulationMode === 'local' && p.isLocal) {
          ping = 320;
          loss = 8;
          jit = 55;
          quality = 'critical';
        } else if (simulationMode === 'teacher' && p.role === 'teacher') {
          ping = 450;
          loss = 12;
          jit = 75;
          quality = 'critical';
        } else if (simulationMode === 'infrastructure') {
          if (p.isLocal) {
            ping = 280;
            loss = 6;
            jit = 40;
            quality = 'poor';
          } else {
            ping = 350;
            loss = 10;
            jit = 65;
            quality = 'critical';
          }
        }
        return { ...p, latency: ping, packetLoss: loss, jitter: jit, connectionQuality: quality };
      });

      const localUser = participantsWithStats.find(p => p.isLocal);
      const teacher = participantsWithStats.find(p => p.role === 'teacher');

      if (localUser && simulationMode === 'local') {
        alerts.push({
          id: 'alert-local-issue',
          type: 'local',
          level: 'critical',
          title: 'Kết nối mạng của bạn gặp sự cố',
          message: `Hệ thống phát hiện suy hao dữ liệu cao (Packet Loss: ${localUser.packetLoss}%, RTT: ${localUser.latency}ms, Jitter: ${localUser.jitter}ms).`,
          solution: 'Khuyến nghị: Thử di chuyển lại gần bộ phát Wi-Fi, cắm dây mạng LAN trực tiếp, hoặc tạm thời tắt camera của bạn để tiết kiệm băng thông.',
          timestamp: now
        });
      }

      if (teacher && (simulationMode === 'teacher' || (teacher.packetLoss !== undefined && (teacher.packetLoss > 5 || (teacher.latency && teacher.latency > 300))))) {
        alerts.push({
          id: 'alert-teacher-issue',
          type: 'remote',
          level: 'critical',
          title: `Giáo viên ${teacher.name} gặp sự cố kết nối`,
          message: `Đường truyền của giáo viên phụ trách đang bị chập chờn (Packet Loss: ${teacher.packetLoss}%, RTT: ${teacher.latency}ms). Lớp học có thể bị gián đoạn âm thanh hoặc hình ảnh từ giáo viên.`,
          solution: 'Khuyến nghị: Đang chờ giáo viên chuyển hướng kết nối hoặc giảm độ phân giải truyền tải. Học sinh vui lòng kiên nhẫn.',
          timestamp: now
        });
      }

      if (simulationMode === 'infrastructure') {
        alerts.push({
          id: 'alert-infra-issue',
          type: 'infrastructure',
          level: 'critical',
          title: 'Hệ thống máy chủ/Hạ tầng kết nối gặp sự cố diện rộng',
          message: 'Tỷ lệ người dùng gặp cảnh báo kết nối kém vượt quá 30% tổng số lớp học đang hoạt động. Sự cố xảy ra đồng loạt ở nhiều thành viên.',
          solution: 'Khuyến nghị: Ban quản trị hệ thống đang kiểm tra Media Server (Jitsi Bridge) và hạ tầng mạng trung tâm. Lớp học có thể tạm thời chuyển sang chế độ âm thanh.',
          timestamp: now
        });
      }

      setDiagnosticAlerts(alerts.filter(a => !dismissedAlertIds.includes(a.id)));
    };

    const interval = setInterval(runRuleEngine, 3000);
    runRuleEngine();
    return () => clearInterval(interval);
  }, [participants, simulationMode, screen, dismissedAlertIds]);

  // Breakout timer handler
  useEffect(() => {
    let interval: any;
    if (isBreakoutActive && breakoutTimeLeft > 0) {
      interval = setInterval(() => {
        setBreakoutTimeLeft(prev => {
          if (prev <= 1) {
            setIsBreakoutActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isBreakoutActive, breakoutTimeLeft]);

  // Tab Close / Refreshes Event listener to save attendance immediately on crash
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (screen === 'classroom' && sessionId && joinedAtSecondsRef.current) {
        const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/sessions/${sessionId}/attendance/leave`;
        
        // Use sendBeacon for reliable leave notification when browser tab closes
        const data = JSON.stringify({ joinedAtSeconds: joinedAtSecondsRef.current });
        navigator.sendBeacon(url, data);
        jitsiService.disconnect();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [screen, sessionId]);

  const joinSession = async (sessId: string, userName: string, userRole: UserRole) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch Session Token & RoomName from Backend
      const response = await api.joinSession(sessId);
      const { roomId } = response; // roomId will map to Jitsi conference name

      setSessionId(sessId);
      setRoomName(roomId);
      setScreen('classroom');

      const localDevice = getDeviceInfo();
      const localUser: Participant = {
        id: 'local-user',
        name: userName,
        role: userRole,
        isLocal: true,
        isAudioMuted,
        isVideoMuted,
        isHandRaised: false,
        connectionQuality: 'excellent',
        joinedAt: new Date(),
        activeTimeSeconds: 0,
        device: localDevice.deviceType,
        network: localDevice.network,
        networkLabel: localDevice.networkLabel
      };

      if (isMockMode() || sessId.length !== 36) {
        console.log('[MOCK MODE] Bỏ qua Jitsi, dùng dữ liệu mô phỏng cho room:', sessId);
        setSessionId(sessId);
        setRoomName(sessId);
        setScreen('classroom');
        setParticipants(getMockParticipants(userName, userRole));
        setChatMessages(getInitialChatMessages());
        setSimulateTelemetry(true);
        setLoading(false);
        return;
      }

      setParticipants([localUser]);
      setChatMessages([]);

      // 2. Connect Jitsi Meet WebRTC
      jitsiService.connect(roomId, userName, userRole, {
        onLocalTracksReady: (tracks) => {
          const vTrack = tracks.find(t => t.getType() === 'video');
          const aTrack = tracks.find(t => t.getType() === 'audio');
          setParticipants(prev =>
            prev.map(p => p.isLocal ? { ...p, videoTrack: vTrack, audioTrack: aTrack } : p)
          );
        },
        onRemoteTrackAdded: (track) => {
          const pId = track.getParticipantId();
          const type = track.getType();

          if (type === 'video' && track.getVideoType() === 'desktop') {
            setScreenTrack(track);
            setScreenSharingUserId(pId);
            setIsScreenSharing(true);
            return;
          }

          setParticipants(prev => {
            const exists = prev.some(p => p.id === pId);
            if (!exists) {
              const stub: Participant = {
                id: pId,
                name: 'Học sinh mới',
                role: 'student',
                isLocal: false,
                isAudioMuted: type === 'audio' ? false : true,
                isVideoMuted: type === 'video' ? false : true,
                isHandRaised: false,
                connectionQuality: 'excellent',
                joinedAt: new Date(),
                activeTimeSeconds: 0,
                videoTrack: type === 'video' ? track : undefined,
                audioTrack: type === 'audio' ? track : undefined
              };
              return [...prev, stub];
            }
            return prev.map(p => {
              if (p.id === pId) {
                if (type === 'video') return { ...p, videoTrack: track };
                if (type === 'audio') return { ...p, audioTrack: track };
              }
              return p;
            });
          });
        },
        onRemoteTrackRemoved: (track) => {
          const pId = track.getParticipantId();
          const type = track.getType();

          if (type === 'video' && track.getVideoType() === 'desktop') {
            setScreenTrack(null);
            setScreenSharingUserId('');
            setIsScreenSharing(false);
            return;
          }

          setParticipants(prev =>
            prev.map(p => {
              if (p.id === pId) {
                if (type === 'video') return { ...p, videoTrack: undefined };
                if (type === 'audio') return { ...p, audioTrack: undefined };
              }
              return p;
            })
          );
        },
        onLocalScreenShareStopped: () => {
          setScreenTrack(null);
          setScreenSharingUserId('');
          setIsScreenSharing(false);
        },
        onParticipantJoined: (id, displayName, pRole) => {
          setParticipants(prev => {
            const exists = prev.some(p => p.id === id);
            if (exists) {
              return prev.map(p =>
                p.id === id ? { ...p, name: displayName || 'Học sinh', role: roleFromJitsi(pRole) } : p
              );
            }
            return [
              ...prev,
              {
                id,
                name: displayName || 'Học sinh',
                role: pRole === 'moderator' ? 'teacher' : 'student',
                isLocal: false,
                isAudioMuted: false,
                isVideoMuted: false,
                isHandRaised: false,
                connectionQuality: 'excellent',
                joinedAt: new Date(),
                activeTimeSeconds: 0
              }
            ];
          });
        },
        onParticipantLeft: (id) => {
          setParticipants(prev => prev.filter(p => p.id !== id));
        },
        onChatMessageReceived: (senderId, senderName, text, timestamp) => {
          setChatMessages(prev => [
            ...prev,
            {
              id: `msg-${Date.now()}-${Math.random()}`,
              senderId,
              senderName,
              senderRole: senderId === 'local-user' ? userRole : 'student',
              text,
              timestamp: timestamp || new Date()
            }
          ]);
        },
        onDominantSpeakerChanged: (id) => {
          setDominantSpeakerId(id);
        },
        onConnectionStatsReceived: (id, stats) => {
          const rtt = stats.transport?.rtt || 0;
          const loss = stats.transport?.loss || 0;
          const jitter = stats.transport?.jitter || 0;
          const quality = qualityFromMetrics(rtt, loss, jitter);
          setParticipants(prev =>
            prev.map(p => (p.id === id || (p.isLocal && id === 'local-user') ? { ...p, connectionQuality: quality } : p))
          );
        },
        onHandRaiseChanged: (id, isRaised) => {
          setParticipants(prev =>
            prev.map(p =>
              p.id === id || (p.isLocal && id === 'local-user')
                ? { ...p, isHandRaised: isRaised, handRaiseTime: isRaised ? Date.now() : undefined }
                : p
            )
          );
        },
        onLocalStatsUpdated: (stats) => {
          setParticipants(prev =>
            prev.map(p =>
              p.isLocal
                ? {
                    ...p,
                    latency: stats.latency,
                    packetLoss: stats.packetLoss,
                    jitter: stats.jitter,
                    bitrate: stats.bitrate,
                    framerate: stats.framerate,
                  }
                : p
            )
          );
        },
        onParticipantDeviceInfo: (id, info) => {
          setParticipants(prev =>
            prev.map(p =>
              p.id === id ? { ...p, device: info.deviceType, network: info.network, networkLabel: info.networkLabel } : p
            )
          );
        },
        onConferenceJoined: async () => {
          console.log('Classroom conference joined on WebRTC.');
          joinedAtSecondsRef.current = Math.floor(Date.now() / 1000);
          // Log join events to backend attendance
          if (userRole === 'student') {
            try {
              await api.attendanceJoin(sessId);
            } catch (e) {
              console.error('Failed to log attendance join:', e);
            }
          }
        },
        onConnectionFailed: (err) => {
          console.error('Jitsi fail, fallback to mock:', err);
          setParticipants(getMockParticipants(userName, userRole));
          setChatMessages(getInitialChatMessages());
          setSimulateTelemetry(true);
        },
        onConnectionDisconnected: () => {
          console.log('Jitsi disconnected.');
        }
      });
    } catch (err: any) {
      setError(err.message || 'Không thể tham gia phòng học.');
      setScreen('lms');
    } finally {
      setLoading(false);
    }
  };

  const leaveSession = async () => {
    setLoading(true);
    try {
      if (sessionId && joinedAtSecondsRef.current) {
        // Record final leave duration to backend
        try {
          await api.attendanceLeave(sessionId, joinedAtSecondsRef.current);
        } catch (e) {
          console.error('Failed to log attendance leave:', e);
        }
      }
      
      jitsiService.disconnect();
      
      // Clean up local media
      screenStream?.getTracks().forEach(t => t.stop());
      setScreenStream(null);
      setScreenTrack(null);
      setScreenSharingUserId('');
      setShareApproved(false);
      setShareApprovalPending(false);

      setScreen('lms');
      setRoomName('');
      setSessionId(null);
      setParticipants([]);
      setChatMessages([]);
      setIsAudioMuted(false);
      setIsVideoMuted(false);
      setIsScreenSharing(false);
      setIsHandRaised(false);
      setChatOpen(false);
      setPanelOpen(false);
      setDominantSpeakerId('');
      setSimulateTelemetry(false);
      setIsBreakoutActive(false);
      setBreakoutTimeLeft(0);
      joinedAtSecondsRef.current = null;
    } catch (e: any) {
      setError(e.message || 'Lỗi khi rời phòng học.');
    } finally {
      setLoading(false);
    }
  };

  const endSession = async () => {
    if (!sessionId) return;
    setLoading(true);
    try {
      await api.endSession(sessionId);
      await leaveSession();
    } catch (e: any) {
      setError(e.message || 'Không thể đóng buổi học.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAudio = () => {
    setIsAudioMuted(prev => {
      const next = !prev;
      jitsiService.setAudioMuted(next);
      setParticipants(pList => pList.map(p => (p.isLocal ? { ...p, isAudioMuted: next } : p)));
      return next;
    });
  };

  const toggleVideo = () => {
    setIsVideoMuted(prev => {
      const next = !prev;
      jitsiService.setVideoMuted(next);
      setParticipants(pList => pList.map(p => (p.isLocal ? { ...p, isVideoMuted: next } : p)));
      return next;
    });
  };

  const startScreenCapture = async () => {
    if (isMockMode()) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
        stream.getVideoTracks()[0]?.addEventListener('ended', stopScreenShare);
        setScreenStream(stream);
        setIsScreenSharing(true);
        setShareApproved(false);
        setShareApprovalPending(false);
      } catch (err) {
        console.warn('Cancel screen capture:', err);
      }
    } else {
      try {
        const desktopTrack = await jitsiService.startScreenShare();
        setScreenTrack(desktopTrack);
        setScreenSharingUserId('local-user');
        setIsScreenSharing(true);
        setShareApproved(false);
        setShareApprovalPending(false);
      } catch (err) {
        console.warn('Error sharing WebRTC screen:', err);
      }
    }
  };

  const stopScreenShare = () => {
    if (isMockMode()) {
      setScreenStream(prev => {
        prev?.getTracks().forEach(t => t.stop());
        return null;
      });
      setIsScreenSharing(false);
      setShareApproved(false);
      setShareApprovalPending(false);
    } else {
      jitsiService.stopScreenShare()
        .then(() => {
          setScreenTrack(null);
          setScreenSharingUserId('');
          setIsScreenSharing(false);
          setShareApproved(false);
          setShareApprovalPending(false);
        })
        .catch(err => console.error('Error stopping Jitsi screen share:', err));
    }
  };

  const requestScreenShare = () => {
    const isLocalSharing = screenSharingUserId === 'local-user' || (isMockMode() && isScreenSharing && screenStream !== null);
    if (isLocalSharing) {
      stopScreenShare();
      return;
    }
    if (isScreenSharing) return;

    // Check role or approve state
    const user = participants.find(p => p.isLocal);
    const userRole = user?.role || 'student';

    if (isInstructor(userRole as UserRole) || shareApproved) {
      startScreenCapture();
      return;
    }
    setShareApprovalPending(true);
    if (isMockMode()) {
      setTimeout(() => {
        setShareApprovalPending(false);
        setShareApproved(true);
      }, 2000);
    }
  };

  const toggleHandRaise = () => {
    setIsHandRaised(prev => {
      const next = !prev;
      jitsiService.setHandRaised(next);
      setParticipants(pList =>
        pList.map(p => p.isLocal ? { ...p, isHandRaised: next, handRaiseTime: next ? Date.now() : undefined } : p)
      );
      return next;
    });
  };

  const toggleChat = () => {
    setChatOpen(prev => !prev);
    if (!chatOpen) {
      setPanelOpen(true);
      setActiveTab('chat');
    } else if (activeTab === 'chat') {
      setPanelOpen(false);
    }
  };

  const togglePanel = () => {
    setPanelOpen(prev => !prev);
  };

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    jitsiService.sendChatMessage(text);
    const localUser = participants.find(p => p.isLocal);
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'local-user',
      senderName: localUser?.name || 'Me',
      senderRole: localUser?.role || 'student',
      text,
      timestamp: new Date(),
    };
    setChatMessages(prev => [...prev, newMsg]);
  };

  const muteParticipant = (id: string) => {
    setParticipants(pList => pList.map(p => (p.id === id ? { ...p, isAudioMuted: true } : p)));
  };

  const lowerParticipantHand = (id: string) => {
    jitsiService.lowerParticipantHand(id);
    setParticipants(pList =>
      pList.map(p => (p.id === id ? { ...p, isHandRaised: false, handRaiseTime: undefined } : p))
    );
  };

  const dismissAlert = (id: string) => {
    setDismissedAlertIds(prev => [...prev, id]);
    setDiagnosticAlerts(prev => prev.filter(a => a.id !== id));
  };

  const triggerSimulation = (mode: 'none' | 'local' | 'teacher' | 'infrastructure') => {
    setSimulationMode(mode);
    setDismissedAlertIds([]);
  };

  const startBreakout = (rooms: number, mins: number) => {
    setBreakoutRoomsCount(rooms);
    setBreakoutTimeLeft(mins * 60);
    setIsBreakoutActive(true);
  };

  const stopBreakout = () => {
    setIsBreakoutActive(false);
    setBreakoutTimeLeft(0);
  };

  return (
    <MeetingContext.Provider
      value={{
        screen,
        roomName,
        sessionId,
        participants,
        chatMessages,
        raiseHandQueue,
        dominantSpeakerId,
        isAudioMuted,
        isVideoMuted,
        isHandRaised,
        isScreenSharing,
        screenStream,
        screenTrack,
        screenSharingUserId,
        shareApprovalPending,
        shareApproved,
        chatOpen,
        panelOpen,
        activeTab,
        diagnosticAlerts,
        simulationMode,
        isBreakoutActive,
        breakoutTimeLeft,
        breakoutRoomsCount,
        loading,
        error,
        joinSession,
        leaveSession,
        endSession,
        toggleAudio,
        toggleVideo,
        requestScreenShare,
        toggleHandRaise,
        toggleChat,
        togglePanel,
        setActiveTab,
        sendMessage,
        muteParticipant,
        lowerParticipantHand,
        dismissAlert,
        triggerSimulation,
        startBreakout,
        stopBreakout,
      }}
    >
      {children}
    </MeetingContext.Provider>
  );
};

export const useMeeting = () => {
  const context = useContext(MeetingContext);
  if (!context) {
    throw new Error('useMeeting must be used within a MeetingProvider');
  }
  return context;
};
