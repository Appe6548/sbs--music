# Apple Music-like Player - Deployment Guide

## Cloudflare Pages Deployment

This project is optimized for deployment on Cloudflare Pages. Follow these steps to deploy:

### Method 1: Git Integration (Recommended)

1. **Push to GitHub/GitLab**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Connect to Cloudflare Pages**
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Navigate to Pages
   - Click "Create a project"
   - Connect your Git repository
   - Select your repository

3. **Configure Build Settings**
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (or leave empty)
   - **Node.js version**: `18` or `20`

4. **Environment Variables** (if needed)
   - No special environment variables required for basic functionality

### Method 2: Direct Upload

1. **Build the project locally**
   ```bash
   npm run build
   ```

2. **Upload via Wrangler CLI**
   ```bash
   npm install -g wrangler
   wrangler pages deploy dist --project-name apple-music-player
   ```

### Method 3: Drag and Drop

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Upload via Dashboard**
   - Go to Cloudflare Pages dashboard
   - Click "Upload assets"
   - Drag and drop the `dist` folder

## Build Configuration

The project includes optimized build settings for Cloudflare Pages:

- **Headers**: Cross-origin policies for security
- **Redirects**: SPA routing support
- **Caching**: Optimized asset caching
- **Compression**: Automatic gzip/brotli compression

## Performance Optimizations

- Code splitting for vendor libraries and AMLL components
- Asset optimization and minification
- Modern ES2020 target for better performance
- Efficient chunk loading strategy

## Custom Domain (Optional)

1. In Cloudflare Pages dashboard, go to your project
2. Navigate to "Custom domains"
3. Add your domain and follow DNS configuration instructions

## Troubleshooting

### Common Issues

1. **AMLL Components not loading**
   - Ensure all AMLL dependencies are installed
   - Check browser console for WebAssembly errors
   - Verify CORS headers are properly set

2. **Audio files not playing**
   - Check file format compatibility
   - Ensure proper HTTPS for audio playback
   - Verify file upload size limits

3. **Lyrics not syncing**
   - Verify LRC file format
   - Check time format in lyrics file
   - Ensure proper encoding (UTF-8)

### Browser Compatibility

- **Minimum Requirements**: Chrome 91+, Firefox 100+, Safari 9.1+
- **Optimal Performance**: Chrome 120+, Firefox 100+, Safari 15.4+
- **Mobile**: Modern mobile browsers with WebAssembly support

## Security Considerations

- CORS policies are configured for security
- No sensitive data is stored client-side
- All audio/lyrics processing happens in the browser
- No server-side data collection

## Performance Tips

- Use modern audio formats (MP3, AAC, OGG)
- Keep lyrics files under 1MB
- Optimize audio file sizes for web playback
- Use CDN for large audio files if needed
