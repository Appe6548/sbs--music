# 📁 File Setup Guide

This guide explains how to add your own audio files and cover images to the Apple Music-like Player.

## 🎵 Adding Your Audio Files

### Step 1: Place Audio File
1. Copy your audio file to the `public` folder
2. Rename it to match the expected filename or update the configuration

**For "To the Moon and Back":**
```
apple-music-player/
├── public/
│   ├── To the Moon and Back.mp3    ← Your audio file here
│   ├── To the Moon and Back.png    ← Your cover image here
│   ├── sample.lrc                  ← English lyrics
│   └── sample-zh.lrc              ← Chinese translation
```

### Step 2: Add Cover Image (Optional)
- Place your cover image in the `public` folder
- Supported formats: PNG, JPG, JPEG, WebP
- Recommended size: 500x500px or larger (square format)
- Name it to match your audio file

### Step 3: Update Configuration (If Needed)
If you want to use different filenames, edit `src/types/music.ts`:

```typescript
export const DEFAULT_TRACK: MusicTrack = {
  title: "Your Song Title",
  artist: "Your Artist Name",
  album: "Your Album Name",
  audioUrl: "/your-audio-file.mp3",
  coverUrl: "/your-cover-image.png",
  lyricsUrl: "/your-lyrics.lrc",
  translationUrl: "/your-translation.lrc"
};
```

## 📝 Adding Lyrics Files

### LRC Format
Create lyrics files in LRC format with timestamps:

```
[00:00.30]First line of lyrics
[00:04.20]Second line of lyrics
[00:07.66]Third line of lyrics
```

### Bilingual Support
- **Original lyrics**: `sample.lrc` (or your custom filename)
- **Translation**: `sample-zh.lrc` (or your custom filename)
- Both files should have matching timestamps

## 🔧 Supported File Formats

### Audio Formats
- MP3 (recommended)
- AAC
- OGG
- WAV
- M4A

### Image Formats
- PNG (recommended for transparency)
- JPG/JPEG
- WebP
- SVG

### Lyrics Formats
- LRC (with timestamps)
- Plain text (without sync)

## 🚀 Quick Setup for "To the Moon and Back"

1. **Copy your files to the public folder:**
   ```bash
   cp "To the Moon and Back.mp3" apple-music-player/public/
   cp "To the Moon and Back.png" apple-music-player/public/
   ```

2. **Start the development server:**
   ```bash
   cd apple-music-player
   npm run dev
   ```

3. **Open your browser:**
   - Go to `http://localhost:5173`
   - The player should automatically detect and load your files

## 📱 File Size Recommendations

### For Web Performance
- **Audio**: Keep under 10MB for web playback
- **Cover Image**: 500KB or less, 500x500px recommended
- **Lyrics**: Usually under 10KB

### For Mobile Devices
- Use compressed audio formats (MP3 320kbps or AAC)
- Optimize images (use WebP if possible)
- Keep total file sizes reasonable for mobile data

## 🔍 Troubleshooting

### Files Not Loading?
1. Check file names match exactly (case-sensitive)
2. Ensure files are in the `public` folder
3. Check browser console for error messages
4. Verify file formats are supported

### Audio Not Playing?
1. Check audio file format compatibility
2. Ensure file isn't corrupted
3. Try a different browser
4. Check browser's audio permissions

### Cover Image Not Showing?
1. Verify image file format
2. Check file size (very large images may fail)
3. Ensure proper file permissions
4. Try refreshing the page

## 🎨 Customization Tips

### Creating Great Cover Art
- Use square aspect ratio (1:1)
- High resolution (at least 500x500px)
- Good contrast for text overlay
- Consider the player's color scheme

### Optimizing Lyrics
- Use precise timestamps for better sync
- Keep lines reasonably short for mobile
- Consider adding translation for international audience
- Test sync with actual audio playback

## 📞 Need Help?

If you encounter issues:
1. Check the browser console for errors
2. Verify all file paths and names
3. Ensure files are properly formatted
4. Try with different audio/image files to isolate the issue

The player is designed to gracefully handle missing files, so it will work even if some files are not available.
