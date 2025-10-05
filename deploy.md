# Deployment Guide

## 🚀 Modern Architecture Deployment

This guide covers deploying the modern portfolio website built with Vite, Tailwind CSS, and Alpine.js.

## 📋 Prerequisites

- Node.js 18.0.0 or higher
- npm 9.0.0 or higher
- Git (for version control)

## 🛠 Build Process

### 1. Install Dependencies

```bash
npm install
```

### 2. Build for Production

```bash
npm run build
```

This command will:
- Compile and optimize all assets
- Generate static files in the `dist/` directory
- Minify JavaScript and CSS
- Optimize images
- Create source maps (if enabled)

### 3. Preview Production Build

```bash
npm run preview
```

This will serve the production build locally at `http://localhost:4173`

## 🌐 Deployment Options

### Option 1: Netlify (Recommended)

1. **Connect Repository**
   - Go to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repository

2. **Build Settings**
   ```
   Build command: npm run build
   Publish directory: dist
   ```

3. **Environment Variables** (Optional)
   ```
   VITE_APP_TITLE=Numan Usman Portfolio
   VITE_CONTACT_EMAIL=nuestman@icloud.com
   ```

4. **Deploy**
   - Netlify will automatically build and deploy
   - Your site will be available at `https://your-site-name.netlify.app`

### Option 2: Vercel

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Configuration**
   - Vercel automatically detects Vite projects
   - Build command: `npm run build`
   - Output directory: `dist`

### Option 3: GitHub Pages

1. **Install gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add Deploy Script**
   ```json
   {
     "scripts": {
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **Deploy**
   ```bash
   npm run build
   npm run deploy
   ```

### Option 4: Traditional Web Hosting

1. **Build the Project**
   ```bash
   npm run build
   ```

2. **Upload Files**
   - Upload all files from the `dist/` directory
   - Ensure `index.html` is in the root directory

3. **Configure Server**
   - Ensure your server serves `index.html` for all routes
   - Configure proper MIME types for `.js` and `.css` files

## 🔧 Configuration

### Environment Variables

Create a `.env` file for environment-specific settings:

```env
# Production
VITE_APP_TITLE=Numan Usman - Nurse & Web Developer
VITE_APP_DESCRIPTION=Professional nurse and web developer specializing in responsive web design and healthcare technology solutions.
VITE_CONTACT_EMAIL=nuestman@icloud.com
VITE_CONTACT_PHONE=+233206484034
VITE_GITHUB_URL=https://github.com/Nuestman
VITE_LINKEDIN_URL=https://linkedin.com/in/numan-usman
```

### Build Optimization

The Vite configuration automatically optimizes:

- **JavaScript**: Minified and tree-shaken
- **CSS**: Minified and purged
- **Images**: Optimized and compressed
- **Assets**: Hashed for cache busting

## 📊 Performance

### Lighthouse Scores

Expected performance metrics:
- **Performance**: 95+
- **Accessibility**: 100
- **Best Practices**: 100
- **SEO**: 100

### Bundle Analysis

To analyze bundle size:

```bash
npm run build
npx vite-bundle-analyzer dist
```

## 🔒 Security

### Content Security Policy

Add CSP headers to your server configuration:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self';
```

### HTTPS

Ensure your deployment uses HTTPS:
- Netlify: Automatic HTTPS
- Vercel: Automatic HTTPS
- GitHub Pages: Automatic HTTPS
- Custom hosting: Configure SSL certificate

## 🔄 CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Netlify

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
    
    - name: Deploy to Netlify
      uses: nwtgck/actions-netlify@v2.0
      with:
        publish-dir: './dist'
        production-branch: main
        github-token: ${{ secrets.GITHUB_TOKEN }}
        deploy-message: "Deploy from GitHub Actions"
      env:
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
        NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## 🐛 Troubleshooting

### Common Issues

1. **Build Fails**
   - Check Node.js version (18+ required)
   - Clear `node_modules` and reinstall
   - Check for TypeScript errors

2. **Assets Not Loading**
   - Ensure correct base path in `vite.config.js`
   - Check file paths in HTML
   - Verify server configuration

3. **Styling Issues**
   - Ensure Tailwind CSS is properly configured
   - Check for CSS purging issues
   - Verify custom CSS is imported

4. **JavaScript Errors**
   - Check browser console for errors
   - Ensure Alpine.js is properly loaded
   - Verify component data is correct

### Debug Mode

Enable debug mode:

```bash
npm run dev -- --debug
```

## 📈 Monitoring

### Analytics

Add Google Analytics or similar:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Error Tracking

Consider adding error tracking:

```javascript
// Sentry or similar
import * as Sentry from "@sentry/browser";

Sentry.init({
  dsn: "YOUR_DSN_HERE",
  environment: "production"
});
```

## 📝 Maintenance

### Regular Updates

1. **Dependencies**
   ```bash
   npm update
   npm audit fix
   ```

2. **Content Updates**
   - Update component data
   - Refresh images and assets
   - Update contact information

3. **Performance Monitoring**
   - Regular Lighthouse audits
   - Bundle size monitoring
   - Core Web Vitals tracking

---

**Happy Deploying! 🚀**
