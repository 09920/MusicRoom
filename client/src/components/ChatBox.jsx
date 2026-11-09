import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Crown, Smile } from 'lucide-react';
import { socket } from '../socket';

const QUICK_EMOJIS = ['🔥', '💃', '❤️', '🎶', '🙌', '✨'];

function formatMessageTime(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ChatBox({ roomId, messages = [], currentSocketId }) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    socket.emit('chat:send', { roomId, text });
    setInputText('');
  };

  const handleQuickEmoji = (emoji) => {
    socket.emit('chat:send', { roomId, text: emoji });
  };

  return (
    <div className="liquid-glass rounded-3xl p-5 shadow-2xl flex flex-col h-[380px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-white/70" />
          <h3 className="font-heading italic text-lg text-white">Live Chat</h3>
        </div>
        <span className="text-[11px] bg-white/10 border border-white/10 text-white/90 font-medium px-2.5 py-0.5 rounded-full font-body">
          {messages.length} {messages.length === 1 ? 'message' : 'messages'}
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 text-xs">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-white/40 py-6">
            <MessageSquare className="w-8 h-8 text-white/20 mb-2 stroke-[1.5]" />
            <p className="font-medium text-white/60 font-body">No messages yet</p>
            <p className="text-[11px] text-white/30 mt-0.5 font-body font-light">
              Say hi or drop a reaction while listening!
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentSocketId;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className="text-[10px] text-white/50 font-medium font-body">
                    {isMe ? 'You' : msg.senderName}
                  </span>
                  {msg.isHost && (
                    <Crown className="w-2.5 h-2.5 text-amber-300 fill-amber-300" title="Host" />
                  )}
                  <span className="text-[9px] text-white/30 font-body">
                    {formatMessageTime(msg.timestamp)}
                  </span>
                </div>

                <div
                  className={`px-3.5 py-2 rounded-2xl max-w-[85%] break-words leading-relaxed text-xs font-body ${
                    isMe
                      ? 'bg-white text-black font-medium rounded-br-sm shadow-md'
                      : 'liquid-glass text-white/90 rounded-bl-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Emojis */}
      <div className="flex items-center justify-between gap-1 sm:gap-1.5 pt-2 pb-1.5 border-t border-white/10 shrink-0 overflow-x-auto scrollbar-none">
        <span className="text-[10px] text-white/40 flex items-center shrink-0 pr-1">
          <Smile className="w-3.5 h-3.5 text-white/40" />
        </span>
        <div className="flex items-center gap-1 sm:gap-1.5 flex-1 justify-between min-w-0">
          {QUICK_EMOJIS.map((emoji, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleQuickEmoji(emoji)}
              className="h-8 min-w-[32px] flex-1 max-w-[42px] rounded-full liquid-glass hover:bg-white/15 text-sm sm:text-base flex items-center justify-center transition-all active:scale-90 shrink-0 border border-white/5"
              title={`React with ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Input Field */}
      <form onSubmit={handleSend} className="relative flex items-center pt-1 shrink-0">
        <input
          type="text"
          placeholder="Say something to the room..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          enterKeyHint="send"
          autoComplete="off"
          maxLength={300}
          className="w-full pl-4 pr-11 py-2.5 rounded-full liquid-glass text-white placeholder-white/30 text-base sm:text-xs focus:outline-none focus:ring-1 focus:ring-white/40 transition-all font-body"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="w-8 h-8 rounded-full bg-white text-black hover:bg-white/90 flex items-center justify-center transition-all absolute right-1.5 active:scale-90 disabled:opacity-30 disabled:hover:bg-white"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
