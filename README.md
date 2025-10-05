# Numan Usman - Portfolio

A modern, responsive portfolio website built with React, TypeScript, and Tailwind CSS.

## 🚀 Live Demo

Visit the live site: [nusman.dev](https://nusman.dev)

## 🛠️ Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/UI & Radix UI
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Routing**: React Router
- **Fonts**: Google Fonts (Inter, Odibee Sans)
- **Deployment**: Vercel

## ✨ Features

- **Responsive Design**: Mobile-first approach with beautiful animations
- **Modern UI**: Clean, professional design with gold accent colors
- **Interactive Sections**:
  - Hero section with dynamic role display
  - Skills showcase with tool icons
  - "What I Can Do" services section
  - "My Process" workflow explanation
  - Contact form with validation
  - Portfolio project showcase
  - About page with tabbed life story
- **Performance**: Optimized with Vite for fast loading
- **SEO Ready**: Meta tags, structured data, and semantic HTML

## 🎨 Design System

- **Colors**: 
  - Primary: `#150F00` (Dark Brown)
  - Accent: `#B98C1B` (Gold)
  - Background: White/Gold gradients
- **Typography**: 
  - Headings: Odibee Sans (Google Font)
  - Body: Inter (Google Font)
- **Components**: Modular, reusable React components

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Button, Card)
│   ├── Header.tsx      # Navigation header
│   ├── Hero.tsx        # Hero section
│   ├── Skills.tsx      # Skills showcase
│   ├── WhatICanDo.tsx  # Services section
│   ├── MyProcess.tsx   # Process explanation
│   ├── Contact.tsx     # Contact form
│   ├── Footer.tsx      # Site footer
│   └── Layout.tsx      # Main layout wrapper
├── pages/              # Page components
│   ├── HomePage.tsx    # Landing page
│   ├── AboutPage.tsx   # About with life story
│   ├── ContactPage.tsx # Dedicated contact page
│   └── PortfolioPage.tsx # Project showcase
├── lib/                # Utility functions
└── main.tsx           # App entry point
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Nuestman/nusman-portfolio.git
   cd nusman-portfolio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:5173
   ```

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## 🎯 Pages & Routes

- `/` - Homepage (Hero, Skills, Services, Process, Contact)
- `/about` - About page with life story tabs
- `/portfolio` - Project showcase with filtering
- `/contact` - Dedicated contact page

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Deploy!

### Manual Build

```bash
npm run build
# Upload the 'dist' folder to your hosting provider
```

## 🎨 Customization

### Adding New Projects

Edit `src/pages/PortfolioPage.tsx` and add to the `projects` array:

```typescript
const projects = [
  {
    title: "Your Project",
    description: "Project description",
    image: "/path/to/image.png",
    technologies: ["React", "TypeScript"],
    liveUrl: "https://your-project.com",
    githubUrl: "https://github.com/username/project"
  }
];
```

### Updating Skills

Edit `src/components/Skills.tsx` and modify the `skills` array with your tools and technologies.

### Changing Colors

Update `tailwind.config.js` to modify the color scheme:

```javascript
colors: {
  'dark-950': '#150F00',
  'gold-500': '#B98C1B',
  // ... other colors
}
```

## 📱 Responsive Design

The portfolio is fully responsive with breakpoints:
- Mobile: `< 768px`
- Tablet: `768px - 1024px`
- Desktop: `> 1024px`

## 🔧 Development

### Adding New Components

1. Create component in `src/components/`
2. Import and use in pages
3. Follow existing patterns for consistency

### Styling Guidelines

- Use Tailwind CSS utility classes
- Follow the established color scheme
- Use `font-heading` for headings (Odibee Sans)
- Use `font-sans` for body text (Inter)

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Contact

**Numan Usman**
- Email: [nusman@icloud.com]
- LinkedIn: [https://www.linkedin.com/in/numan-usman/]
- GitHub: [@Nuestman](https://github.com/Nuestman)

---

Built with ❤️ by Numan Usman