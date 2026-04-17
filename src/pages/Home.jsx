import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import { Video, Users, MessageSquare, Shield, Zap, Globe } from 'lucide-react'

// const SOCKET_URL = 'http://localhost:3001'
const SOCKET_URL = 'http://192.168.1.7:3001'

export default function Home() {
  const [userName, setUserName] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [activeTab, setActiveTab] = useState('create') // 'create' | 'join'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleCreateRoom = async () => {
    if (!userName.trim()) {
      setError('Please enter your name')
      return
    }
    setLoading(true)
    setError('')

    const socket = io(SOCKET_URL, { transports: ['websocket'] })

    socket.on('connect', () => {
      socket.emit('room:create', { userName: userName.trim() }, ({ roomId }) => {
        socket.disconnect()
        navigate(`/room/${roomId}`, { state: { userName: userName.trim() } })
      })
    })

    socket.on('connect_error', () => {
      setError('Cannot connect to server. Make sure the server is running.')
      setLoading(false)
    })

    setTimeout(() => {
      if (loading) {
        setError('Connection timeout. Please try again.')
        setLoading(false)
      }
    }, 5000)
  }

  const handleJoinRoom = async () => {
    if (!userName.trim()) {
      setError('Please enter your name')
      return
    }
    if (!roomCode.trim()) {
      setError('Please enter a room code')
      return
    }
    setLoading(true)
    setError('')

    const socket = io(SOCKET_URL, { transports: ['websocket'] })

    socket.on('connect', () => {
      socket.emit('room:check', { roomId: roomCode.trim().toLowerCase() }, ({ exists }) => {
        socket.disconnect()
        if (exists) {
          navigate(`/room/${roomCode.trim().toLowerCase()}`, {
            state: { userName: userName.trim() },
          })
        } else {
          setError('Room not found. Check the code and try again.')
          setLoading(false)
        }
      })
    })

    socket.on('connect_error', () => {
      setError('Cannot connect to server. Make sure the server is running.')
      setLoading(false)
    })
  }

  const features = [
    {
      icon: <Video size={24} />,
      title: 'HD Video Calls',
      desc: 'Crystal-clear video with adaptive quality',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: <MessageSquare size={24} />,
      title: 'Live Chat',
      desc: 'Real-time messaging during calls',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: <Shield size={24} />,
      title: 'Peer-to-Peer',
      desc: 'Direct encrypted connections via WebRTC',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: <Zap size={24} />,
      title: 'Instant Rooms',
      desc: 'Create and share in seconds',
      color: 'from-yellow-500 to-orange-500',
    },
  ]

  return (
    <div className="h-full w-full overflow-auto bg-dark-900 relative" style={{ WebkitOverflowScrolling: 'touch' }}>
      {/* Animated background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-accent-blue/10 rounded-full blur-[100px] animate-float" />
        <div
          className="absolute top-1/3 -right-20 w-80 h-80 bg-accent-purple/10 rounded-full blur-[100px] animate-float"
          style={{ animationDelay: '1s' }}
        />
        <div
          className="absolute -bottom-40 left-1/3 w-96 h-96 bg-accent-cyan/8 rounded-full blur-[100px] animate-float"
          style={{ animationDelay: '2s' }}
        />
      </div>

      <div className="relative z-10 min-h-full flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-4 sm:px-6 md:px-8 py-3 sm:py-5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center">
              <Video size={18} className="text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-white tracking-tight">Meet2</span>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-white/40">
            <Globe size={14} />
            <span className="hidden sm:inline">Peer-to-Peer Encrypted</span>
            <span className="sm:hidden">P2P</span>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-6 sm:py-8">
          <div className="max-w-5xl w-full flex flex-col lg:flex-row items-center gap-8 sm:gap-12 lg:gap-16">
            {/* Left — Hero */}
            <div className="flex-1 text-center lg:text-left animate-slide-up">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 sm:mb-6">
                <span className="text-white">Video calls</span>
                <br />
                <span className="bg-gradient-to-r from-accent-blue via-accent-purple to-accent-cyan bg-clip-text text-transparent animate-gradient">
                  made simple
                </span>
              </h1>
              <p className="text-base sm:text-lg text-white/50 max-w-md mx-auto lg:mx-0 mb-6 sm:mb-10 leading-relaxed">
                Premium video conferencing with crystal-clear audio, real-time chat,
                and seamless peer-to-peer connections. No sign-up needed.
              </p>

              {/* Feature Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-md mx-auto lg:mx-0">
                {features.map((f, i) => (
                  <div
                    key={i}
                    className="glass-card-sm p-3 sm:p-4 flex items-start gap-3 hover:bg-white/[0.08] transition-colors cursor-default"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <div
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br ${f.color} flex items-center justify-center flex-shrink-0`}
                    >
                      {f.icon}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{f.title}</div>
                      <div className="text-xs text-white/40 mt-0.5">{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Form Card */}
            <div
              className="w-full max-w-md animate-slide-up"
              style={{ animationDelay: '0.2s' }}
            >
              <div className="glass-card p-5 sm:p-6 md:p-8">
                {/* Tabs */}
                <div className="flex gap-1 p-1 bg-dark-800 rounded-xl mb-6">
                  <button
                    id="tab-create"
                    onClick={() => { setActiveTab('create'); setError('') }}
                    className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all ${activeTab === 'create'
                      ? 'bg-gradient-to-r from-accent-blue to-accent-purple text-white shadow-lg'
                      : 'text-white/50 hover:text-white/70'
                      }`}
                  >
                    Create Room
                  </button>
                  <button
                    id="tab-join"
                    onClick={() => { setActiveTab('join'); setError('') }}
                    className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all ${activeTab === 'join'
                      ? 'bg-gradient-to-r from-accent-blue to-accent-purple text-white shadow-lg'
                      : 'text-white/50 hover:text-white/70'
                      }`}
                  >
                    Join Room
                  </button>
                </div>

                {/* Name Input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    Your Name
                  </label>
                  <input
                    id="input-name"
                    type="text"
                    className="input-modern"
                    placeholder="Enter your name..."
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    maxLength={30}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        activeTab === 'create' ? handleCreateRoom() : handleJoinRoom()
                      }
                    }}
                  />
                </div>

                {/* Room Code (join only) */}
                {activeTab === 'join' && (
                  <div className="mb-4 animate-fade-in">
                    <label className="block text-sm font-medium text-white/60 mb-2">
                      Room Code
                    </label>
                    <input
                      id="input-room-code"
                      type="text"
                      className="input-modern"
                      placeholder="e.g., abc-defg-hij"
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleJoinRoom()
                      }}
                    />
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="mb-4 px-4 py-3 rounded-xl bg-accent-red/10 border border-accent-red/20 text-accent-red text-sm animate-fade-in">
                    {error}
                  </div>
                )}

                {/* Action Button */}
                <button
                  id="btn-action"
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  onClick={activeTab === 'create' ? handleCreateRoom : handleJoinRoom}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {activeTab === 'create' ? (
                        <>
                          <Video size={18} />
                          Create New Room
                        </>
                      ) : (
                        <>
                          <Users size={18} />
                          Join Room
                        </>
                      )}
                    </>
                  )}
                </button>

                {/* Info */}
                <p className="text-center text-xs text-white/30 mt-5">
                  {activeTab === 'create'
                    ? 'A unique room code will be generated for you to share'
                    : 'Enter the room code shared by the host to join'}
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center py-3 sm:py-5 text-[10px] sm:text-xs text-white/20">
          Built with WebRTC & Socket.io — Peer-to-peer encrypted
        </footer>
      </div>
    </div>
  )
}
