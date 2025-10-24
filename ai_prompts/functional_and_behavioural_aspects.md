# ⚙️ Functional & Behavioral Aspects

## 📈 SEO & Metadata

I don't have much technical knowledge about SEO and Metadata to provide
indications for this point. All I can say is that for SEO & discoverability,
site should be optimised both for personal branding (so recruiters,
collaborators, etc. find you easily), and for developer community
traffic (technical blog posts being indexed, discoverable on Google).
As you can see from the project current structure, there is already a
seo.tsx file, a sitemap.ts file, a robot.ts file, a siteMetadata.js file,
and in the package.json the "next-seo" package is included.

## ♿ Accessibility Goals

Classic accessibility target should be respected, if the actions to be
taken to fulfill accessibility guidelines are not too strict / have a
negative impact on the site structure or content

## ⚡ Performance Expectations

No particular performance level is expected, but consider all the possible
optimization you can make (for example lazy loading, image optimization, etc).
At the moment the site should use static export, and for this reason the
image optimization needed to be disabled. Here is the current content of
the next.config.js file:

```
const { withContentlayer } = require('next-contentlayer2')

const withBundleAnalyzer = require('@next/bundle-analyzer')({
enabled: process.env.ANALYZE === 'true',
})

// You might need to insert additional domains in script-src if you are using external services
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' giscus.app analytics.umami.is;
  style-src 'self' 'unsafe-inline';
  img-src * blob: data:;
  media-src *.s3.amazonaws.com;
  connect-src *;
  font-src 'self';
  frame-src giscus.app
`

const securityHeaders = [
// https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
{
key: 'Content-Security-Policy',
value: ContentSecurityPolicy.replace(/\n/g, ''),
},
// https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy
{
key: 'Referrer-Policy',
value: 'strict-origin-when-cross-origin',
},
// https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options
{
key: 'X-Frame-Options',
value: 'DENY',
},
// https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options
{
key: 'X-Content-Type-Options',
value: 'nosniff',
},
// https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-DNS-Prefetch-Control
{
key: 'X-DNS-Prefetch-Control',
value: 'on',
},
// https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security
{
key: 'Strict-Transport-Security',
value: 'max-age=31536000; includeSubDomains',
},
// https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Feature-Policy
{
key: 'Permissions-Policy',
value: 'camera=(), microphone=(), geolocation=()',
},
]

const output = 'export' // always generate static export
const basePath = process.env.BASE_PATH || undefined

/**
* @type {import('next/dist/next-server/server/config').NextConfig}
  **/
  module.exports = () => {
  const plugins = [withContentlayer, withBundleAnalyzer]
  return plugins.reduce((acc, next) => next(acc), {
  output,
  basePath,
  reactStrictMode: true,
  trailingSlash: false,
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  eslint: {
  dirs: ['app', 'components', 'layouts', 'scripts'],
  },
  images: {
  remotePatterns: [
  {
  protocol: 'https',
  hostname: 'picsum.photos',
  },
  ],
  unoptimized: true,
  },
  async headers() {
  return [
  {
  source: '/(.*)',
  headers: securityHeaders,
  },
  ]
  },
  webpack: (config, options) => {
  config.module.rules.push({
  test: /\.svg$/,
  use: ['@svgr/webpack'],
  })

  return config
  },
  })
  }
```

## 🧩 Reusability & UI Kit

The components you will generate should be as reusable as possible but
this should not influence other decisions you can take when creating the
site pages (for example, is it ok to create two different project cards,
if this will ever be a component for the site, if one card works better in the
homepage and the other card works better in the projects page)
No particular UI Kit or design token will be used, the styling will be
made with the Tailwind library and Tailwind configurations as said before

## 🧠 Analytics & Integrations

At the moment no particular analytics service is requested, even if
in the starting project I see that another library from the same author
of the starting project is included in the dependencies ([Pliny](https://github.com/timlrx/pliny)).
I will add other info about this package and its Readme file in the "Optional extras" section
For now, just keep a placeholder for the analytics.
The contact form should use Netlify Forms, and the social links
should be added to the footer. The form should submit directly
and show a custom success message if the form is submitted successfully.
In case of error, the validation should be made also on
the client side (basic name/email/message.

## 🔒 Privacy or Legal

As before, I don't have much knowledge about privacy and legal topics.
Evaluate is something needs to be added to manage cookie banners and
privacy policy. In the starting project, I don't see any cookie banner
or privacy policy section, and for now I don't expect to use cookies or
similar to track user, but add anything needed for any eventual legal
requisite that the site can require.
