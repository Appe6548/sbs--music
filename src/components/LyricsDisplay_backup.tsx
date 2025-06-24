import React, { useEffect, useState } from 'react';
import { LyricPlayer } from '@applemusic-like-lyrics/react';
import {
  convertToAMLLFormat,
  loadBilingualLyrics,
  type BilingualLyrics
} from '../utils/lrcParser';

interface LyricsDisplayProps {
  lyricsUrl?: string;
  translationUrl?: string;
  currentTime: number;
  isPlaying: boolean;
}

export const LyricsDisplay: React.FC<LyricsDisplayProps> = ({
  lyricsUrl,
  translationUrl,
  currentTime,
  isPlaying,
}) => {
  const [bilingualLyrics, setBilingualLyrics] = useState<BilingualLyrics | null>(null);
  const [amllLyrics, setAmllLyrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load lyrics from URL
  useEffect(() => {
    if (!lyricsUrl) {
      setBilingualLyrics(null);
      setAmllLyrics([]);
      return;
    }

    const loadLyrics = async () => {
      setLoading(true);
      setError(null);

      try {
        const bilingualData = await loadBilingualLyrics(lyricsUrl, translationUrl);
        const amllFormat = convertToAMLLFormat(bilingualData);

        setBilingualLyrics(bilingualData);
        setAmllLyrics(amllFormat);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load lyrics';
        setError(errorMessage);
        console.error('Error loading lyrics:', err);
      } finally {
        setLoading(false);
      }
    };

    loadLyrics();
  }, [lyricsUrl, translationUrl]);

  if (loading) {
    return (
      <div className="lyrics-display loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading lyrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lyrics-display error">
        <div className="error-message">
          <p>❌ {error}</p>
          <p>Please check if the lyrics file exists and is accessible.</p>
        </div>
      </div>
    );
  }

  if (!bilingualLyrics || amllLyrics.length === 0) {
    return (
      <div className="lyrics-display empty">
        <div className="empty-message">
          <p>🎵 No lyrics available</p>
          <p>Load an audio file with lyrics to see them here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lyrics-display">
      <div className="lyrics-container">
        {amllLyrics.length > 0 ? (
          <LyricPlayer
            lyricLines={amllLyrics}
            currentTime={currentTime * 1000} // Convert to milliseconds
            playing={isPlaying}
            disabled={false}
            style={{
              height: '400px',
              width: '100%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px',
              overflow: 'hidden',
            }}
            // AMLL configuration options
            alignAnchor="center"
            alignPosition={0.5}
            enableSpring={true}
            enableBlur={true}
            enableScale={true}
          />
        ) : (
          <div style={{
            height: '400px',
            width: '100%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '1.2rem'
          }}>
            No lyrics data available
          </div>
        )}
      </div>
      
      {/* Elegant lyrics preview */}
      {amllLyrics.length > 0 && (
        <div className="lyrics-preview">
          <div className="lyrics-stats">
            <span className="stat-item">
              <span className="stat-icon">🎵</span>
              <span className="stat-text">{amllLyrics.length} lines</span>
            </span>
            {bilingualLyrics?.translation && (
              <span className="stat-item">
                <span className="stat-icon">🌍</span>
                <span className="stat-text">Bilingual</span>
              </span>
            )}
            <span className="stat-item">
              <span className="stat-icon">⏱️</span>
              <span className="stat-text">{Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')}</span>
            </span>
          </div>
        </div>
      )}

      {/* Lyrics metadata display */}
      {bilingualLyrics?.original.metadata && Object.keys(bilingualLyrics.original.metadata).length > 0 && (
        <div className="lyrics-metadata">
          {bilingualLyrics.original.metadata.ti && (
            <div className="metadata-item">
              <strong>Title:</strong> {bilingualLyrics.original.metadata.ti}
            </div>
          )}
          {bilingualLyrics.original.metadata.ar && (
            <div className="metadata-item">
              <strong>Artist:</strong> {bilingualLyrics.original.metadata.ar}
            </div>
          )}
          {bilingualLyrics.original.metadata.al && (
            <div className="metadata-item">
              <strong>Album:</strong> {bilingualLyrics.original.metadata.al}
            </div>
          )}
          {bilingualLyrics.translation && (
            <div className="metadata-item">
              <strong>Translation:</strong> Available
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LyricsDisplay;
