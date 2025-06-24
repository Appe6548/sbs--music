import ColorThief from 'colorthief';

/**
 * 从图片中提取主要颜色
 */
export class ImageColorExtractor {
  private colorThief: ColorThief;

  constructor() {
    this.colorThief = new ColorThief();
  }

  /**
   * 从图片元素中提取主要颜色
   * @param img - HTML图片元素
   * @returns RGB颜色数组 [r, g, b]
   */
  async extractDominantColor(img: HTMLImageElement): Promise<[number, number, number] | null> {
    try {
      // 确保图片已加载
      if (!img.complete || img.naturalHeight === 0) {
        await this.waitForImageLoad(img);
      }

      const color = this.colorThief.getColor(img);
      return color;
    } catch (error) {
      console.error('Error extracting color:', error);
      return null;
    }
  }

  /**
   * 从图片中提取调色板
   * @param img - HTML图片元素
   * @param colorCount - 要提取的颜色数量
   * @returns RGB颜色数组的数组
   */
  async extractPalette(img: HTMLImageElement, colorCount: number = 5): Promise<[number, number, number][] | null> {
    try {
      if (!img.complete || img.naturalHeight === 0) {
        await this.waitForImageLoad(img);
      }

      const palette = this.colorThief.getPalette(img, colorCount);
      return palette;
    } catch (error) {
      console.error('Error extracting palette:', error);
      return null;
    }
  }

  /**
   * 等待图片加载完成
   */
  private waitForImageLoad(img: HTMLImageElement): Promise<void> {
    return new Promise((resolve, reject) => {
      if (img.complete) {
        resolve();
        return;
      }

      const onLoad = () => {
        img.removeEventListener('load', onLoad);
        img.removeEventListener('error', onError);
        resolve();
      };

      const onError = () => {
        img.removeEventListener('load', onLoad);
        img.removeEventListener('error', onError);
        reject(new Error('Image failed to load'));
      };

      img.addEventListener('load', onLoad);
      img.addEventListener('error', onError);
    });
  }

  /**
   * 将RGB颜色转换为CSS颜色字符串
   */
  static rgbToString(rgb: [number, number, number]): string {
    return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
  }

  /**
   * 将RGB颜色转换为RGBA颜色字符串
   */
  static rgbToRgba(rgb: [number, number, number], alpha: number): string {
    return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
  }

  /**
   * 创建基于主要颜色的渐变背景
   */
  static createGradientFromColors(colors: [number, number, number][]): string {
    if (colors.length === 0) return '';
    
    if (colors.length === 1) {
      const [r, g, b] = colors[0];
      return `radial-gradient(circle at 50% 50%, rgba(${r}, ${g}, ${b}, 0.3) 0%, rgba(${r}, ${g}, ${b}, 0.1) 50%, transparent 100%)`;
    }

    // 创建多色渐变
    const gradientStops = colors.map((color, index) => {
      const [r, g, b] = color;
      const position = (index / (colors.length - 1)) * 100;
      return `rgba(${r}, ${g}, ${b}, 0.3) ${position}%`;
    }).join(', ');

    return `linear-gradient(135deg, ${gradientStops})`;
  }

  /**
   * 调整颜色亮度
   */
  static adjustBrightness(rgb: [number, number, number], factor: number): [number, number, number] {
    return [
      Math.min(255, Math.max(0, Math.round(rgb[0] * factor))),
      Math.min(255, Math.max(0, Math.round(rgb[1] * factor))),
      Math.min(255, Math.max(0, Math.round(rgb[2] * factor)))
    ];
  }

  /**
   * 检查颜色是否为深色
   */
  static isDarkColor(rgb: [number, number, number]): boolean {
    const [r, g, b] = rgb;
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5;
  }
}

export default ImageColorExtractor;
