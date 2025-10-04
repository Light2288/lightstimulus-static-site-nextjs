/** @type {import("pliny/config").PlinyConfig } */
const siteMetadata = {
  title: 'Light Stimulus',
  author: 'Davide Aliti',
  headerTitle: 'LightStimulus',
  description: 'Exploring AR, XR, AI, and computer vision through code and experimental projects.',
  language: 'en-US',
  theme: 'system', // system, dark or light
  siteUrl: 'https://lightstimulus.dev',
  siteRepo: 'https://github.com/Light2288/lightstimulus.dev',
  siteLogo: `${process.env.BASE_PATH || ''}/static/images/logo.svg`,
  socialBanner: `${process.env.BASE_PATH || ''}/static/images/twitter-card.png`,
  email: 'davide.aliti@gmail.com',
  github: 'https://github.com/Light2288',
  linkedin: 'https://www.linkedin.com/in/davide-aliti',
  locale: 'en-US',
  stickyNav: false,
  themeColors: {
    light: {
      background: '#F8F9FB',
      text: '#1C1C1E',
      secondaryText: '#5C5C66',
      accentPrimary: '#4FD1C5',
      accentSecondary: '#FFB347',
      accentTertiary: '#7C3AED',
    },
    dark: {
      background: '#0D1B2A',
      text: '#E6EDF3',
      secondaryText: '#9FBACD',
      accentPrimary: '#4FD1C5',
      accentSecondary: '#FFB347',
      accentTertiary: '#7C3AED',
    },
  },
  analytics: {
    umamiAnalytics: {
      umamiWebsiteId: process.env.NEXT_UMAMI_ID,
    },
  },
  newsletter: {
    provider: 'buttondown',
  },
  comments: {
    provider: 'giscus',
    giscusConfig: {
      repo: process.env.NEXT_PUBLIC_GISCUS_REPO,
      repositoryId: process.env.NEXT_PUBLIC_GISCUS_REPOSITORY_ID,
      category: process.env.NEXT_PUBLIC_GISCUS_CATEGORY,
      categoryId: process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID,
      mapping: 'pathname',
      reactions: '1',
      metadata: '0',
      theme: 'light',
      darkTheme: 'transparent_dark',
      themeURL: '',
      lang: 'en',
    },
  },
  search: {
    provider: 'kbar',
    kbarConfig: {
      searchDocumentsPath: `${process.env.BASE_PATH || ''}/search.json`,
    },
  },
}

module.exports = siteMetadata
