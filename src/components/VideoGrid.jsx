import { useRef, useEffect, useMemo } from 'react'
import { Mic, MicOff, VideoOff, User } from 'lucide-react'

export default function VideoGrid({
  localStream,
  peers,
  userName,
  audioEnabled,
  videoEnabled,
}) {
  const peerEntries = Object.entries(peers)
  const totalParticipants = 1 + peerEntries.length

  // Pick the right grid class based on participant count
  const gridClass = useMemo(() => {
    if (totalParticipants <= 1) return 'video-grid-1'
    if (totalParticipants === 2) return 'video-grid-2'
    if (totalParticipants === 3) return 'video-grid-3'
    if (totalParticipants === 4) return 'video-grid-4'
    if (totalParticipants === 5) return 'video-grid-5'
    if (totalParticipants === 6) return 'video-grid-6'
    if (totalParticipants === 7) return 'video-grid-7'
    if (totalParticipants === 8) return 'video-grid-8'
    if (totalParticipants === 9) return 'video-grid-9'
    return 'video-grid-many'
  }, [totalParticipants])

  return (
    <div className="video-grid-wrapper">
      <div className={`video-grid ${gridClass}`}>
        {/* Local Video */}
        <VideoTile
          stream={localStream}
          name={`${userName} (You)`}
          audioEnabled={audioEnabled}
          videoEnabled={videoEnabled}
          isLocal={true}
        />

        {/* Remote Videos */}
        {peerEntries.map(([socketId, peer]) => (
          <VideoTile
            key={socketId}
            stream={peer.stream}
            name={peer.name}
            audioEnabled={peer.audioEnabled}
            videoEnabled={peer.videoEnabled}
            isLocal={false}
          />
        ))}
      </div>
    </div>
  )
}

function VideoTile({ stream, name, audioEnabled, videoEnabled, isLocal }) {
  const videoRef = useRef(null)

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  const initials = name
    ?.replace(/\s*\(You\)/, '')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?'

  // Generate a consistent color from the name
  const hue = name
    ? name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360
    : 200

  return (
    <div className="video-tile animate-fade-in">
      {/* Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        className={`video-element ${!videoEnabled ? 'hidden' : ''}`}
        style={{ transform: isLocal ? 'scaleX(-1)' : 'none' }}
      />

      {/* Avatar when video is off */}
      {!videoEnabled && (
        <div className="absolute inset-0 flex items-center justify-center bg-dark-700">
          <div
            className="video-avatar"
            style={{
              background: `linear-gradient(135deg, hsl(${hue}, 60%, 45%), hsl(${hue + 30}, 60%, 35%))`,
            }}
          >
            {initials}
          </div>
        </div>
      )}

      {/* Bottom overlay with name & indicators */}
      <div className="video-name-overlay">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
            <span className="video-name-text">
              {name}
            </span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {!audioEnabled && (
              <div className="video-status-badge">
                <MicOff size={11} className="text-white" />
              </div>
            )}
            {!videoEnabled && (
              <div className="video-status-badge">
                <VideoOff size={11} className="text-white" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
