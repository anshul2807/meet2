import { useState } from 'react'
import { Copy, Check, Users, Shield, Video } from 'lucide-react'

export default function RoomHeader({ roomId, userCount, connectionStatus }) {
  const [copied, setCopied] = useState(false)

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="room-header">
      {/* Left — Logo + Room ID */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center">
            <Video size={14} className="text-white sm:hidden" />
            <Video size={16} className="text-white hidden sm:block" />
          </div>
          <span className="text-sm sm:text-base font-bold text-white hidden sm:block">Meet2</span>
        </div>

        <div className="h-5 sm:h-6 w-px bg-white/10 flex-shrink-0" />

        {/* Room Code */}
        <button
          id="btn-copy-room-id"
          onClick={copyRoomId}
          className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-dark-600/80 hover:bg-dark-500 border border-glass-border transition-all group min-w-0"
        >
          <span className="text-xs sm:text-sm font-mono text-white/70 group-hover:text-white transition-colors truncate">
            {roomId}
          </span>
          {copied ? (
            <Check size={14} className="text-accent-green flex-shrink-0" />
          ) : (
            <Copy size={14} className="text-white/40 group-hover:text-white/70 transition-colors flex-shrink-0" />
          )}
        </button>
        {copied && (
          <span className="text-xs text-accent-green animate-fade-in hidden sm:inline">Copied!</span>
        )}
      </div>

      {/* Right — Status */}
      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        {/* Connection status */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div
            className={`w-2 h-2 rounded-full flex-shrink-0 ${
              connectionStatus === 'connected'
                ? 'bg-accent-green'
                : connectionStatus === 'error'
                ? 'bg-accent-red'
                : 'bg-accent-yellow animate-pulse'
            }`}
          />
          <span className="text-xs text-white/40 hidden md:block">
            {connectionStatus === 'connected'
              ? 'Connected'
              : connectionStatus === 'error'
              ? 'Disconnected'
              : 'Connecting...'}
          </span>
        </div>

        {/* User count */}
        <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-dark-600/50">
          <Users size={13} className="text-white/50" />
          <span className="text-xs sm:text-sm font-medium text-white/70">{userCount}</span>
        </div>

        {/* Security badge */}
        <div className="items-center gap-1.5 text-white/30 hidden lg:flex">
          <Shield size={14} />
          <span className="text-xs">P2P Encrypted</span>
        </div>
      </div>
    </div>
  )
}
