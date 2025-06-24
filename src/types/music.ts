export interface MusicTrack {
  title: string;
  artist: string;
  album?: string;
  audioUrl: string;
  coverUrl?: string;
  lyricsUrl?: string;
  translationUrl?: string;
  duration?: number;
}

export interface PlaylistConfig {
  defaultTrack?: MusicTrack;
  tracks: MusicTrack[];
}

// Default track configuration
export const DEFAULT_TRACK: MusicTrack = {
  title: "To the Moon and Back",
  artist: "suno",
  album: "Demo Album",
  audioUrl: "/To the Moon and Back.mp3",
  coverUrl: "/To the Moon and Back.png",
  lyricsUrl: "/lyrics_en.lrc",
  translationUrl: "/lyrics_zh.lrc"
};

// Check if default files exist
export const checkFileExists = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
};

// Get available default track with existing files
export const getAvailableDefaultTrack = async (): Promise<MusicTrack | null> => {
  const track = { ...DEFAULT_TRACK };
  
  // Check which files actually exist
  const [audioExists, coverExists, lyricsExists, translationExists] = await Promise.all([
    checkFileExists(track.audioUrl),
    checkFileExists(track.coverUrl || ''),
    checkFileExists(track.lyricsUrl || ''),
    checkFileExists(track.translationUrl || '')
  ]);

  // If no audio file, return null
  if (!audioExists) {
    return null;
  }

  // Update track with only existing files
  return {
    ...track,
    coverUrl: coverExists ? track.coverUrl : undefined,
    lyricsUrl: lyricsExists ? track.lyricsUrl : undefined,
    translationUrl: translationExists ? track.translationUrl : undefined
  };
};
