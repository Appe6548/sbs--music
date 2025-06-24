import React, { useEffect, useState, useRef } from 'react';
import ColorThief from 'colorthief';
import './AppleMusicBackground.css';

interface AppleMusicBackgroundProps {
  coverUrl?: string;
  isPlaying: boolean;
  currentTime?: number;
}

export const AppleMusicBackground: React.FC<AppleMusicBackgroundProps> = ({
  coverUrl,
  isPlaying,
  currentTime = 0
}) => {
  const [colors, setColors] = useState<[number, number, number][]>([
    [102, 126, 234], [118, 75, 162], [255, 119, 198]
  ]);
  const colorThiefRef = useRef<ColorThief | null>(null);

  useEffect(() => {
    if (!colorThiefRef.current) {
      colorThiefRef.current = new ColorThief();
    }
  }, []);

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

  // 创建 Apple Music 风格的动态背景
  const createAppleMusicBackground = () => {
    const [primary, secondary, tertiary] = colors;
    
    // 基于播放时间创建律动效果
    const beatIntensity = isPlaying ? Math.sin(currentTime * 2) * 0.1 + 0.9 : 0.8;
    
    return {
      background: `
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
      `,
      transition: isPlaying ? 'background 0.5s ease-out' : 'background 2s ease-in-out'
    };
  };

  return (
    <>
      <div
        className={`apple-music-background ${isPlaying ? 'playing' : 'paused'}`}
        style={createAppleMusicBackground()}
      />
    </>
  );
};

export default AppleMusicBackground;
