import React from 'react';
import { Volume2, Music } from 'lucide-react';

export default function TapToJoin({ onJoin, roomName }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 border border-purple-500/30 p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl shadow-purple-950/40">
        <div className="w-16 h-16 bg-purple-600/20 text-purple-400 rounded-2xl mx-auto flex items-center justify-center mb-5 border border-purple-500/30">
          <Volume2 className="w-8 h-8 animate-pulse" />
        </div>

        <h3 className="text-xl font-bold text-white mb-2">Join the Music</h3>
        <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
          Browsers require a tap to start playing sound. Tap below to sync with <span className="text-purple-300 font-semibold">{roomName || 'the room'}</span>!
        </p>

        <button
          onClick={onJoin}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-600/25 active:scale-95"
        >
          <Music className="w-5 h-5" />
          Tap to Listen
        </button>
      </div>
    </div>
  );
}

