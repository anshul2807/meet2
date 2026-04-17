import { useState, useRef, useEffect } from 'react'
import { X, Send } from 'lucide-react'

export default function ChatPanel({ isOpen, messages, onSend, onClose, currentSocketId }) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  const handleSend = () => {
    if (input.trim()) {
      onSend(input.trim())
      setInput('')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="chat-backdrop"
          onClick={onClose}
        />
      )}

      <div className={`chat-panel-container ${isOpen ? 'chat-container-open' : ''}`}>
        {isOpen && (
          <div className="chat-panel">
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-glass-border flex-shrink-0">
              <h3 className="text-sm sm:text-base font-semibold text-white">In-call messages</h3>
              <button
                id="btn-close-chat"
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 sm:py-4 space-y-3 min-h-0">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-6 sm:px-8">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-dark-600 flex items-center justify-center mb-3 sm:mb-4">
                    <Send size={22} className="text-white/30" />
                  </div>
                  <p className="text-xs sm:text-sm text-white/40 leading-relaxed">
                    Messages are only visible to people in the call and are deleted when the call ends.
                  </p>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isSelf = msg.senderId === currentSocketId
                  const showSender =
                    i === 0 || messages[i - 1]?.senderId !== msg.senderId

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'} animate-fade-in`}
                    >
                      {showSender && (
                        <span
                          className={`text-xs font-medium mb-1 px-1 ${
                            isSelf ? 'text-accent-blue' : 'text-white/50'
                          }`}
                        >
                          {isSelf ? 'You' : msg.sender}
                        </span>
                      )}
                      <div
                        className={`chat-bubble ${
                          isSelf ? 'chat-bubble-self' : 'chat-bubble-other'
                        }`}
                      >
                        {msg.message}
                      </div>
                      <span className="text-[10px] text-white/25 mt-1 px-1">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-t border-glass-border flex-shrink-0">
              <div className="flex items-center gap-2 bg-dark-700 rounded-xl px-3 sm:px-4 py-2 border border-glass-border focus-within:border-accent-blue/50 transition-colors">
                <input
                  ref={inputRef}
                  id="input-chat-message"
                  type="text"
                  placeholder="Send a message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30 min-w-0"
                  maxLength={500}
                />
                <button
                  id="btn-send-message"
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-accent-blue hover:bg-accent-blue/10 disabled:text-white/20 disabled:hover:bg-transparent transition-all flex-shrink-0"
                >
                  <Send size={16} />
                </button>
              </div>
              <p className="text-[10px] text-white/20 mt-1.5 sm:mt-2 text-center">
                Messages are deleted when the call ends
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
