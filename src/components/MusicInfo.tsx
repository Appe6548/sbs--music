import React, { useState } from 'react';
import type { MusicTrack } from '../types/music';

interface MusicInfoProps {
  track?: MusicTrack;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlayPause?: () => void;
  onSeek?: (time: number) => void;
  onVolumeChange?: (volume: number) => void;
  audioSrc?: string;
  onToggleLyrics?: () => void;
  isMobile?: boolean;
}

export const MusicInfo: React.FC<MusicInfoProps> = ({
  track,
  isPlaying,
  currentTime,
  duration,
  onPlayPause,
  onSeek,
  onVolumeChange,
  audioSrc,
  onToggleLyrics,
  isMobile = false
}) => {
  const [imageError, setImageError] = useState(false);
  const [volume, setVolume] = useState(1);

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    onSeek?.(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    onVolumeChange?.(newVolume);
  };

  if (!track) {
    return (
      <div className="music-info">
        <div className="music-info-placeholder">
          <div className="cover-placeholder">
            <span>🎵</span>
          </div>
          <div className="track-info">
            <h2>No Track Loaded</h2>
            <p>Upload an audio file to get started</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="music-info">
      <div className="music-info-content">
        <div className="cover-container">
          {track.coverUrl && !imageError ? (
            <img
              src={track.coverUrl || undefined}
              alt={`${track.title} cover`}
              className={`cover-image ${isPlaying ? 'playing' : ''}`}
              onError={handleImageError}
            />
          ) : (
            <div className="cover-placeholder">
              <span>🎵</span>
            </div>
          )}
          {isPlaying && (
            <div className="playing-indicator">
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
            </div>
          )}
        </div>

        {/* 歌曲标题 - 放在专辑封面下面 */}
        <div className="track-title-container">
          <h2 className="track-title">{track.title}</h2>
        </div>

        {/* 播放控制按钮 - 与专辑封面等宽 */}
        <div className="cover-controls">
          {/* 进度条区域 */}
          <div className="progress-container">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="progress-bar"
              disabled={!audioSrc}
            />
            <div className="progress-time">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* 播放控制按钮区域 */}
          <div className="mobile-controls">
            <button
              onClick={onPlayPause}
              className="play-pause-btn"
              disabled={!audioSrc}
            >
              <span className={`btn-icon ${isPlaying ? 'pause-icon' : 'play-icon'}`}></span>
            </button>
          </div>

          {/* 底部控制区域：移动端显示歌词按钮和音量控制，桌面端只显示音量控制 */}
          <div className="bottom-controls">
            {isMobile && (
              <button className="lyrics-btn" onClick={onToggleLyrics}>
                ♪
              </button>
            )}
            <div className="volume-container">
              <span className="volume-icon"></span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="volume-bar"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
