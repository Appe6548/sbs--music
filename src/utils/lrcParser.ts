export interface LyricLine {
  time: number;
  text: string;
  translation?: string; // 添加翻译字段
}

export interface ParsedLyrics {
  lines: LyricLine[];
  metadata: Record<string, string>;
}

export interface BilingualLyrics {
  original: ParsedLyrics;
  translation?: ParsedLyrics;
  merged: LyricLine[]; // 合并后的双语歌词
}

/**
 * Parse LRC format lyrics
 * @param lrcContent - The LRC file content as string
 * @returns Parsed lyrics object
 */
export function parseLRC(lrcContent: string): ParsedLyrics {
  const lines = lrcContent.split('\n');
  const lyricLines: LyricLine[] = [];
  const metadata: Record<string, string> = {};

  // Regular expressions for parsing
  const metadataRegex = /\[(\w+):(.+)\]/;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    // Check if it's a metadata line (like [ar:Artist], [ti:Title])
    const metadataMatch = trimmedLine.match(metadataRegex);
    const timeRegex = /\[(\d{1,2}):(\d{2})\.(\d{2})\]/g; // Create fresh regex for each line

    if (metadataMatch && !timeRegex.test(trimmedLine)) {
      const [, key, value] = metadataMatch;
      metadata[key] = value;
      continue;
    }

    // Parse time stamps and lyrics
    // Create fresh regex for matchAll
    const timeRegexForMatch = /\[(\d{1,2}):(\d{2})\.(\d{2})\]/g;
    const matches = Array.from(trimmedLine.matchAll(timeRegexForMatch));
    if (matches.length > 0) {
      // Extract the text part (everything after the last time stamp)
      const lastMatch = matches[matches.length - 1];
      const textStartIndex = lastMatch.index! + lastMatch[0].length;
      const text = trimmedLine.substring(textStartIndex).trim();

      // Create lyric lines for each time stamp
      for (const match of matches) {
        const [, minutes, seconds, centiseconds] = match;
        const originalTime = parseInt(minutes) * 60 + parseInt(seconds) + parseInt(centiseconds) / 100;
        // 提前0.8秒显示歌词，但不能小于0
        const adjustedTime = Math.max(0, originalTime - 0.8);

        lyricLines.push({
          time: adjustedTime,
          text,
        });
      }
    }
  }

  // Sort by time
  lyricLines.sort((a, b) => a.time - b.time);

  return {
    lines: lyricLines,
    metadata,
  };
}

/**
 * Find the current lyric line based on current time
 * @param lyrics - Parsed lyrics
 * @param currentTime - Current playback time in seconds
 * @returns Current lyric line index, or -1 if no line is active
 */
export function getCurrentLyricIndex(lyrics: ParsedLyrics, currentTime: number): number {
  if (!lyrics.lines.length) return -1;

  let currentIndex = -1;
  
  for (let i = 0; i < lyrics.lines.length; i++) {
    if (lyrics.lines[i].time <= currentTime) {
      currentIndex = i;
    } else {
      break;
    }
  }

  return currentIndex;
}

/**
 * Get the next few lyric lines for preview
 * @param lyrics - Parsed lyrics
 * @param currentIndex - Current lyric line index
 * @param count - Number of lines to get
 * @returns Array of upcoming lyric lines
 */
export function getUpcomingLyrics(lyrics: ParsedLyrics, currentIndex: number, count: number = 3): LyricLine[] {
  if (currentIndex === -1 || currentIndex >= lyrics.lines.length - 1) {
    return [];
  }

  const startIndex = currentIndex + 1;
  const endIndex = Math.min(startIndex + count, lyrics.lines.length);
  
  return lyrics.lines.slice(startIndex, endIndex);
}

/**
 * Merge original and translation lyrics by timestamp
 * @param original - Original lyrics
 * @param translation - Translation lyrics
 * @returns Merged bilingual lyrics
 */
export function mergeBilingualLyrics(original: ParsedLyrics, translation?: ParsedLyrics): BilingualLyrics {
  const merged: LyricLine[] = [];

  if (!translation) {
    return {
      original,
      translation: undefined,
      merged: original.lines
    };
  }

  // Create a map of translation lines by time for quick lookup
  const translationMap = new Map<number, string>();
  translation.lines.forEach(line => {
    translationMap.set(line.time, line.text);
  });

  // Merge original lines with translations
  original.lines.forEach(line => {
    const translatedText = translationMap.get(line.time);
    merged.push({
      time: line.time,
      text: line.text,
      translation: translatedText
    });
  });

  return {
    original,
    translation,
    merged
  };
}

/**
 * Convert parsed lyrics to AMLL format with translation support
 * @param lyrics - Parsed LRC lyrics or bilingual lyrics
 * @returns AMLL compatible lyrics format
 */
export function convertToAMLLFormat(lyrics: ParsedLyrics | BilingualLyrics) {
  const lines = 'merged' in lyrics ? lyrics.merged : lyrics.lines;

  return lines.map((line, index) => {
    const startTime = line.time * 1000; // Convert to milliseconds
    const endTime = index < lines.length - 1
      ? lines[index + 1].time * 1000
      : (line.time + 3) * 1000; // Default 3 seconds if last line

    return {
      words: [
        {
          word: line.text,
          startTime: startTime,
          endTime: endTime,
        }
      ],
      translatedLyric: line.translation || '',
      romanLyric: '',
      startTime: startTime,
      endTime: endTime,
      isBG: false,
      isDuet: false,
    };
  });
}

/**
 * Load and parse bilingual lyrics from URLs
 * @param originalUrl - URL of the original lyrics file
 * @param translationUrl - URL of the translation lyrics file (optional)
 * @returns Promise of bilingual lyrics
 */
export async function loadBilingualLyrics(originalUrl: string, translationUrl?: string): Promise<BilingualLyrics> {
  try {
    console.log('📥 Fetching original lyrics from:', originalUrl);
    // Load original lyrics
    const originalResponse = await fetch(originalUrl);
    console.log('📥 Original response status:', originalResponse.status, originalResponse.statusText);
    if (!originalResponse.ok) {
      throw new Error(`Failed to load original lyrics: ${originalResponse.statusText}`);
    }
    const originalContent = await originalResponse.text();
    console.log('📥 Original content length:', originalContent.length);
    const originalLyrics = parseLRC(originalContent);
    console.log('📥 Parsed original lyrics lines:', originalLyrics.lines.length);

    // Load translation lyrics if provided
    let translationLyrics: ParsedLyrics | undefined;
    if (translationUrl) {
      try {
        console.log('📥 Fetching translation lyrics from:', translationUrl);
        const translationResponse = await fetch(translationUrl);
        console.log('📥 Translation response status:', translationResponse.status);
        if (translationResponse.ok) {
          const translationContent = await translationResponse.text();
          console.log('📥 Translation content length:', translationContent.length);
          translationLyrics = parseLRC(translationContent);
          console.log('📥 Parsed translation lyrics lines:', translationLyrics.lines.length);
        }
      } catch (error) {
        console.warn('Failed to load translation lyrics:', error);
        // Continue without translation
      }
    }

    const result = mergeBilingualLyrics(originalLyrics, translationLyrics);
    console.log('📥 Final merged result:', result);
    return result;
  } catch (error) {
    throw new Error(`Failed to load lyrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
