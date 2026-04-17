import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { io } from 'socket.io-client'
import VideoGrid from '../components/VideoGrid'
import Controls from '../components/Controls'
import ChatPanel from '../components/ChatPanel'
import RoomHeader from '../components/RoomHeader'

const SOCKET_URL = 'http://localhost:3001'

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
}

export default function Room() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const userName = location.state?.userName || 'Anonymous'

  const socketRef = useRef(null)
  const localStreamRef = useRef(null)
  const peersRef = useRef({}) // { socketId: { pc, stream, name } }

  const [localStream, setLocalStream] = useState(null)
  const [peers, setPeers] = useState({}) // { socketId: { stream, name, audioEnabled, videoEnabled } }
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [videoEnabled, setVideoEnabled] = useState(true)
  const [chatOpen, setChatOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [roomUsers, setRoomUsers] = useState([])
  const [connectionStatus, setConnectionStatus] = useState('connecting')

  const chatOpenRef = useRef(chatOpen)
  useEffect(() => {
    chatOpenRef.current = chatOpen
  }, [chatOpen])

  // ─── Create peer connection ─────────────────────────────
  const createPeerConnection = useCallback(
    (remoteSocketId, remoteName, isInitiator) => {
      if (peersRef.current[remoteSocketId]?.pc) {
        peersRef.current[remoteSocketId].pc.close()
      }

      const pc = new RTCPeerConnection(ICE_SERVERS)

      peersRef.current[remoteSocketId] = { pc, name: remoteName, stream: null }

      // Add local tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current)
        })
      }

      // Handle incoming tracks
      pc.ontrack = (event) => {
        const [remoteStream] = event.streams
        peersRef.current[remoteSocketId].stream = remoteStream

        setPeers((prev) => ({
          ...prev,
          [remoteSocketId]: {
            stream: remoteStream,
            name: remoteName,
            audioEnabled: true,
            videoEnabled: true,
          },
        }))
      }

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current?.emit('webrtc:ice-candidate', {
            to: remoteSocketId,
            candidate: event.candidate,
          })
        }
      }

      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
          console.log(`ICE connection ${pc.iceConnectionState} for ${remoteSocketId}`)
        }
      }

      // If initiator, create and send offer
      if (isInitiator) {
        pc.createOffer()
          .then((offer) => pc.setLocalDescription(offer))
          .then(() => {
            socketRef.current?.emit('webrtc:offer', {
              to: remoteSocketId,
              offer: pc.localDescription,
            })
          })
          .catch(console.error)
      }

      return pc
    },
    []
  )

  // ─── Initialize ────────────────────────────────────────
  useEffect(() => {
    let mounted = true

    const init = async () => {
      // Get local media
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        })

        if (!mounted) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }

        localStreamRef.current = stream
        setLocalStream(stream)
      } catch (err) {
        console.error('Media access error:', err)
        // Try audio only
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true })
          if (!mounted) {
            audioStream.getTracks().forEach((t) => t.stop())
            return
          }
          localStreamRef.current = audioStream
          setLocalStream(audioStream)
          setVideoEnabled(false)
        } catch {
          console.error('No media access at all')
        }
      }

      // Connect socket
      const socket = io(SOCKET_URL, { transports: ['websocket'] })
      socketRef.current = socket

      socket.on('connect', () => {
        if (!mounted) return
        setConnectionStatus('connected')
        socket.emit('room:join', { roomId, userName })
      })

      socket.on('connect_error', () => {
        if (!mounted) return
        setConnectionStatus('error')
      })

      // ─── Room events ──────────────────────────────────
      socket.on('room:error', ({ message }) => {
        alert(message)
        navigate('/')
      })

      socket.on('room:existing-users', ({ users }) => {
        // Create peer connections to all existing users (we are the initiator)
        users.forEach(({ socketId, name }) => {
          createPeerConnection(socketId, name, true)
        })
      })

      socket.on('room:user-joined', ({ socketId, name }) => {
        // New user joined — they will send us an offer, so we wait
        createPeerConnection(socketId, name, false)
      })

      socket.on('room:user-left', ({ socketId, name }) => {
        if (peersRef.current[socketId]) {
          peersRef.current[socketId].pc?.close()
          delete peersRef.current[socketId]
        }
        setPeers((prev) => {
          const updated = { ...prev }
          delete updated[socketId]
          return updated
        })
      })

      socket.on('room:users', (data) => {
        setRoomUsers(data.users || [])
      })

      // ─── WebRTC signaling ─────────────────────────────
      socket.on('webrtc:offer', async ({ from, offer }) => {
        let pc = peersRef.current[from]?.pc
        if (!pc) {
          pc = createPeerConnection(from, peersRef.current[from]?.name || 'Peer', false)
        }
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(offer))
          const answer = await pc.createAnswer()
          await pc.setLocalDescription(answer)
          socket.emit('webrtc:answer', { to: from, answer: pc.localDescription })
        } catch (err) {
          console.error('Error handling offer:', err)
        }
      })

      socket.on('webrtc:answer', async ({ from, answer }) => {
        const pc = peersRef.current[from]?.pc
        if (pc) {
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(answer))
          } catch (err) {
            console.error('Error handling answer:', err)
          }
        }
      })

      socket.on('webrtc:ice-candidate', async ({ from, candidate }) => {
        const pc = peersRef.current[from]?.pc
        if (pc) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate))
          } catch (err) {
            console.error('Error adding ICE candidate:', err)
          }
        }
      })

      // ─── Media state ──────────────────────────────────
      socket.on('media:toggled', ({ socketId, type, enabled }) => {
        setPeers((prev) => {
          if (!prev[socketId]) return prev
          return {
            ...prev,
            [socketId]: {
              ...prev[socketId],
              [`${type}Enabled`]: enabled,
            },
          }
        })
      })

      // ─── Chat ─────────────────────────────────────────
      socket.on('chat:history', ({ messages: history }) => {
        setMessages(history)
      })

      socket.on('chat:message', (msg) => {
        setMessages((prev) => [...prev, msg])
        if (!chatOpenRef.current && msg.senderId !== socket.id) {
          setUnreadCount((c) => c + 1)
        }
      })
    }

    init()

    return () => {
      mounted = false
      // Cleanup
      Object.values(peersRef.current).forEach(({ pc }) => pc?.close())
      peersRef.current = {}
      localStreamRef.current?.getTracks().forEach((t) => t.stop())
      socketRef.current?.disconnect()
    }
  }, [roomId, userName, navigate, createPeerConnection])

  // ─── Toggle audio ──────────────────────────────────────
  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setAudioEnabled(audioTrack.enabled)
        socketRef.current?.emit('media:toggle', {
          type: 'audio',
          enabled: audioTrack.enabled,
        })
      }
    }
  }

  // ─── Toggle video ─────────────────────────────────────
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setVideoEnabled(videoTrack.enabled)
        socketRef.current?.emit('media:toggle', {
          type: 'video',
          enabled: videoTrack.enabled,
        })
      }
    }
  }

  // ─── Leave room ────────────────────────────────────────
  const leaveRoom = () => {
    Object.values(peersRef.current).forEach(({ pc }) => pc?.close())
    peersRef.current = {}
    localStreamRef.current?.getTracks().forEach((t) => t.stop())
    socketRef.current?.disconnect()
    navigate('/')
  }

  // ─── Send message ─────────────────────────────────────
  const sendMessage = (message) => {
    if (socketRef.current && message.trim()) {
      socketRef.current.emit('chat:message', { message: message.trim() })
    }
  }

  // ─── Toggle chat ──────────────────────────────────────
  const toggleChat = () => {
    setChatOpen((prev) => {
      if (!prev) setUnreadCount(0)
      return !prev
    })
  }

  return (
    <div className="room-layout">
      <RoomHeader
        roomId={roomId}
        userCount={roomUsers.length}
        connectionStatus={connectionStatus}
      />

      <div className="room-content">
        {/* Video Grid */}
        <div className="room-video-area">
          <VideoGrid
            localStream={localStream}
            peers={peers}
            userName={userName}
            audioEnabled={audioEnabled}
            videoEnabled={videoEnabled}
          />
        </div>

        {/* Chat Panel */}
        <ChatPanel
          isOpen={chatOpen}
          messages={messages}
          onSend={sendMessage}
          onClose={() => setChatOpen(false)}
          currentSocketId={socketRef.current?.id}
        />
      </div>

      <Controls
        audioEnabled={audioEnabled}
        videoEnabled={videoEnabled}
        chatOpen={chatOpen}
        unreadCount={unreadCount}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        onToggleChat={toggleChat}
        onLeave={leaveRoom}
      />
    </div>
  )
}
