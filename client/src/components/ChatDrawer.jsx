import React, { useState } from 'react';
import { MessageSquare, X, Send, Users } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { socket } from '../socket';

export default function ChatDrawer() {
  const {
    isChatDrawerOpen,
    setIsChatDrawerOpen,
    activeRoom,
    roomMembers,
    roomMessages
  } = usePlayer();

  const [text, setText] = useState('');

  if (!isChatDrawerOpen || !activeRoom) return null;

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    let savedName = '';
    try { savedName = localStorage.getItem('musicroom_user_name') || 'Guest'; } catch {}

    socket.emit('chat:send', {
      roomId: activeRoom.id,
      text: text.trim(),
      senderName: savedName
    });
    setText('');
  };

  return (
    <div
      onClick={() => setIsChatDrawerOpen(false)}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end justify-center animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-t-3xl liquid-glass-strong border-t border-white/10 p-5 shadow-2xl flex flex-col h-[75vh] animate-in slide-in-from-bottom duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-400" />
            <div>
              <h3 className="font-heading italic text-lg text-white">Room Chat</h3>
              <p className="text-[11px] text-white/50 font-body">
                {activeRoom.id} · {roomMembers.length} active listeners
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsChatDrawerOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all active:scale-90"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2 pr-1">
          {roomMessages.length === 0 ? (
            <div className="py-20 text-center text-white/40">
              <Users className="w-8 h-8 text-white/20 mx-auto mb-2" />
              <p className="text-xs">No chat messages yet</p>
              <p className="text-[11px] text-white/30 font-light mt-0.5">Start the conversation with your friends!</p>
            </div>
          ) : (
            roomMessages.map((msg, idx) => (
              <div key={idx} className="p-2.5 rounded-2xl bg-white/5 border border-white/5 text-xs">
                <span className="font-semibold text-purple-300 block mb-0.5">{msg.senderName}</span>
                <span className="text-white/90">{msg.text}</span>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="flex gap-2 pt-2 border-t border-white/10 shrink-0">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Send message to room..."
            className="flex-1 px-4 py-2.5 rounded-2xl liquid-glass text-xs text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-purple-500/50 border border-white/10"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center justify-center shadow-lg active:scale-95 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

