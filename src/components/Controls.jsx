import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MessageSquare,
  PhoneOff,
} from 'lucide-react'

export default function Controls({
  audioEnabled,
  videoEnabled,
  chatOpen,
  unreadCount,
  onToggleAudio,
  onToggleVideo,
  onToggleChat,
  onLeave,
}) {
  return (
    <div className="controls-bar">
      {/* Audio Toggle */}
      <button
        id="btn-toggle-audio"
        onClick={onToggleAudio}
        className={`control-btn tooltip ${audioEnabled ? 'control-btn-default' : 'control-btn-muted'}`}
        data-tooltip={audioEnabled ? 'Mute microphone' : 'Unmute microphone'}
      >
        {audioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
      </button>

      {/* Video Toggle */}
      <button
        id="btn-toggle-video"
        onClick={onToggleVideo}
        className={`control-btn tooltip ${videoEnabled ? 'control-btn-default' : 'control-btn-muted'}`}
        data-tooltip={videoEnabled ? 'Turn off camera' : 'Turn on camera'}
      >
        {videoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
      </button>

      {/* Chat Toggle */}
      <button
        id="btn-toggle-chat"
        onClick={onToggleChat}
        className={`control-btn tooltip ${chatOpen ? 'control-btn-active' : 'control-btn-default'}`}
        data-tooltip={chatOpen ? 'Close chat' : 'Open chat'}
      >
        <MessageSquare size={20} />
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Leave Call */}
      <button
        id="btn-leave"
        onClick={onLeave}
        className="control-btn control-btn-danger tooltip control-btn-leave"
        data-tooltip="Leave call"
      >
        <PhoneOff size={20} />
      </button>
    </div>
  )
}
