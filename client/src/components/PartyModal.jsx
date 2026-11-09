import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { socket } from '../socket';

export default function PartyModal() {
  const {
    isPartyModalOpen,
    setIsPartyModalOpen,
    activeRoom,
    joinPartyRoom,
    leavePartyRoom,
    roomMembers,
    currentSong,
    queue,
    nextSong,
    roomMessages,
    playSong
  } = usePlayer();

  const [tab, setTab] = useState('join'); // 'join' | 'create'
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [userNameInput, setUserNameInput] = useState(() => {
    try { return localStorage.getItem('musicroom_user_name') || 'Listener'; } catch { return 'Listener'; }
  });
  const [newRoomName, setNewRoomName] = useState('Neon Lounge');
  const [copied, setCopied] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [skipVotes, setSkipVotes] = useState(1);
  const [hasVotedSkip, setHasVotedSkip] = useState(false);

  if (!isPartyModalOpen) return null;

  const handleCopyInvite = () => {
    const url = `${window.location.origin}/?room=${activeRoom?.id || 'demo'}`;
    navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateRoom = (e) => {
    e.preventDefault();
    if (!userNameInput.trim()) return;
    try { localStorage.setItem('musicroom_user_name', userNameInput.trim()); } catch {}
    const generatedId = Math.random().toString(36).substring(2, 6).toUpperCase();
    joinPartyRoom(generatedId, userNameInput.trim(), true);
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!roomCodeInput.trim() || !userNameInput.trim()) return;
    try { localStorage.setItem('musicroom_user_name', userNameInput.trim()); } catch {}
    joinPartyRoom(roomCodeInput.trim().toUpperCase(), userNameInput.trim(), false);
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeRoom) return;
    socket.emit('chat:send', {
      roomId: activeRoom.id,
      text: chatInput.trim(),
      senderName: userNameInput || 'Guest'
    });
    setChatInput('');
  };

  const handleVoteSkip = () => {
    if (hasVotedSkip) return;
    setHasVotedSkip(true);
    setSkipVotes((prev) => prev + 1);
    if (skipVotes + 1 >= Math.max(2, Math.ceil((roomMembers?.length || 2) / 2))) {
      nextSong();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-surface-container-lowest/80 backdrop-blur-md flex items-center justify-center p-gutter overflow-y-auto select-none">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl rounded-xl bg-surface-container-low shadow-[0_24px_64px_rgba(0,0,0,0.85)] flex flex-col my-auto overflow-hidden border border-surface-container-high/60 max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-space-lg pb-space-md flex items-start justify-between border-b border-surface-container-high bg-surface-container/40">
          <div className="flex items-start gap-space-sm">
            <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary flex-shrink-0">
              <span className="material-symbols-outlined text-headline-sm">podcasts</span>
            </div>
            <div>
              <div className="flex items-center gap-space-xs flex-wrap">
                <h1 className="font-headline text-headline-sm font-bold text-on-surface tracking-tight">
                  {activeRoom ? activeRoom.name || `Aux Room #${activeRoom.id}` : 'Collaborative Aux Room'}
                </h1>
                {activeRoom && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                    Open Queue (Anyone can add)
                  </span>
                )}
              </div>
              <p className="font-body text-body-sm text-on-surface-variant mt-0.5">
                {activeRoom
                  ? `Hosted in real-time • ${roomMembers.length} listening in sync`
                  : 'Listen to synchronized music with friends with 0 latency.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-space-xs">
            {activeRoom && (
              <button
                type="button"
                onClick={handleCopyInvite}
                className="inline-flex items-center gap-space-xs px-3.5 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-title text-title-sm transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-title-md text-outline">
                  {copied ? 'check' : 'content_copy'}
                </span>
                <span>{copied ? 'Copied Link!' : 'Invite'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsPartyModalOpen(false)}
              className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors"
              title="Close modal"
            >
              <span className="material-symbols-outlined text-title-md">close</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-space-lg overflow-y-auto max-h-[calc(90vh-140px)] flex flex-col gap-space-lg">
          {activeRoom ? (
            /* Active Room Layout: Left (Now Playing & Queue) + Right (Members & Chat) */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
              
              {/* Left Column (7 cols) */}
              <div className="lg:col-span-7 flex flex-col gap-space-md">
                
                {/* Currently Playing Card */}
                <section className="bg-surface-container rounded-xl p-space-md shadow-sm flex flex-col gap-space-md border border-surface-container-high/40">
                  <div className="flex items-center justify-between">
                    <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">
                      Now Playing
                    </span>
                    <span className="font-label-sm text-label-sm px-2 py-0.5 rounded bg-surface-container-high text-secondary font-metric-mono">
                      Synchronized Audio
                    </span>
                  </div>

                  {currentSong ? (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-space-md">
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-surface-container-high flex-shrink-0 shadow">
                        <img
                          src={currentSong.thumbnail || `https://i.ytimg.com/vi/${currentSong.videoId}/hqdefault.jpg`}
                          alt={currentSong.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col justify-between flex-1 min-w-0 w-full gap-space-xs">
                        <h2 className="font-title text-title-lg text-on-surface truncate font-bold">
                          {currentSong.title}
                        </h2>
                        <p className="font-body text-body-md text-on-surface-variant truncate">
                          {currentSong.channelTitle || currentSong.artist || 'Artist'}
                        </p>
                        <div className="flex items-center gap-space-sm pt-2">
                          <button
                            type="button"
                            onClick={handleVoteSkip}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-label-md font-label-md transition-colors shadow-sm ${
                              hasVotedSkip
                                ? 'bg-primary text-on-primary font-bold'
                                : 'bg-surface-container-high hover:bg-surface-bright text-on-surface'
                            }`}
                          >
                            <span className="material-symbols-outlined text-title-sm">skip_next</span>
                            <span>Vote to Skip ({skipVotes}/{Math.max(2, roomMembers.length)})</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-body-sm text-outline py-4 text-center">No song playing. Add one to the queue!</p>
                  )}
                </section>

                {/* Queue Section */}
                <section className="bg-surface-container rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm border border-surface-container-high/40">
                  <h3 className="font-title text-title-md font-bold text-on-surface">
                    Room Queue ({queue?.length || 0})
                  </h3>
                  {queue && queue.length > 0 ? (
                    <div className="divide-y divide-surface-container-high/40 max-h-48 overflow-y-auto pr-1">
                      {queue.map((song, idx) => (
                        <div key={idx} className="flex items-center justify-between py-2 px-1 hover:bg-surface-container-high rounded transition-colors">
                          <div className="flex items-center gap-space-sm min-w-0 flex-1">
                            <span className="font-metric-mono text-outline text-label-sm w-4">{idx + 1}</span>
                            <span className="text-body-sm font-semibold text-on-surface truncate">{song.title}</span>
                          </div>
                          <span className="text-label-sm text-outline font-metric-mono ml-2">Next</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-body-sm text-outline py-4 text-center">Queue is empty</p>
                  )}
                </section>

                {/* Leave Room Button */}
                <button
                  type="button"
                  onClick={leavePartyRoom}
                  className="px-space-md py-2 rounded-lg bg-surface-container hover:bg-error-container hover:text-on-error-container text-outline text-body-sm font-semibold transition-colors self-start flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-title-sm">logout</span>
                  <span>Leave Room</span>
                </button>

              </div>

              {/* Right Column: Members & Chat (5 cols) */}
              <div className="lg:col-span-5 flex flex-col gap-space-md">
                {/* Members Strip */}
                <div className="p-space-md rounded-xl bg-surface-container border border-surface-container-high/40">
                  <span className="text-label-sm font-label-sm text-outline uppercase tracking-wider font-semibold block mb-2">
                    Listeners ({roomMembers.length})
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {roomMembers.map((member, idx) => (
                      <div
                        key={member.id || idx}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface text-body-sm font-medium"
                      >
                        <span className="w-2 h-2 rounded-full bg-secondary" />
                        <span>{member.name || `User ${idx + 1}`}</span>
                        {member.isHost && (
                          <span className="text-[10px] text-primary uppercase font-bold">DJ</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chat Feed */}
                <div className="p-space-md rounded-xl bg-surface-container border border-surface-container-high/40 flex flex-col h-64">
                  <span className="text-label-sm font-label-sm text-outline uppercase tracking-wider font-semibold block mb-2">
                    Live Chat
                  </span>
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-body-sm">
                    {roomMessages?.length === 0 ? (
                      <p className="text-outline text-center py-8">No messages yet. Say hello to everyone!</p>
                    ) : (
                      roomMessages.map((msg, idx) => (
                        <div key={idx} className="p-1.5 rounded-lg bg-surface-container-high">
                          <span className="font-semibold text-primary block text-label-sm">{msg.senderName}:</span>
                          <span className="text-on-surface text-body-sm">{msg.text}</span>
                        </div>
                      ))
                    )}
                  </div>
                  <form onSubmit={handleSendChat} className="flex gap-2 pt-2 border-t border-surface-container-high/40 mt-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-1.5 rounded-lg bg-surface-container-low text-body-sm text-on-surface placeholder:text-outline focus:outline-none border border-surface-container-high"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-lg bg-primary text-on-primary font-semibold text-body-sm"
                    >
                      Send
                    </button>
                  </form>
                </div>
              </div>

            </div>
          ) : (
            /* Not in room: Create or Join */
            <div className="max-w-md mx-auto w-full flex flex-col gap-space-lg py-space-md">
              <div className="flex rounded-lg bg-surface-container p-1 border border-surface-container-high">
                <button
                  type="button"
                  onClick={() => setTab('join')}
                  className={`flex-1 py-2 rounded-lg font-title text-title-sm font-semibold transition-colors ${
                    tab === 'join' ? 'bg-surface-container-high text-on-surface' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Join Existing Room
                </button>
                <button
                  type="button"
                  onClick={() => setTab('create')}
                  className={`flex-1 py-2 rounded-lg font-title text-title-sm font-semibold transition-colors ${
                    tab === 'create' ? 'bg-surface-container-high text-on-surface' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Create New Room
                </button>
              </div>

              {tab === 'join' ? (
                <form onSubmit={handleJoinRoom} className="space-y-space-md">
                  <div>
                    <label className="font-label-sm text-label-sm uppercase tracking-wider text-outline block mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={userNameInput}
                      onChange={(e) => setUserNameInput(e.target.value)}
                      required
                      placeholder="Enter your nickname..."
                      className="w-full px-space-md py-2.5 rounded-lg bg-surface-container text-body-md text-on-surface border border-surface-container-high focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-label-sm text-label-sm uppercase tracking-wider text-outline block mb-1">
                      Room Code (4-Letter)
                    </label>
                    <input
                      type="text"
                      value={roomCodeInput}
                      onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                      maxLength={6}
                      required
                      placeholder="e.g. NEON"
                      className="w-full px-space-md py-2.5 rounded-lg bg-surface-container font-metric-mono text-headline-sm uppercase text-primary border border-surface-container-high focus:outline-none text-center"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-title text-title-sm font-semibold transition-all shadow active:scale-95"
                  >
                    Connect to Aux Room
                  </button>
                </form>
              ) : (
                <form onSubmit={handleCreateRoom} className="space-y-space-md">
                  <div>
                    <label className="font-label-sm text-label-sm uppercase tracking-wider text-outline block mb-1">
                      Your Name (DJ Host)
                    </label>
                    <input
                      type="text"
                      value={userNameInput}
                      onChange={(e) => setUserNameInput(e.target.value)}
                      required
                      placeholder="Enter host name..."
                      className="w-full px-space-md py-2.5 rounded-lg bg-surface-container text-body-md text-on-surface border border-surface-container-high focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-label-sm text-label-sm uppercase tracking-wider text-outline block mb-1">
                      Room Name
                    </label>
                    <input
                      type="text"
                      value={newRoomName}
                      onChange={(e) => setNewRoomName(e.target.value)}
                      required
                      placeholder="e.g. Neon Lounge"
                      className="w-full px-space-md py-2.5 rounded-lg bg-surface-container text-body-md text-on-surface border border-surface-container-high focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-title text-title-sm font-semibold transition-all shadow active:scale-95"
                  >
                    Launch Aux Room
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
