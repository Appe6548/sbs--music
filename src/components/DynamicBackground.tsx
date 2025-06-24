import React, { useEffect, useState, useRef } from 'react';
import { ImageColorExtractor } from '../utils/colorExtractor';
import './DynamicBackground.css';

interface DynamicBackgroundProps {
  coverUrl?: string;
  isPlaying: boolean;
}

export const DynamicBackground: React.FC<DynamicBackgroundProps> = ({
  coverUrl,
  isPlaying
}) => {
  const [colors, setColors] = useState<[number, number, number][]>([]);
  const colorExtractorRef = useRef<ImageColorExtractor | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!colorExtractorRef.current) {
      colorExtractorRef.current = new ImageColorExtractor();
    }
  }, []);

  useEffect(() => {
    if (!coverUrl || !colorExtractorRef.current) {
      // 使用默认颜色
      setColors([[102, 126, 234], [118, 75, 162]]);
      return;
    }

    const extractColors = async () => {
      try {
        // 创建图片元素
        const img = new Image();
        img.crossOrigin = 'anonymous';
        imgRef.current = img;

        // 等待图片加载
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('Failed to load image'));
          img.src = coverUrl;
        });

        // 提取调色板
        const palette = await colorExtractorRef.current!.extractPalette(img, 3);
        
        if (palette && palette.length > 0) {
          setColors(palette);
        } else {
          // 提取主要颜色作为备选
          const dominantColor = await colorExtractorRef.current!.extractDominantColor(img);
          if (dominantColor) {
            // 创建基于主要颜色的调色板
            const baseColor = dominantColor;
            const lighterColor = ImageColorExtractor.adjustBrightness(baseColor, 1.3);
            const darkerColor = ImageColorExtractor.adjustBrightness(baseColor, 0.7);
            setColors([baseColor, lighterColor, darkerColor]);
          } else {
            setColors([[102, 126, 234], [118, 75, 162]]);
          }
        }
      } catch (error) {
        console.error('Error extracting colors from cover:', error);
        setColors([[102, 126, 234], [118, 75, 162]]);
      }
    };

    extractColors();
  }, [coverUrl]);

  // 创建动态背景样式
  const createBackgroundStyle = () => {
    if (colors.length === 0) {
      return {
        background: 'linear-gradient(135deg, #0f0c29 0%, #24243e 50%, #302b63 100%)'
      };
    }

    const [primary, secondary, tertiary] = colors;
    
    return {
      background: `
        radial-gradient(circle at 20% 80%, rgba(${primary[0]}, ${primary[1]}, ${primary[2]}, 0.4) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(${secondary[0]}, ${secondary[1]}, ${secondary[2]}, 0.4) 0%, transparent 50%),
        ${tertiary ? `radial-gradient(circle at 40% 40%, rgba(${tertiary[0]}, ${tertiary[1]}, ${tertiary[2]}, 0.3) 0%, transparent 50%),` : ''}
        linear-gradient(135deg, 
          rgba(${primary[0]}, ${primary[1]}, ${primary[2]}, 0.2) 0%, 
          rgba(${secondary[0]}, ${secondary[1]}, ${secondary[2]}, 0.2) 50%, 
          rgba(${tertiary ? tertiary[0] : primary[0]}, ${tertiary ? tertiary[1] : primary[1]}, ${tertiary ? tertiary[2] : primary[2]}, 0.2) 100%
        ),
        linear-gradient(135deg, #0f0c29 0%, #24243e 50%, #302b63 100%)
      `,
      transition: 'background 2s ease-in-out'
    };
  };

  // 创建动画效果
  const animationClass = isPlaying ? 'dynamic-bg-playing' : 'dynamic-bg-paused';

  return (
    <>
      <div 
        className={`dynamic-background ${animationClass}`}
        style={createBackgroundStyle()}
      />
      
      {/* 添加动态粒子效果 */}
      {isPlaying && colors.length > 0 && (
        <div className="dynamic-particles">
          {colors.slice(0, 3).map((color, index) => (
            <div
              key={index}
              className={`particle particle-${index + 1}`}
              style={{
                background: `radial-gradient(circle, rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.3) 0%, transparent 70%)`,
                animationDelay: `${index * 2}s`
              }}
            />
          ))}
        </div>
      )}


    </>
  );
};

export default DynamicBackground;
