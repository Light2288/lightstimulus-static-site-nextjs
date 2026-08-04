# 💡 Light Stimulus

<div align="center">
  <img src="data/logo.svg" alt="Light Stimulus Logo" width="200"/>
  
  **Exploring AR, XR, AI, and Computer Vision Through Code**
  
  [![Next.js](https://img.shields.io/badge/Next.js-15+-black?logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
  [![Deployed on Netlify](https://img.shields.io/badge/Deployed%20on-Netlify-00C7B7?logo=netlify)](https://www.netlify.com/)
  [![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
  
  *Where cutting-edge technology meets creative experimentation*
</div>

---

## 🌟 About

**Light Stimulus** is my personal digital space — a carefully crafted platform where I document my explorations in **augmented reality (AR/XR)**, **computer vision**, **artificial intelligence**, and **generative technologies**. Beyond tech experiments, I share insights on development workflows, Swift/iOS architecture, and the evolving landscape of spatial computing.

This isn't just a blog—it's a living portfolio that showcases both the journey and the destinations of my technical adventures.

> 🔗 **Live Site**: [lightstimulus.dev](https://lightstimulus.dev)

---

## ✨ Features

### 🎨 **Adaptive Theme System**

- **Dual Mode Design**: Seamless light and dark themes
- **System-Aware**: Automatically respects OS preferences
- **Manual Control**: Easy theme toggle for user preference
- **Persistent State**: Theme choice remembered across sessions
- **Custom Color Palettes**: Carefully curated accent colors for both modes

### 📝 **Rich Content Experience**

- **MDX-Powered Blog**: Write with React components embedded in Markdown
- **Syntax Highlighting**: Beautiful code blocks with Prism
- **Math Support**: LaTeX rendering with KaTeX
- **Reading Time**: Automatic calculation for each post
- **Table of Contents**: Auto-generated navigation for long articles
- **GitHub-Style Alerts**: Enhanced callouts and notes

### 🚀 **Project Showcase**

- **Detailed Portfolio**: Comprehensive project pages with rich media
- **Tech Stack Tags**: Filterable by technologies used
- **External Links**: Direct links to live demos and repositories
- **Image Galleries**: Visual documentation of project progress
- **MDX Content**: Full flexibility in project presentation

### 🌍 **Bilingual Support**

- **English & Italian**: Full localization support
- **Seamless Switching**: Toggle between languages effortlessly
- **Localized Dates**: Proper formatting for each locale
- **Translated UI**: Complete interface translation

### 🔍 **Advanced Search**

- **Command Palette**: Kbar integration for quick navigation
- **Keyboard Shortcuts**: ⌘K / Ctrl+K to search instantly
- **Fuzzy Search**: Find content even with approximate matches
- **Category Filtering**: Search within blogs or projects

### 📱 **Performance & UX**

- **Mobile-First**: Responsive design that works on any device
- **Static Generation**: Lightning-fast page loads
- **Image Optimization**: Automatic compression and modern formats
- **Accessibility**: WCAG compliant with semantic HTML
- **Progressive Enhancement**: Works without JavaScript

### 🔗 **SEO & Discoverability**

- **OpenGraph Tags**: Beautiful social media previews
- **Meta Optimization**: Comprehensive SEO metadata
- **Sitemap Generation**: Automatic XML sitemap
- **RSS Feed**: Subscribe to blog updates
- **Structured Data**: Schema.org markup for rich results

### 📧 **Community Features**

- **Contact Form**: Netlify Forms for direct communication
- **Social Links**: Connect across multiple platforms
- **RSS Feed**: Stay updated with new content

### 🎯 **Privacy-Focused Analytics**

- **Umami Analytics**: Privacy-friendly visitor tracking
- **No Cookies**: Respects user privacy by default
- **Anonymized Data**: No personal information collected
- **GDPR Compliant**: European privacy standards

---

## 🛠️ Technical Stack

### Core Framework

- **[Next.js 15+](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[React 19](https://react.dev/)** - Latest React features

### Styling & UI

- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Motion](https://motion.dev/)** (Framer Motion) - Smooth animations
- **[GSAP](https://gsap.com/)** - Advanced animations
- **[Headless UI](https://headlessui.com/)** - Accessible component primitives
- **[Heroicons](https://heroicons.com/)** & **[Lucide React](https://lucide.dev/)** - Icon libraries

### Content Management

- **[Contentlayer2](https://contentlayer.dev/)** - Content SDK for structured data
- **[MDX](https://mdxjs.com/)** - Markdown with JSX components
- **[Gray Matter](https://github.com/jonschlinkert/gray-matter)** - Frontmatter parsing

### Content Enhancement

- **[Rehype](https://github.com/rehypejs/rehype)** & **[Remark](https://github.com/remarkjs/remark)** - Content transformation
- **[KaTeX](https://katex.org/)** - Math typesetting
- **[Prism](https://prismjs.com/)** - Syntax highlighting
- **[Reading Time](https://github.com/ngryman/reading-time)** - Estimated read duration

### Developer Experience

- **[ESLint](https://eslint.org/)** - Code linting
- **[Prettier](https://prettier.io/)** - Code formatting
- **[Husky](https://typicode.github.io/husky/)** - Git hooks
- **[lint-staged](https://github.com/okonet/lint-staged)** - Pre-commit linting

### Deployment & Analytics

- **[Netlify](https://www.netlify.com/)** - Hosting and continuous deployment
- **[Umami](https://umami.is/)** - Privacy-friendly analytics

---

## 🏗️ Project Structure

```
lightstimulus-static-site-nextjs/
├── app/                          # Next.js App Router
│   ├── about/                   # About page
│   ├── blog/                    # Blog listing and posts
│   ├── contact/                 # Contact page
│   └── projects/                # Projects showcase
├── components/                   # React components
│   ├── common/                  # Shared components (Header, Footer, etc.)
│   ├── home/                    # Homepage components
│   ├── blog/                    # Blog-specific components
│   ├── projects/                # Project-specific components
│   ├── about/                   # About page components
│   └── mdx/                     # MDX custom components
├── contexts/                     # React Context providers
│   └── LanguageContext.tsx      # Internationalization context
├── data/                         # Content and configuration
│   ├── blog/                    # Blog posts (MDX)
│   ├── projects/                # Project pages (MDX)
│   ├── authors/                 # Author profiles
│   ├── siteMetadata.js          # Site configuration
│   └── headerNavLinks.ts        # Navigation links
├── layouts/                      # Page layouts
│   ├── BlogPostLayout.tsx       # Blog post template
│   ├── ProjectLayout.tsx        # Project page template
│   └── ListWithTagsLayout.tsx   # Archive layouts
├── locales/                      # Translations
│   ├── en.json                  # English strings
│   └── it.json                  # Italian strings
├── public/                       # Static assets
│   └── static/                  # Images, favicons, etc.
├── css/                          # Global styles
├── lib/                          # Utility functions
├── scripts/                      # Build scripts
└── types/                        # TypeScript definitions
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.17 or later
- **npm** or **yarn** package manager
- **Git** for version control

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/Light2288/lightstimulus-static-site-nextjs.git
   cd lightstimulus-static-site-nextjs
   ```

2. **Install Dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set Up Environment Variables**

   Create a `.env` file in the root directory (use `.env.example` as a template):

   ```bash
   cp .env.example .env
   ```

   Configure the following variables:

   ```env
   # Analytics (Optional)
   NEXT_UMAMI_ID=your-umami-website-id

   # Base path (if deploying to a subdirectory)
   BASE_PATH=
   ```

4. **Run Development Server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run serve

# Lint code
npm run lint

# Format code
npm run lint:fix

# Analyze bundle size
npm run analyze

# Compress images
npm run compress-images
```

---

## ⚙️ Configuration

### Site Metadata

Edit `data/siteMetadata.js` to customize your site:

```javascript
const siteMetadata = {
  title: 'Your Site Title',
  author: 'Your Name',
  description: 'Your site description',
  siteUrl: 'https://yoursite.com',
  email: 'your.email@example.com',
  github: 'https://github.com/yourusername',
  linkedin: 'https://linkedin.com/in/yourusername',
  // ... more settings
}
```

### Theme Colors

Customize theme colors in `data/siteMetadata.js`:

```javascript
themeColors: {
  light: {
    background: '#f8f9fb',
    text: '#1c1c1e',
    accentPrimary: '#2e8b83',
    // ...
  },
  dark: {
    background: '#0d1b2a',
    text: '#e6edf3',
    accentPrimary: '#3fc3b9',
    // ...
  },
}
```

### Navigation

Edit `data/headerNavLinks.ts` to modify navigation:

```typescript
const headerNavLinks = [
  { href: '/', title: 'Home' },
  { href: '/blog', title: 'Blog' },
  { href: '/projects', title: 'Projects' },
  { href: '/about', title: 'About' },
  { href: '/contact', title: 'Contact' },
]
```

### Analytics Setup

1. Sign up for [Umami Analytics](https://umami.is/)
2. Get your website ID
3. Add it to your `.env` file as `NEXT_UMAMI_ID`

---

## 📁 Content Management

### Adding Blog Posts

1. Create a new `.mdx` file in `data/blog/`:

   ```bash
   data/blog/my-new-post.mdx
   ```

2. Add frontmatter:

   ```mdx
   ---
   title: 'My Amazing Post'
   date: '2024-01-15'
   tags: ['nextjs', 'web-dev']
   draft: false
   summary: 'A brief description of your post'
   images: ['/static/images/post-cover.jpg']
   ---

   Your content here...
   ```

3. Write your content using MDX (Markdown + JSX)

### Adding Projects

1. Create a new `.mdx` file in `data/projects/`:

   ```bash
   data/projects/my-project.mdx
   ```

2. Add frontmatter:

   ```mdx
   ---

   title: 'Project Name'
   date: '2024-01-15'
   tags: ['iOS', 'SwiftUI', 'AR']
   draft: false
   summary: 'Project description'
   images: ['/static/images/projects/project-cover.
   ```
