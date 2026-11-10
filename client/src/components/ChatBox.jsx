import React, { useState, useEffect, useRef } from 'react';
import { Send, Music2, Sparkles, Crown } from 'lucide-react';
import { socket } from '../socket';

const QUICK_EMOJIS = ['🔥', '❤️', '🎵', '👏'];

function formatMessageTime(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ChatBox({
  roomId,
  messages = [],
  currentSocketId,
  currentSong = null,
  hostName = 'Host'
}) {
  const [inputText, setInputText] = useState('');
  const [floatingReactions, setFloatingReactions] = useState([]);
  const chatScrollContainerRef = useRef(null);

  useEffect(() => {
    if (chatScrollContainerRef.current) {
      chatScrollContainerRef.current.scrollTo({
        top: chatScrollContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  const spawnReaction = (emoji) => {
    const id = Date.now() + Math.random();
    const rot = Math.random() * 40 - 20;
    setFloatingReactions((prev) => [...prev, { id, emoji, rot }]);
    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== id));
    }, 1200);
  };

  const handleSend = (e) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    socket.emit('chat:send', { roomId, text });
    setInputText('');
    spawnReaction('🎵');
  };

  const handleQuickEmoji = (emoji) => {
    socket.emit('chat:send', { roomId, text: emoji });
    spawnReaction(emoji);
  };

  return (
    <div className="relative flex flex-col h-[480px] rounded-2xl bg-surface-container-low border border-white/5 overflow-hidden shadow-2xl">
      {/* Floating Reactions Rail (Right side) */}
      <div className="pointer-events-none absolute right-4 bottom-20 top-0 w-14 overflow-hidden flex flex-col items-center justify-end z-30">
        {floatingReactions.map((r) => (
          <div
            key={r.id}
            className="text-2xl animate-[floatUp_1.1s_ease-out_forwards] drop-shadow-[0_0_8px_rgba(76,215,246,0.8)]"
            style={{ transform: `rotate(${r.rot}deg)` }}
          >
            {r.emoji}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between p-3.5 border-b border-white/5 bg-surface-container/60 shrink-0">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
          <h3 className="font-title-md text-sm font-bold text-on-surface">Live Chat</h3>
        </div>
        <span className="text-[11px] bg-surface-container-high px-2.5 py-0.5 rounded-full text-on-surface-variant font-medium border border-white/5">
          {messages.length} {messages.length === 1 ? 'Message' : 'Messages'}
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div ref={chatScrollContainerRef} className="flex-1 overflow-y-auto p-3.5 space-y-3 pr-1.5 text-xs">
        {/* System Event Pill (Current Song Sync) */}
        {currentSong && (
          <div className="flex items-center justify-center my-1.5">
            <div className="px-3 py-1.5 rounded-full bg-surface-container-high/70 backdrop-blur-md flex items-center gap-2 max-w-full shadow-sm border border-white/5">
              <Music2 className="w-3.5 h-3.5 text-secondary animate-[spin_5s_linear_infinite]" />
              <p className="text-[11px] text-on-surface-variant truncate">
                <span className="text-secondary font-semibold">Now Streaming:</span>{' '}
                {currentSong.title}{' '}
                <span className="text-primary/90 font-medium">(Synced by {currentSong.addedBy || hostName})</span>
              </p>
            </div>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-on-surface-variant py-8">
            <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center mb-2 border border-white/5">
              <Sparkles className="w-5 h-5 text-secondary" />
            </div>
            <p className="font-semibold text-xs text-on-surface">No messages yet</p>
            <p className="text-[11px] text-outline mt-0.5">
              Drop an emoji or say hi to everyone in the room!
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentSocketId;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[88%] ${
                  isMe ? 'self-end' : 'self-start'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  {!isMe && (
                    <div className="w-5 h-5 rounded-full bg-surface-container-highest flex items-center justify-center text-[10px] font-bold text-secondary uppercase">
                      {msg.senderName?.charAt(0) || 'U'}
                    </div>
                  )}
                  <span
                    className={`text-[11px] font-bold ${
                      isMe
                        ? 'text-primary-fixed-dim'
                        : msg.isHost
                        ? 'text-primary'
                        : 'text-on-surface'
                    }`}
                  >
                    {isMe ? 'You' : msg.senderName}
                  </span>
                  {msg.isHost && (
                    <span className="px-1.5 py-0.2 rounded-full bg-on-primary-fixed text-primary-fixed text-[9px] font-bold flex items-center gap-0.5">
                      <Crown className="w-2.5 h-2.5" /> HOST
                    </span>
                  )}
                  <span className="text-[10px] text-outline">
                    {formatMessageTime(msg.timestamp)}
                  </span>
                </div>

                <div
                  className={`p-3 rounded-2xl break-words text-xs leading-relaxed shadow-sm ${
                    isMe
                      ? 'rounded-tr-sm bg-primary-container text-on-primary-container shadow-[0_4px_18px_rgba(160,120,255,0.3)] font-medium'
                      : 'rounded-tl-sm bg-surface-container-high/90 backdrop-blur-md text-on-surface border border-white/5'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}

      </div>

      {/* Sticky Bottom Dock: Reactions & Input */}
      <div className="p-2.5 border-t border-white/5 bg-surface-container-lowest/80 backdrop-blur-xl flex flex-col gap-2 shrink-0">
        {/* Quick Reaction Pills */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleQuickEmoji(emoji)}
                className="w-8 h-8 rounded-full bg-surface-container-high hover:bg-surface-bright flex items-center justify-center text-sm shadow-sm active:scale-90 transition-transform border border-white/5"
                title={`React with ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>

          <span className="text-[11px] text-secondary font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
            Realtime Chat
          </span>
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="flex items-center gap-2 p-1 rounded-full bg-surface-container-high/95 backdrop-blur-xl border border-white/5 shadow-inner">
          <input
            type="text"
            placeholder="Send a message or request a song..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-transparent text-on-surface placeholder:text-outline text-xs outline-none px-3"
            maxLength={300}
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="w-8 h-8 rounded-full bg-primary-container hover:bg-primary text-on-primary-container flex items-center justify-center shadow-[0_0_14px_rgba(160,120,255,0.5)] active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
