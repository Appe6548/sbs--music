import React, { useEffect, useState, useRef } from 'react';
import { LyricPlayer } from '@applemusic-like-lyrics/react';
import {
  convertToAMLLFormat,
  loadBilingualLyrics,
  type BilingualLyrics
} from '../utils/lrcParser';
import ColorThief from 'colorthief';

interface LyricsDisplayProps {
  lyricsUrl?: string;
  translationUrl?: string;
  currentTime: number;
  isPlaying: boolean;
  className?: string;
  coverUrl?: string;
  onCloseLyrics?: () => void;
}

export const LyricsDisplay: React.FC<LyricsDisplayProps> = ({
  lyricsUrl,
  translationUrl,
  currentTime,
  isPlaying,
  className = '',
  coverUrl,
  onCloseLyrics,
}) => {
  const [bilingualLyrics, setBilingualLyrics] = useState<BilingualLyrics | null>(null);
  const [amllLyrics, setAmllLyrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [colors, setColors] = useState<[number, number, number][]>([
    [102, 126, 234], [118, 75, 162], [255, 119, 198]
  ]);
  const colorThiefRef = useRef<ColorThief | null>(null);

  // Initialize ColorThief
  useEffect(() => {
    if (!colorThiefRef.current) {
      colorThiefRef.current = new ColorThief();
    }
  }, []);

  // Extract colors from cover image
  useEffect(() => {
    if (!coverUrl || !colorThiefRef.current) {
      // 使用默认 Apple Music 风格颜色
      setColors([
        [102, 126, 234], // 蓝紫色
        [118, 75, 162],  // 深紫色
        [255, 119, 198]  // 粉色
      ]);
      return;
    }

    const extractColors = async () => {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';

        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('Failed to load image'));
          img.src = coverUrl;
        });

        // 提取调色板
        const palette = colorThiefRef.current!.getPalette(img, 5);

        if (palette && palette.length >= 3) {
          // 选择最鲜艳的3种颜色
          const vibrantColors = palette
            .map((color: [number, number, number]) => ({
              color: color,
              saturation: getSaturation(color)
            }))
            .sort((a: {color: [number, number, number], saturation: number}, b: {color: [number, number, number], saturation: number}) => b.saturation - a.saturation)
            .slice(0, 3)
            .map((item: {color: [number, number, number], saturation: number}) => item.color);

          setColors(vibrantColors);
        } else {
          // 备选方案：提取主色调并生成变体
          const dominantColor = colorThiefRef.current!.getColor(img);
          if (dominantColor) {
            const baseColor = dominantColor as [number, number, number];
            const lighterColor = adjustBrightness(baseColor, 1.4);
            const darkerColor = adjustBrightness(baseColor, 0.6);
            setColors([baseColor, lighterColor, darkerColor]);
          }
        }
      } catch (error) {
        console.error('Error extracting colors from cover:', error);
        // 保持默认颜色
      }
    };

    extractColors();
  }, [coverUrl]);

  // 计算颜色饱和度
  const getSaturation = (rgb: [number, number, number]): number => {
    const [r, g, b] = rgb.map(x => x / 255);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    return max === 0 ? 0 : (max - min) / max;
  };

  // 调整颜色亮度
  const adjustBrightness = (rgb: [number, number, number], factor: number): [number, number, number] => {
    return [
      Math.min(255, Math.max(0, Math.round(rgb[0] * factor))),
      Math.min(255, Math.max(0, Math.round(rgb[1] * factor))),
      Math.min(255, Math.max(0, Math.round(rgb[2] * factor)))
    ];
  };

  // 创建动态背景样式
  const createDynamicBackground = () => {
    const [primary, secondary, tertiary] = colors;

    // 基于播放时间创建律动效果
    const beatIntensity = isPlaying ? Math.sin(currentTime * 2) * 0.1 + 0.9 : 0.8;

    return `
      radial-gradient(ellipse at 25% 25%, rgba(${primary[0]}, ${primary[1]}, ${primary[2]}, ${0.4 * beatIntensity}) 0%, transparent 50%),
      radial-gradient(ellipse at 75% 75%, rgba(${secondary[0]}, ${secondary[1]}, ${secondary[2]}, ${0.4 * beatIntensity}) 0%, transparent 50%),
      radial-gradient(ellipse at 50% 100%, rgba(${tertiary[0]}, ${tertiary[1]}, ${tertiary[2]}, ${0.3 * beatIntensity}) 0%, transparent 60%),
      radial-gradient(ellipse at 100% 50%, rgba(${primary[0]}, ${primary[1]}, ${primary[2]}, ${0.2 * beatIntensity}) 0%, transparent 70%),
      linear-gradient(135deg,
        rgba(${primary[0]}, ${primary[1]}, ${primary[2]}, 0.1) 0%,
        rgba(${secondary[0]}, ${secondary[1]}, ${secondary[2]}, 0.1) 50%,
        rgba(${tertiary[0]}, ${tertiary[1]}, ${tertiary[2]}, 0.1) 100%
      ),
      #000000
    `;
  };

  // Hide undefined translation lines
  useEffect(() => {
    const hideUndefinedTranslations = () => {
      const translationElements = document.querySelectorAll('.amll-translation-line, [class*="translation"], [class*="translated"]');
      translationElements.forEach(el => {
        if (el.textContent === 'undefined' || el.textContent === 'null' || el.textContent?.trim() === '') {
          (el as HTMLElement).style.display = 'none';
        }
      });
    };

    // Run after a short delay to ensure AMLL has rendered
    const timer = setTimeout(hideUndefinedTranslations, 100);

    // Also run on interval to catch dynamic updates
    const interval = setInterval(hideUndefinedTranslations, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [amllLyrics]);

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

  const isFullscreen = className.includes('mobile-show');

  return (
    <div className={`lyrics-display ${className}`}>
      {/* 全屏模式下的退出按钮 */}
      {isFullscreen && onCloseLyrics && (
        <button
          className="lyrics-close-btn"
          onClick={onCloseLyrics}
        >
          ✕
        </button>
      )}
      <div className="lyrics-container">
        {amllLyrics.length > 0 ? (
          <LyricPlayer
            lyricLines={amllLyrics}
            currentTime={currentTime * 1000} // Convert to milliseconds
            playing={isPlaying}
            disabled={false}
            style={{
              height: '600px',
              width: '100%',
              background: createDynamicBackground(),
              borderRadius: '12px',
              overflow: 'hidden',
              transition: isPlaying ? 'background 0.5s ease-out' : 'background 2s ease-in-out'
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
            height: '600px',
            width: '100%',
            background: createDynamicBackground(),
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '1.2rem',
            transition: isPlaying ? 'background 0.5s ease-out' : 'background 2s ease-in-out'
          }}>
            No lyrics data available
          </div>
        )}
      </div>
      



    </div>
  );
};

export default LyricsDisplay;
