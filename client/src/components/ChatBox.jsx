import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Crown, Smile } from 'lucide-react';
import { socket } from '../socket';

const QUICK_EMOJIS = ['🔥', '💃', '❤️', '🎶', '🙌', '✨'];

function formatMessageTime(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ChatBox({ messages = [], currentSocketId }) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    socket.emit('chat:send', { text });
    setInputText('');
  };

  const handleQuickEmoji = (emoji) => {
    socket.emit('chat:send', { text: emoji });
  };

  return (
    <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/80 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xl flex flex-col h-[380px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-semibold text-zinc-200">Room Chat</h3>
        </div>
        <span className="text-[11px] text-zinc-500 font-medium">
          {messages.length} messages
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 text-xs">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500 py-6">
            <MessageSquare className="w-8 h-8 text-zinc-700 mb-2 stroke-[1.5]" />
            <p className="font-medium text-zinc-400">No messages yet</p>
            <p className="text-[11px] text-zinc-600 mt-0.5">
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
                {/* Sender Name & Badge */}
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className="text-[10px] text-zinc-400 font-semibold">
                    {isMe ? 'You' : msg.senderName}
                  </span>
                  {msg.isHost && (
                    <Crown className="w-2.5 h-2.5 text-amber-400 fill-amber-400" title="Host" />
                  )}
                  <span className="text-[9px] text-zinc-600">
                    {formatMessageTime(msg.timestamp)}
                  </span>
                </div>

                {/* Message Bubble */}
                <div
                  className={`px-3.5 py-2 rounded-2xl max-w-[85%] break-words leading-relaxed ${
                    isMe
                      ? 'bg-purple-600 text-white rounded-br-sm shadow-sm shadow-purple-600/30'
                      : 'bg-zinc-800 text-zinc-200 rounded-bl-sm border border-zinc-750'
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

      {/* Quick Emojis Row */}
      <div className="flex items-center gap-1.5 pt-2 pb-1.5 px-0.5 border-t border-zinc-800/80 shrink-0">
        <span className="text-[10px] text-zinc-500 mr-1 flex items-center gap-1">
          <Smile className="w-3 h-3 text-zinc-500" />
        </span>
        {QUICK_EMOJIS.map((emoji, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleQuickEmoji(emoji)}
            className="w-7 h-7 rounded-lg bg-zinc-800/60 hover:bg-zinc-700/80 text-xs flex items-center justify-center transition-all active:scale-90"
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Input Field */}
      <form onSubmit={handleSend} className="relative flex items-center pt-1 shrink-0">
        <input
          type="text"
          placeholder="Type a message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          maxLength={300}
          className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-purple-500 transition-colors"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-1.5 rounded-lg text-purple-400 hover:text-white hover:bg-purple-600 transition-all absolute right-2 disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

