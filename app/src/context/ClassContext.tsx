import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMockParticipants, getInitialChatMessages } from '../lib/mockData';
import { jitsiService } from '../lib/jitsiService';
import type { UserRole } from '../lib/roles';
import { roleFromJitsi, isInstructor } from '../lib/roles';
import { getDeviceInfo } from '../lib/deviceInfo';
import type { DeviceType, NetworkType } from '../lib/mockData';
import { saveSessionReport } from '../lib/localDb';
import type { SessionReport } from '../lib/localDb';

// Bật chế độ mock (không gọi Jitsi) khi URL có ?mock=true — phục vụ demo/kiểm thử
const isMockMode = () =>
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('mock') === 'true';

// Quy đổi chỉ số mạng -> nhãn chất lượng (đồng bộ ngưỡng với onConnectionStatsReceived)
const qualityFromMetrics = (rtt: number, loss: number, jitter: number): Participant['connectionQuality'] => {
  if (loss > 5 || rtt > 300 || jitter > 50) return 'critical';
  if (loss > 3 || rtt > 200 || jitter > 30) return 'poor';
  if (loss > 1 || rtt > 100 || jitter > 20) return 'good';
  return 'excellent';
};

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const drift = (range: number) => (Math.random() - 0.5) * 2 * range;

export interface Participant {
  id: string;
  name: string;
  role: UserRole;
  isLocal: boolean;
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  isHandRaised: boolean;
  handRaiseTime?: number;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'critical';
  joinedAt: Date;
  activeTimeSeconds: number; // For attendance tracking
  videoTrack?: any; // HTML5 native stream track wrapper
  audioTrack?: any;
  // Telemetry & thiết bị real-time (BRD 7.4 – 7.6)
  latency?: number;
  packetLoss?: number;
  jitter?: number;
  bitrate?: number;
  framerate?: number;
  device?: DeviceType;
  network?: NetworkType;
  networkLabel?: string;
}

// Các trang trong LMS shell — gồm cả trang quản trị (users) và giám sát (monitoring)
export type LmsPage = 'dashboard' | 'courses' | 'reports' | 'lobby' | 'users' | 'monitoring';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  timestamp: Date;
}

export interface DiagnosticAlert {
  id: string;
  type: 'local' | 'remote' | 'infrastructure';
  level: 'warning' | 'critical';
  title: string;
  message: string;
  solution: string;
  timestamp: Date;
}

interface ClassContextType {
  screen: 'lms' | 'classroom';
  activePage: LmsPage;
  setActivePage: (page: LmsPage) => void;
  isAuthenticated: boolean;
  login: (name: string, userRole: UserRole) => void;
  logout: () => void;
  roomName: string;
  userName: string;
  role: UserRole;
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  isScreenSharing: boolean;
  shareApprovalPending: boolean;
  shareApproved: boolean;
  screenStream: MediaStream | null;
  isHandRaised: boolean;
  chatOpen: boolean;
  panelOpen: boolean;
  activeTab: 'chat' | 'attendance';
  participants: Participant[];
  chatMessages: ChatMessage[];
  raiseHandQueue: string[]; // List of participant IDs in order
  dominantSpeakerId: string;
  joinRoom: (room: string, name: string, userRole: UserRole) => void;
  leaveRoom: () => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
  toggleScreenShare: () => void;
  requestScreenShare: () => void;
  toggleHandRaise: () => void;
  toggleChat: () => void;
  togglePanel: () => void;
  setActiveTab: (tab: 'chat' | 'attendance') => void;
  sendMessage: (text: string) => void;
  muteParticipant: (id: string) => void;
  lowerParticipantHand: (id: string) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  screenTrack: any | null;
  screenSharingUserId: string;
  diagnosticAlerts: DiagnosticAlert[];
  dismissAlert: (id: string) => void;
  simulationMode: 'none' | 'local' | 'teacher' | 'infrastructure';
  triggerSimulation: (mode: 'none' | 'local' | 'teacher' | 'infrastructure') => void;
  isBreakoutActive: boolean;
  breakoutTimeLeft: number;
  breakoutRoomsCount: number;
  startBreakout: (rooms: number, mins: number) => void;
  stopBreakout: () => void;
}

const ClassContext = createContext<ClassContextType | undefined>(undefined);

