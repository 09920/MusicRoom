import React from 'react';
import { Play, Trash2, Plus, Radio, Music, ArrowUp, ArrowDown, GripVertical, CheckCircle2, Sparkles, RefreshCw } from 'lucide-react';

function formatDuration(sec) {
  if (!sec || isNaN(sec)) return '--:--';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export default function QueueList({
  queue = [],
  currentSong = null,
  playback = {},
  roomId = '',
  canControl = true,
  autoMode = true,
  language = 'Hindi',
  onPlayItem,
  onRemoveItem,
  onMoveItem,
  onOpenImport,
  onToggleAutoMode
}) {
  // Calculate total remaining minutes
  const totalSeconds = queue.reduce((acc, item) => acc + (item.durationSec || 210), 0);
  const remainingMinutes = Math.ceil(totalSeconds / 60);

  const currentTime = playback?.currentTime || 0;
  const duration = currentSong?.durationSec || 240;
  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  return (
    <div className="flex flex-col w-full space-y-4">
      {/* Room & Queue Header Metadata */}
      <div className="flex flex-col space-y-1.5 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-label-sm text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary uppercase font-bold tracking-wider border border-primary/20">
              ROOM #{roomId?.slice(0, 6)?.toUpperCase() || 'FA0B'}
            </span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary"></span>
            </span>
            <span className="font-label-sm text-xs text-tertiary font-bold tracking-tight">
              LIVE QUEUE
            </span>
          </div>

          <button
            onClick={onOpenImport}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-surface-container-high text-on-surface hover:bg-surface-bright transition-colors shadow-sm active:scale-95 duration-150 border border-white/5"
            title="Import YouTube / Spotify Playlist"
          >
            <Plus className="w-3.5 h-3.5 text-secondary" />
            <span className="font-label-md text-xs font-semibold text-secondary">Import Playlist</span>
          </button>
        </div>

        <div className="flex items-baseline justify-between pt-1">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-on-surface font-headline-lg">
              Shared Jukebox
            </h2>
            <p className="text-xs text-on-surface-variant font-medium mt-0.5">
              {queue.length} {queue.length === 1 ? 'Track' : 'Tracks'} in Queue
              <span className="text-outline mx-1.5">•</span>
              {remainingMinutes}m remaining
            </p>
          </div>

          <div className="flex items-center space-x-1 text-on-surface-variant bg-surface-container-low px-2.5 py-1 rounded-full border border-white/5 text-xs">
            <RefreshCw className="w-3 h-3 text-secondary animate-[spin_6s_linear_infinite]" />
            <span className="font-label-sm text-[11px] font-semibold">Realtime Sync</span>
          </div>
        </div>
      </div>

      {/* Now Spinning Spotlight Card */}
      {currentSong ? (
        <div className="relative overflow-hidden rounded-2xl bg-surface-container-high p-4 shadow-lg shadow-black/40 border border-white/5">
          <div className="absolute -right-12 -top-12 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-secondary/15 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1.5 text-[11px] font-bold text-secondary uppercase tracking-widest bg-secondary/10 px-2 py-0.5 rounded-full border border-secondary/20">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                <span>Now Spinning</span>
              </span>

              <div className="flex items-center space-x-1 bg-surface-container-lowest/80 px-2.5 py-0.5 rounded-full border border-white/5">
                <Sparkles className="w-3 h-3 text-primary" />
                <span className="text-[11px] text-on-surface-variant font-medium">
                  DJ @{currentSong.addedBy || 'Host'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3.5 pt-0.5">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0 shadow-md border border-white/10">
                <img
                  className="w-full h-full object-cover"
                  src={currentSong.thumbnail}
                  alt={currentSong.title}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=120&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-surface-container-lowest/20"></div>

                {/* Tiny Live Equalizer overlay */}
                <div className="absolute bottom-1.5 right-1.5 flex items-end gap-0.5 h-3.5 px-1 py-0.5 rounded bg-surface-container-lowest/80 backdrop-blur-sm">
                  <span className="w-1 bg-secondary rounded-full animate-bounce h-3"></span>
                  <span className="w-1 bg-primary rounded-full animate-bounce h-2" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1 bg-tertiary rounded-full animate-bounce h-3.5" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>

              <div className="flex flex-col min-w-0 flex-1">
                <h3 className="text-base font-bold text-on-surface truncate">
                  {currentSong.title}
                </h3>
                <p className="text-xs text-on-surface-variant truncate mt-0.5">
                  {currentSong.channelTitle || 'YouTube Audio'}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-surface-container-lowest text-primary-fixed font-semibold border border-white/5">
                    1080p HD Audio
                  </span>
                  <span className="text-[11px] text-on-surface-variant font-mono">
                    {formatDuration(currentTime)} / {formatDuration(duration)}
                  </span>
                </div>
              </div>
            </div>

            {/* Scrubber track */}
            <div className="flex flex-col space-y-1 pt-1">
              <div className="w-full h-1.5 bg-surface-container-lowest rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-primary to-secondary rounded-full shadow-[0_0_12px_rgba(208,188,255,0.8)] transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Permissions & Radio Mode Settings Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {/* Collaborative Room Banner */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-container-low border border-white/5">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-tertiary/15 flex items-center justify-center flex-shrink-0 text-tertiary">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-on-surface truncate">Collaborative Room</span>
              <span className="text-[11px] text-on-surface-variant truncate">All members can queue & upvote</span>
            </div>
          </div>
          <CheckCircle2 className="w-4 h-4 text-tertiary flex-shrink-0 ml-2" />
        </div>

        {/* YouTube Infinite Radio Toggle Card */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-container-low border border-white/5">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-secondary/15 flex items-center justify-center flex-shrink-0 text-secondary">
              <Radio className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-on-surface truncate">Infinite Radio</span>
              <span className="text-[11px] text-on-surface-variant truncate">Auto-queue similar vibes</span>
            </div>
          </div>

          <button
            onClick={onToggleAutoMode}
            disabled={!canControl}
            role="switch"
            aria-checked={autoMode}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ml-2 ${
              autoMode ? 'bg-primary' : 'bg-surface-variant'
            } ${!canControl ? 'opacity-40 cursor-not-allowed' : ''}`}
            title={canControl ? 'Toggle YouTube Infinite Radio' : 'Host controls radio'}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-on-primary shadow-md ring-0 transition duration-200 ease-in-out mt-1 ml-1 ${
                autoMode ? 'translate-x-5' : 'translate-x-0'
              }`}
            ></span>
          </button>
        </div>
      </div>

      {/* Queue Section Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-bold text-on-surface">Upcoming Tracks</span>
          <span className="text-[11px] bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded-full font-bold border border-white/5">
            {queue.length} Next
          </span>
        </div>
      </div>

      {/* Queue Interactive List or Empty State */}
      {queue.length === 0 ? (
        <div className="text-center py-8 px-4 rounded-2xl bg-surface-container-low border border-white/5 space-y-3">
          <div className="w-12 h-12 rounded-full bg-surface-container-high text-secondary mx-auto flex items-center justify-center border border-white/5">
            {autoMode ? (
              <Radio className="w-6 h-6 animate-pulse text-secondary" />
            ) : (
              <Music className="w-6 h-6 text-outline" />
            )}
          </div>
          <div>
            <p className="text-sm font-bold text-on-surface">
              {autoMode ? `YouTube Infinite Radio Active` : 'Queue is empty'}
            </p>
            <p className="text-xs text-on-surface-variant max-w-sm mx-auto mt-1 leading-relaxed">
              {autoMode
                ? `When current song finishes, the room auto-streams continuous matching ${language} hits!`
                : 'Search any track above or import a playlist to keep the room jamming.'}
            </p>
          </div>

          <div className="pt-1 flex items-center justify-center">
            <button
              onClick={onOpenImport}
              className="px-4 py-2 rounded-full bg-primary text-on-primary hover:bg-primary-container text-xs font-bold shadow-md active:scale-95 transition-all"
            >
              Import Playlist
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col space-y-2 max-h-[460px] overflow-y-auto pr-1">
          {queue.map((item, index) => {
            const isFirst = index === 0;
            const isLast = index === queue.length - 1;

            return (
              <div
                key={item.queueId || index}
                className="group relative flex items-center justify-between p-3 rounded-2xl bg-surface-container hover:bg-surface-container-high transition-all duration-150 shadow-sm border border-white/5"
              >
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  {/* Drag Indicator */}
                  <GripVertical className="w-4 h-4 text-outline select-none shrink-0 group-hover:text-on-surface" />

                  {/* Thumbnail with Rank Badge */}
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-surface-container-highest border border-white/10">
                    <img
                      className="w-full h-full object-cover"
                      src={item.thumbnail}
                      alt={item.title}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=120&q=80';
                      }}
                    />
                    <div
                      className={`absolute top-0 left-0 font-label-sm text-[9px] font-extrabold px-1.5 py-0.5 rounded-br ${
                        isFirst
                          ? 'bg-primary text-on-primary'
                          : 'bg-surface-container-highest/90 text-on-surface'
                      }`}
                    >
                      #{index + 1}
                    </div>

                    {canControl && (
                      <button
                        onClick={() => onPlayItem(item.queueId)}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                        title="Play now"
                      >
                        <Play className="w-5 h-5 fill-white translate-x-0.5" />
                      </button>
                    )}
                  </div>

                  {/* Song Info */}
                  <div
                    className="flex flex-col min-w-0 flex-1 cursor-pointer"
                    onClick={() => canControl && onPlayItem(item.queueId)}
                  >
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs sm:text-sm text-on-surface font-bold truncate group-hover:text-primary transition-colors">
                        {item.title}
                      </span>
                      {isFirst && (
                        <span className="text-[10px] bg-secondary/15 text-secondary px-1.5 py-0.2 rounded font-bold shrink-0">
                          UP NEXT
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-on-surface-variant truncate mt-0.5">
                      {item.channelTitle || 'YouTube'}
                    </span>
                    <div className="flex items-center space-x-1.5 mt-0.5 text-[11px] text-outline">
                      <span className="text-secondary font-medium truncate">
                        @{item.addedBy || 'Member'}
                      </span>
                      <span>•</span>
                      <span>{item.durationSec ? formatDuration(item.durationSec) : '3:45'}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                  {canControl && (
                    <>
                      <div className="flex flex-col">
                        <button
                          onClick={() => onMoveItem(item.queueId, 'up')}
                          disabled={isFirst}
                          className="p-1 hover:text-secondary text-outline transition-colors disabled:opacity-20"
                          title="Move up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onMoveItem(item.queueId, 'down')}
                          disabled={isLast}
                          className="p-1 hover:text-secondary text-outline transition-colors disabled:opacity-20"
                          title="Move down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => onPlayItem(item.queueId)}
                        className="p-2 hover:bg-surface-bright text-outline hover:text-secondary rounded-full transition-colors"
                        title="Play immediately"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>

                      <button
                        onClick={() => onRemoveItem(item.queueId)}
                        className="p-2 hover:bg-error-container/30 hover:text-error text-outline rounded-full transition-colors ml-0.5"
                        title="Remove track"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
