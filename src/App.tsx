import { useState, useCallback, useEffect, useRef } from 'react';
import { LyricsDisplay } from './components/LyricsDisplay';
import { MusicInfo } from './components/MusicInfo';
import { AppleMusicBackground } from './components/AppleMusicBackground';
import { getAvailableDefaultTrack, type MusicTrack } from './types/music';
import './App.css';

function App() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioSrc, setAudioSrc] = useState<string>('');
  const [lyricsUrl, setLyricsUrl] = useState<string>('/lyrics_en.lrc');
  const [translationUrl, setTranslationUrl] = useState<string>('/lyrics_zh.lrc');
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const [isLoadingDefault, setIsLoadingDefault] = useState(true);
  const [showLyrics, setShowLyrics] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  const handleDurationChange = useCallback((dur: number) => {
    setDuration(dur);
  }, []);

  // Load default track on app start
  useEffect(() => {
    const loadDefaultTrack = async () => {
      try {
        const defaultTrack = await getAvailableDefaultTrack();
        if (defaultTrack) {
          setCurrentTrack(defaultTrack);
          setAudioSrc(defaultTrack.audioUrl);
          if (defaultTrack.lyricsUrl) {
            setLyricsUrl(defaultTrack.lyricsUrl);
          }
          if (defaultTrack.translationUrl) {
            setTranslationUrl(defaultTrack.translationUrl);
          }
        }
      } catch (error) {
        console.log('No default track available:', error);
      } finally {
        setIsLoadingDefault(false);
      }
    };

    loadDefaultTrack();
  }, []);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  // 音频控制函数
  const handlePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  }, [isPlaying]);

  const handleSeek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    setCurrentTime(time);
  }, []);

  const handleVolumeChange = useCallback((volume: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  }, []);

  const toggleLyrics = useCallback(() => {
    setShowLyrics(prev => !prev);
  }, []);

  // 检测移动端
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 音频事件监听
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleDurationChange = () => {
      setDuration(audio.duration);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioSrc]);



  return (
    <div className="app">
      {/* Apple Music 风格的动态背景 */}
      <AppleMusicBackground
        coverUrl={currentTrack?.coverUrl}
        isPlaying={isPlaying}
        currentTime={currentTime}
      />

      <main className="app-main">
        {/* 隐藏的音频元素 */}
        <audio ref={audioRef} src={audioSrc || undefined} preload="metadata" />

        <div className="player-section">
          <div className="music-display">
            <MusicInfo
              track={currentTrack || undefined}
              isPlaying={isPlaying}
              currentTime={currentTime}
              duration={duration}
              onPlayPause={handlePlayPause}
              onSeek={handleSeek}
              onVolumeChange={handleVolumeChange}
              audioSrc={audioSrc}
              onToggleLyrics={toggleLyrics}
              isMobile={isMobile}
            />

            <LyricsDisplay
              lyricsUrl={lyricsUrl}
              translationUrl={translationUrl}
              currentTime={currentTime}
              isPlaying={isPlaying}
              className={showLyrics ? 'mobile-show' : ''}
              coverUrl={currentTrack?.coverUrl}
              onCloseLyrics={toggleLyrics}
            />
          </div>


        </div>

        {isLoadingDefault && (
          <div className="demo-section">
            <h3>🔄 Loading...</h3>
            <p>Checking for default audio files...</p>
          </div>
        )}

        {!isLoadingDefault && !audioSrc && (
          <div className="demo-section">
            <h3>🎧 Demo Mode</h3>
            <p>
              Sample English and Chinese lyrics are loaded. Upload your own audio file to start playing music!
            </p>
            <p>
              The bilingual lyrics will sync automatically with your audio playback.
            </p>
            <div className="demo-features">
              <h4>✨ Features:</h4>
              <ul>
                <li>🌍 Bilingual lyrics support (Original + Translation)</li>
                <li>🎵 Real-time synchronization</li>
                <li>🎨 Apple Music-style effects</li>
                <li>📱 Mobile-friendly design</li>
              </ul>
            </div>
          </div>
        )}


      </main>
    </div>
  );
}

export default App;
