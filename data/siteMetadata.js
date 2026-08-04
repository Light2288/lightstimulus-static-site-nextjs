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
  siteLogo: `${process.env.BASE_PATH || ''}/static/images/logo/logo.svg`,
  socialBanner: `${process.env.BASE_PATH || ''}/static/images/twitter-card.png`,
  email: 'davide.aliti@gmail.com',
  github: 'https://github.com/Light2288',
  linkedin: 'https://www.linkedin.com/in/davide-aliti',
  locale: 'en-US',
  stickyNav: false,
  themeColors: {
    light: {
      background: '#f8f9fb',
      text: '#1c1c1e',
      secondaryText: '#555865',
      accentPrimary: '#2e8b83',
      accentSecondary: '#f07c23',
      accentTertiary: '#7c3aed',
    },
    dark: {
      background: '#0d1b2a',
      text: '#e6edf3',
      secondaryText: '#9fbacd',
      accentPrimary: '#3fc3b9',
      accentSecondary: '#ffa94d',
      accentTertiary: '#9d7bff',
    },
  },
  analytics: {
    umamiAnalytics: {
      umamiWebsiteId: process.env.NEXT_UMAMI_ID,
    },
  },
  // comments: {
  //   provider: 'giscus',
  //   giscusConfig: {
  //     repo: process.env.NEXT_PUBLIC_GISCUS_REPO,
  //     repositoryId: process.env.NEXT_PUBLIC_GISCUS_REPOSITORY_ID,
  //     category: process.env.NEXT_PUBLIC_GISCUS_CATEGORY,
  //     categoryId: process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID,
  //     mapping: 'pathname',
  //     reactions: '1',
  //     metadata: '0',
  //     theme: 'light',
  //     darkTheme: 'transparent_dark',
  //     themeURL: '',
  //     lang: 'en',
  //   },
  // },
  search: {
    provider: 'kbar',
    kbarConfig: {
      searchDocumentsPath: `${process.env.BASE_PATH || ''}/search.json`,
    },
  },
}

module.exports = siteMetadata
