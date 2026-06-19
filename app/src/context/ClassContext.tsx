import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMockParticipants, getInitialChatMessages } from '../lib/mockData';
import { jitsiService } from '../lib/jitsiService';

export interface Participant {
  id: string;
  name: string;
  role: 'teacher' | 'student';
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
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'teacher' | 'student';
  text: string;
  timestamp: Date;
}

interface ClassContextType {
  screen: 'lms' | 'classroom';
  activePage: 'dashboard' | 'courses' | 'reports' | 'lobby';
  setActivePage: (page: 'dashboard' | 'courses' | 'reports' | 'lobby') => void;
  isAuthenticated: boolean;
  login: (name: string, userRole: 'teacher' | 'student') => void;
  logout: () => void;
  roomName: string;
  userName: string;
  role: 'teacher' | 'student';
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  isScreenSharing: boolean;
  isHandRaised: boolean;
  chatOpen: boolean;
  panelOpen: boolean;
  activeTab: 'chat' | 'attendance';
  participants: Participant[];
  chatMessages: ChatMessage[];
  raiseHandQueue: string[]; // List of participant IDs in order
  dominantSpeakerId: string;
  joinRoom: (room: string, name: string, userRole: 'teacher' | 'student') => void;
  leaveRoom: () => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
  toggleScreenShare: () => void;
  toggleHandRaise: () => void;
  toggleChat: () => void;
  togglePanel: () => void;
  setActiveTab: (tab: 'chat' | 'attendance') => void;
  sendMessage: (text: string) => void;
  muteParticipant: (id: string) => void;
  lowerParticipantHand: (id: string) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ClassContext = createContext<ClassContextType | undefined>(undefined);

export const ClassProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [screen, setScreen] = useState<'lms' | 'classroom'>('lms');
  const [activePage, setActivePage] = useState<'dashboard' | 'courses' | 'reports' | 'lobby'>('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };
  const [roomName, setRoomName] = useState('');
  const [userName, setUserName] = useState('');
  const [role, setRole] = useState<'teacher' | 'student'>('student');
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'attendance'>('chat');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [dominantSpeakerId, setDominantSpeakerId] = useState<string>('');

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

  // Join Room connecting with Jitsi Meet
  const joinRoom = (room: string, name: string, userRole: 'teacher' | 'student') => {
    setRoomName(room);
    setUserName(name);
    setRole(userRole);
    setScreen('classroom');

    // Create local user participant immediately
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
      activeTimeSeconds: 0
    };
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
      onParticipantJoined: (id, displayName, pRole) => {
        setParticipants(prev => {
          const exists = prev.some(p => p.id === id);
          if (exists) {
            return prev.map(p =>
              p.id === id
                ? {
                    ...p,
                    name: displayName || 'Học sinh',
                    role: pRole === 'moderator' ? 'teacher' : 'student'
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
      onConferenceJoined: () => {
        console.log('Conference joined event callback received');
      },
      onConnectionFailed: (error) => {
        console.error('Jitsi Meet failed, falling back to mock environment:', error);
        // Fallback to beautiful Offline/Mock environment so the system is testable
        const mockP = getMockParticipants(name, userRole);
        setParticipants(mockP);
        setChatMessages(getInitialChatMessages());
      },
      onConnectionDisconnected: () => {
        console.log('Jitsi connection disconnected callback received');
      }
    });
  };

  const leaveRoom = () => {
    console.log('Leaving Jitsi room...');
    jitsiService.disconnect();

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

  const login = (name: string, userRole: 'teacher' | 'student') => {
    setUserName(name);
    setRole(userRole);
    setIsAuthenticated(true);
    setScreen('lms');
    setActivePage('dashboard');
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserName('');
    setScreen('lms');
    setActivePage('dashboard');
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
        toggleHandRaise,
        toggleChat,
        togglePanel,
        setActiveTab,
        sendMessage,
        muteParticipant,
        lowerParticipantHand,
        theme,
        toggleTheme,
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
