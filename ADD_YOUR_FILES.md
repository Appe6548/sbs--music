# 🎵 How to Add Your "To the Moon and Back" Files

## Quick Setup Steps

### 1. Copy your files to the public folder:

```bash
# Navigate to your project
cd apple-music-player

# Copy your audio file
cp "path/to/your/To the Moon and Back.mp3" public/

# Copy your cover image  
cp "path/to/your/To the Moon and Back.png" public/
```

### 2. Verify the files are in place:

```bash
ls -la public/
```

You should see:
```
public/
├── To the Moon and Back.mp3    ← Your audio file
├── To the Moon and Back.png    ← Your cover image
├── sample.lrc                  ← English lyrics (already included)
├── sample-zh.lrc              ← Chinese lyrics (already included)
└── vite.svg
```

### 3. Start the development server:

```bash
npm run dev
```

### 4. Open your browser:
- Go to `http://localhost:5173`
- The player should automatically detect and load your files!

## 🎨 What You'll See

Once your files are in place:
- ✅ Your cover art will display in the music info section
- ✅ The audio will be ready to play
- ✅ Song title will show "To the Moon and Back"
- ✅ Bilingual lyrics will sync with the music
- ✅ Beautiful Apple Music-style effects

## 🔧 File Requirements

### Audio File
- **Name**: `To the Moon and Back.mp3`
- **Format**: MP3, AAC, OGG, WAV, or M4A
- **Size**: Recommended under 10MB for web

### Cover Image
- **Name**: `To the Moon and Back.png`
- **Format**: PNG, JPG, JPEG, or WebP
- **Size**: Recommended 500x500px or larger (square)
- **File size**: Under 500KB recommended

## 🚀 Deploy to Cloudflare Pages

After adding your files:

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Upload to Cloudflare Pages:**
   - Upload the entire `dist` folder
   - Your files will be included automatically

## 📱 Alternative: Use File Upload

If you prefer not to modify the code:
1. Start the player without adding files
2. Use the "Choose Audio File" button to upload your MP3
3. The player will work with uploaded files too!

## 🎵 Enjoy Your Music!

Once everything is set up, you'll have a professional-grade music player with:
- Beautiful Apple Music-style lyrics display
- Bilingual support (English + Chinese)
- Smooth animations and effects
- Professional UI design
- Mobile-friendly responsive layout

Happy listening! 🎧