export const ClassProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [screen, setScreen] = useState<'lms' | 'classroom'>('lms');
  const [activePage, setActivePageState] = useState<LmsPage>(() => {
    const hash = window.location.hash.replace('#', '') as LmsPage;
    const validPages: LmsPage[] = ['dashboard', 'courses', 'reports', 'lobby', 'users', 'monitoring'];
    return validPages.includes(hash) ? hash : 'dashboard';
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('isAuthenticated') === 'true';
  });
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
  });

  const setActivePage = (page: LmsPage) => {
    setActivePageState(page);
    window.location.hash = page;
  };

  // Đồng bộ hóa activePage khi URL hash thay đổi (Back/Forward hoặc người dùng gõ URL)
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as LmsPage;
      const validPages: LmsPage[] = ['dashboard', 'courses', 'reports', 'lobby', 'users', 'monitoring'];
      if (validPages.includes(hash)) {
        setActivePageState(hash);
      }
    };

    // Đặt hash ban đầu nếu chưa có hash hợp lệ trên URL
    const currentHash = window.location.hash.replace('#', '') as LmsPage;
    const validPages: LmsPage[] = ['dashboard', 'courses', 'reports', 'lobby', 'users', 'monitoring'];
    if (!validPages.includes(currentHash)) {
      window.location.hash = activePage;
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isAuthenticated, activePage]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };
  const [roomName, setRoomName] = useState('');
  const [userName, setUserName] = useState(() => {
    return sessionStorage.getItem('userName') || '';
  });
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);
  const [role, setRole] = useState<UserRole>(() => {
    return (sessionStorage.getItem('role') as UserRole) || 'student';
  });
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [shareApprovalPending, setShareApprovalPending] = useState(false);
  const [shareApproved, setShareApproved] = useState(false);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [screenTrack, setScreenTrack] = useState<any | null>(null);
  const [screenSharingUserId, setScreenSharingUserId] = useState<string>('');
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'attendance'>('chat');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [dominantSpeakerId, setDominantSpeakerId] = useState<string>('');
  // Bật mô phỏng telemetry (chế độ mock / khi fallback) để các chỉ số "nhảy số" như thật
  const [simulateTelemetry, setSimulateTelemetry] = useState(false);

  // Diagnostics & Simulation States
  const [diagnosticAlerts, setDiagnosticAlerts] = useState<DiagnosticAlert[]>([]);
  const [simulationMode, setSimulationMode] = useState<'none' | 'local' | 'teacher' | 'infrastructure'>('none');
  const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>([]);

  // Breakout Rooms states
  const [isBreakoutActive, setIsBreakoutActive] = useState(false);
  const [breakoutTimeLeft, setBreakoutTimeLeft] = useState(0);
  const [breakoutRoomsCount, setBreakoutRoomsCount] = useState(2);

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

  const startBreakout = (rooms: number, mins: number) => {
    setBreakoutRoomsCount(rooms);
    setBreakoutTimeLeft(mins * 60);
    setIsBreakoutActive(true);
  };

  const stopBreakout = () => {
    setIsBreakoutActive(false);
    setBreakoutTimeLeft(0);
  };

  // Derived state for hand raise queue (FIFO)
  const raiseHandQueue = participants
    .filter(p => p.isHandRaised && p.handRaiseTime)
    .sort((a, b) => (a.handRaiseTime || 0) - (b.handRaiseTime || 0))
    .map(p => p.id);

  // Sync classroom ticks for attendance tracking
  useEffect(() => {
    if (screen !== 'classroom') return;

    const timer = setInterval(() => {
      setParticipants(prev =>
        prev.map(p => {
          // Only increment attendance time for connected participants who are not muted (or all connected ones as per BRD)
          return { ...p, activeTimeSeconds: p.activeTimeSeconds + 1 };
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [screen]);

  // Mô phỏng telemetry biến động khi ở chế độ mock/fallback (BRD 7.5 — demo không cần Jitsi)
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

  // Rule Engine for Network Diagnostics
  useEffect(() => {
    if (screen !== 'classroom') {
      setDiagnosticAlerts([]);
      return;
    }

    const runRuleEngine = () => {
      const alerts: DiagnosticAlert[] = [];
      const now = new Date();

      // Gather current stats of participants (taking simulation mode into account)
      const participantsWithStats = participants.map(p => {
        let ping = p.latency ?? 30;
        let loss = p.packetLoss ?? 0;
        let jit = p.jitter ?? 2;
        let quality = p.connectionQuality;

        // Apply simulation values
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

      // Find local user and teacher
      const localUser = participantsWithStats.find(p => p.isLocal);
      const teacher = participantsWithStats.find(p => p.role === 'teacher');

      // Rule 02: Participant Issue (Local user)
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

      // Rule 01: Host/Teacher Issue
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

      // Rule 03: Infrastructure Issue
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

      // Also check standard conditions (non-simulated) if stats are bad
      if (simulationMode === 'none') {
        if (localUser && localUser.latency !== undefined && localUser.packetLoss !== undefined && localUser.jitter !== undefined) {
          const stats = localUser;
          if (stats.packetLoss > 5 || stats.latency > 300 || stats.jitter > 50) {
            alerts.push({
              id: 'alert-local-auto',
              type: 'local',
              level: 'critical',
              title: 'Cảnh báo: Kết nối mạng của bạn rất yếu',
              message: `Độ trễ (${stats.latency}ms) hoặc mất gói (${stats.packetLoss}%) đang vượt ngưỡng khuyến nghị.`,
              solution: 'Gợi ý: Tắt camera cá nhân hoặc ngắt các kết nối VPN đang hoạt động.',
              timestamp: now
            });
          } else if (stats.packetLoss > 3 || stats.latency > 200 || stats.jitter > 30) {
            alerts.push({
              id: 'alert-local-auto-warn',
              type: 'local',
              level: 'warning',
              title: 'Cảnh báo: Đường truyền không ổn định',
              message: `Độ trễ (${stats.latency}ms) và dao động (${stats.jitter}ms) tăng nhẹ.`,
              solution: 'Gợi ý: Tránh tải file hoặc streaming trong lúc học.',
              timestamp: now
            });
          }
        }

        const badStudents = participantsWithStats.filter(p => !p.isLocal && p.role === 'student' && (p.connectionQuality === 'poor' || p.connectionQuality === 'critical'));
        if (badStudents.length > 0 && badStudents.length < participantsWithStats.length * 0.3) {
          badStudents.slice(0, 1).forEach(s => {
            alerts.push({
              id: `alert-student-${s.id}`,
              type: 'remote',
              level: 'warning',
              title: `Học viên ${s.name} kết nối yếu`,
              message: `Học sinh này đang gặp khó khăn khi tải luồng video/âm thanh của lớp học (Mạng: ${s.connectionQuality === 'critical' ? 'Rất yếu' : 'Yếu'}).`,
              solution: 'Giáo viên có thể đề nghị học sinh này tắt camera của họ hoặc hướng dẫn họ đổi đường truyền mạng.',
              timestamp: now
            });
          });
        } else if (badStudents.length >= participantsWithStats.length * 0.3 && participantsWithStats.length > 2) {
          alerts.push({
            id: 'alert-infra-auto',
            type: 'infrastructure',
            level: 'critical',
            title: 'Nghi vấn: Sự cố hạ tầng phòng học',
            message: `Hơn 30% học viên trong phòng học đồng thời có kết nối mạng yếu hoặc mất kết nối.`,
            solution: 'Kiểm tra xem máy chủ Jitsi Meet có đang quá tải hay không. Quản trị viên đã được thông báo.',
            timestamp: now
          });
        }
      }

      setDiagnosticAlerts(alerts.filter(a => !dismissedAlertIds.includes(a.id)));
    };

    const interval = setInterval(runRuleEngine, 3000);
    runRuleEngine();

    return () => clearInterval(interval);
  }, [participants, simulationMode, screen, dismissedAlertIds]);

  const dismissAlert = (id: string) => {
    setDismissedAlertIds(prev => [...prev, id]);
    setDiagnosticAlerts(prev => prev.filter(a => a.id !== id));
  };

  const triggerSimulation = (mode: 'none' | 'local' | 'teacher' | 'infrastructure') => {
    setSimulationMode(mode);
    setDismissedAlertIds([]);
  };

  // Join Room connecting with Jitsi Meet
  const joinRoom = (room: string, name: string, userRole: UserRole) => {
    setRoomName(room);
    setUserName(name);
    setRole(userRole);
    setScreen('classroom');
    setSessionStartTime(Date.now());

    // Create local user participant immediately (kèm thông tin thiết bị/mạng — không cần chờ Jitsi)
    const localDevice = getDeviceInfo();
    const localUser: Participant = {
      id: 'local-user',
      name: name,
      role: userRole,
      isLocal: true,
      isAudioMuted: isAudioMuted,
      isVideoMuted: isVideoMuted,
      isHandRaised: false,
      connectionQuality: 'excellent',
      joinedAt: new Date(),
      activeTimeSeconds: 0,
      device: localDevice.deviceType,
      network: localDevice.network,
      networkLabel: localDevice.networkLabel
    };
    // Chế độ mock (?mock=true): bỏ qua Jitsi, dựng lớp mô phỏng đầy đủ telemetry để demo/kiểm thử
    if (isMockMode()) {
      console.log('[MOCK MODE] Bỏ qua Jitsi, dùng dữ liệu mô phỏng + telemetry động.');
      setParticipants(getMockParticipants(name, userRole));
      setChatMessages(getInitialChatMessages());
      setSimulateTelemetry(true);
      return;
    }

    setParticipants([localUser]);
    setChatMessages([]);

    console.log('ClassProvider joining Jitsi Room...');

    // Connect to Jitsi Meet XMPP Server
    jitsiService.connect(room, name, userRole, {
      onLocalTracksReady: (tracks) => {
        console.log('Local tracks ready:', tracks);
        const vTrack = tracks.find(t => t.getType() === 'video');
        const aTrack = tracks.find(t => t.getType() === 'audio');
        
        setParticipants(prev =>
          prev.map(p =>
            p.isLocal
              ? { ...p, videoTrack: vTrack, audioTrack: aTrack }
              : p
          )
        );
      },
      onRemoteTrackAdded: (track) => {
        const pId = track.getParticipantId();
        const type = track.getType();

        // Nhận diện remote screen share track
        if (type === 'video' && track.getVideoType() === 'desktop') {
          console.log(`[ClassContext] Remote screen share track added from participant: ${pId}`);
          setScreenTrack(track);
          setScreenSharingUserId(pId);
          setIsScreenSharing(true);
          return;
        }

        console.log(`Remote track added (${type}) for participant: ${pId}`);

        setParticipants(prev => {
          const exists = prev.some(p => p.id === pId);
          if (!exists) {
            // Create a stub participant until USER_JOINED fires
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
          console.log(`[ClassContext] Remote screen share track removed from participant: ${pId}`);
          setScreenTrack(null);
          setScreenSharingUserId('');
          setIsScreenSharing(false);
          return;
        }

        console.log(`Remote track removed (${type}) for participant: ${pId}`);
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
        console.log('[ClassContext] Local screen share stopped callback received');
        setScreenTrack(null);
        setScreenSharingUserId('');
        setIsScreenSharing(false);
      },
      onParticipantJoined: (id, displayName, pRole) => {
        setParticipants(prev => {
          const exists = prev.some(p => p.id === id);
          if (exists) {
            return prev.map(p =>
              p.id === id
                ? {
                    ...p,
                    name: displayName || 'Học sinh',
                    role: roleFromJitsi(pRole)
                  }
                : p
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
            senderRole: senderId === 'local-user' ? role : 'student',
            text,
            timestamp: timestamp || new Date()
          }
        ]);
      },
      onDominantSpeakerChanged: (id) => {
        setDominantSpeakerId(id);
      },
      onConnectionStatsReceived: (id, stats) => {
        // Evaluate connection quality based on latency/rtt, packet loss, and jitter (from BRD specs)
        const rtt = stats.transport?.rtt || 0;
        const loss = stats.transport?.loss || 0;
        const jitter = stats.transport?.jitter || 0;

        let quality: 'excellent' | 'good' | 'poor' | 'critical' = 'excellent';
        
        if (loss > 5 || rtt > 300 || jitter > 50) {
          quality = 'critical';
        } else if (loss > 3 || rtt > 200 || jitter > 30) {
          quality = 'poor';
        } else if (loss > 1 || rtt > 100 || jitter > 20) {
          quality = 'good';
        }

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
        // Telemetry chi tiết của chính mình (BRD 7.5)
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
            p.id === id
              ? { ...p, device: info.deviceType, network: info.network, networkLabel: info.networkLabel }
              : p
          )
        );
      },
      onConferenceJoined: () => {
        console.log('Conference joined event callback received');
      },
      onConnectionFailed: (error) => {
        console.error('Jitsi Meet failed, falling back to mock environment:', error);
        // Fallback to beautiful Offline/Mock environment so the system is testable
        const mockP = getMockParticipants(name, userRole);
        setParticipants(mockP);
        setChatMessages(getInitialChatMessages());
        setSimulateTelemetry(true);
      },
      onConnectionDisconnected: () => {
        console.log('Jitsi connection disconnected callback received');
      }
    });
  };

  const leaveRoom = () => {
    console.log('Leaving Jitsi room...');

    // Tự động tổng hợp kết quả và lưu vào LocalStorage trước khi thoát
    if (roomName && participants.length > 0) {
      const elapsedSeconds = Math.max(1, Math.round((Date.now() - sessionStartTime) / 1000));
      const totalTimeMins = Math.max(1, Math.ceil(elapsedSeconds / 60));
      const students = participants.filter(p => p.role === 'student');
      const avgDurationMins = students.length > 0
        ? Math.round(students.reduce((acc, curr) => acc + Math.ceil(curr.activeTimeSeconds / 60), 0) / students.length)
        : totalTimeMins;

      const qualities = participants.map(p => p.connectionQuality);
      let avgConnectionQuality: SessionReport['avgConnectionQuality'] = 'excellent';
      const counts = { excellent: 0, good: 0, poor: 0, critical: 0 };
      qualities.forEach(q => counts[q] = (counts[q] || 0) + 1);
      if (counts.critical > 0) {
        avgConnectionQuality = 'critical';
      } else if (counts.poor > 0) {
        avgConnectionQuality = 'poor';
      } else if (counts.good > 0) {
        avgConnectionQuality = 'good';
      }

      const today = new Date();
      const dateStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

      const details = participants.map(p => ({
        name: p.name,
        role: p.role === 'teacher' ? 'Giáo viên' : p.role === 'student' ? 'Học sinh' : p.role === 'manager' ? 'Quản lý' : 'Admin',
        presentTimeMins: Math.min(totalTimeMins, Math.max(1, Math.ceil(p.activeTimeSeconds / 60))),
        totalTimeMins: totalTimeMins,
        pct: totalTimeMins > 0 ? Math.round((Math.min(totalTimeMins, Math.max(1, Math.ceil(p.activeTimeSeconds / 60))) / totalTimeMins) * 100) : 100,
        telemetry: {
          ping: p.latency ?? 25,
          jitter: p.jitter ?? 3,
          loss: p.packetLoss ?? 0.1
        }
      }));

      const report: SessionReport = {
        id: 'report-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        roomName: roomName,
        date: dateStr,
        presentStudents: students.length,
        totalStudents: students.length,
        avgDurationMins: Math.min(totalTimeMins, avgDurationMins),
        avgConnectionQuality: avgConnectionQuality,
        details: details
      };

      saveSessionReport(report);
      console.log('Session report saved to local storage:', report);
    }

    jitsiService.disconnect();

    // Dừng luồng chia sẻ màn hình nếu đang bật
    screenStream?.getTracks().forEach(t => t.stop());
    setScreenStream(null);
    setScreenTrack(null);
    setScreenSharingUserId('');
    setShareApproved(false);
    setShareApprovalPending(false);

    setScreen('lms');
    setActivePage('dashboard');
    setRoomName('');
    setUserName('');
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
    
    // Reset breakout rooms
    setIsBreakoutActive(false);
    setBreakoutTimeLeft(0);
  };

  const toggleAudio = () => {
    setIsAudioMuted(prev => {
      const next = !prev;
      jitsiService.setAudioMuted(next);
      setParticipants(pList =>
        pList.map(p => (p.isLocal ? { ...p, isAudioMuted: next } : p))
      );
      return next;
    });
  };

  const toggleVideo = () => {
    setIsVideoMuted(prev => {
      const next = !prev;
      jitsiService.setVideoMuted(next);
      setParticipants(pList =>
        pList.map(p => (p.isLocal ? { ...p, isVideoMuted: next } : p))
      );
      return next;
    });
  };

  const toggleScreenSharing = () => {
    // Screen sharing is mocked visually as slides inside the grid for now,
    // but in Jitsi Meet we trigger local flag toggle.
    setIsScreenSharing(prev => !prev);
  };

  // Bắt đầu chụp màn hình THẬT bằng Screen Capture API (cần là user-gesture)
  const startScreenCapture = async () => {
    if (isMockMode()) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
        // Người dùng bấm "Stop sharing" của trình duyệt -> dừng luôn trong app
        stream.getVideoTracks()[0]?.addEventListener('ended', stopScreenShare);
        setScreenStream(stream);
        setIsScreenSharing(true);
        setShareApproved(false);
        setShareApprovalPending(false);
      } catch (err) {
        // Người dùng bấm Cancel ở hộp chọn màn hình
        console.warn('Hủy/không thể chia sẻ màn hình:', err);
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
        console.warn('Không thể chia sẻ màn hình WebRTC:', err);
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
        .catch(err => console.error('Lỗi khi dừng chia sẻ màn hình WebRTC:', err));
    }
  };

  // Yêu cầu chia sẻ màn hình — GV/Quản lý/Admin share trực tiếp; Học viên phải được GV duyệt.
  const requestScreenShare = () => {
    const isLocalSharing = screenSharingUserId === 'local-user' || (isMockMode() && isScreenSharing && screenStream !== null);
    if (isLocalSharing) {
      stopScreenShare();
      return;
    }
    // Nếu có người khác đang chia sẻ, không làm gì cả
    if (isScreenSharing) {
      return;
    }
    if (isInstructor(role) || shareApproved) {
      startScreenCapture();              // host, hoặc học viên đã được duyệt -> chọn màn hình
      return;
    }
    // Học viên: gửi yêu cầu, chờ giáo viên duyệt
    setShareApprovalPending(true);
    // TODO(backend): gửi yêu cầu qua Jitsi data-channel / BE để GV bấm duyệt.
    // Ở chế độ mock, mô phỏng GV duyệt sau ~2s; sau đó học viên bấm lần nữa để chọn màn hình.
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
        pList.map(p =>
          p.isLocal
            ? { ...p, isHandRaised: next, handRaiseTime: next ? Date.now() : undefined }
            : p
        )
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
    
    // Send to Jitsi
    jitsiService.sendChatMessage(text);

    // Render immediately locally
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'local-user',
      senderName: userName,
      senderRole: role,
      text,
      timestamp: new Date(),
    };
    setChatMessages(prev => [...prev, newMsg]);
  };

  // Instructor Admin Tools
  const muteParticipant = (id: string) => {
    // Jitsi Meet doesn't have an absolute force-mute-remote without moderation tokens,
    // but we simulate it locally to mute their audio player and toggle indicator.
    setParticipants(pList =>
      pList.map(p => (p.id === id ? { ...p, isAudioMuted: true } : p))
    );
  };

  const lowerParticipantHand = (id: string) => {
    jitsiService.lowerParticipantHand(id);
    setParticipants(pList =>
      pList.map(p =>
        p.id === id ? { ...p, isHandRaised: false, handRaiseTime: undefined } : p
      )
    );
  };

  const login = (name: string, userRole: UserRole) => {
    setUserName(name);
    setRole(userRole);
    setIsAuthenticated(true);
    sessionStorage.setItem('isAuthenticated', 'true');
    sessionStorage.setItem('userName', name);
    sessionStorage.setItem('role', userRole);
    setScreen('lms');
    
    // Đọc hash nếu có sẵn từ trước, nếu không thì mặc định là dashboard
    const hash = window.location.hash.replace('#', '') as LmsPage;
    const validPages: LmsPage[] = ['dashboard', 'courses', 'reports', 'lobby', 'users', 'monitoring'];
    if (validPages.includes(hash)) {
      setActivePageState(hash);
    } else {
      setActivePageState('dashboard');
      window.location.hash = 'dashboard';
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserName('');
    setRole('student');
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('userName');
    sessionStorage.removeItem('role');
    setScreen('lms');
    setActivePageState('dashboard');
    window.location.hash = '';
  };

  return (
    <ClassContext.Provider
      value={{
        screen,
        activePage,
        setActivePage,
        isAuthenticated,
        login,
        logout,
        roomName,
        userName,
        role,
        isAudioMuted,
        isVideoMuted,
        isScreenSharing,
        shareApprovalPending,
        shareApproved,
        screenStream,
        isHandRaised,
        chatOpen,
        panelOpen,
        activeTab,
        participants,
        chatMessages,
        raiseHandQueue,
        dominantSpeakerId,
        joinRoom,
        leaveRoom,
        toggleAudio,
        toggleVideo,
        toggleScreenShare: toggleScreenSharing,
        requestScreenShare,
        toggleHandRaise,
        toggleChat,
        togglePanel,
        setActiveTab,
        sendMessage,
        muteParticipant,
        lowerParticipantHand,
        theme,
        toggleTheme,
        screenTrack,
        screenSharingUserId,
        diagnosticAlerts,
        dismissAlert,
        simulationMode,
        triggerSimulation,
        isBreakoutActive,
        breakoutTimeLeft,
        breakoutRoomsCount,
        startBreakout,
        stopBreakout,
      }}
    >
      {children}
    </ClassContext.Provider>
  );
};

export const useClass = () => {
  const context = useContext(ClassContext);
  if (!context) {
    throw new Error('useClass must be used within a ClassProvider');
  }
  return context;
};
