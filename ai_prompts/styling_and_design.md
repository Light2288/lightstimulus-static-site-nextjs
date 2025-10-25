# 🎨 Styling & Design

## 🎨 Color Palette

Here is the color palette for the site:

- Color palette:
  - Light Theme
    - Background: #F8F9FB → very soft,
      bluish off-white
    - Text: #1C1C1E → deep neutral for good
      readability
    - Secondary text: #5C5C66 (muted gray-blue for
      metadata, subtitles)
  - Dark Theme (bluer spectrum)
    - Background: #0D1B2A → rich deep navy, avoids
      harsh black
    - Text: #E6EDF3 → light bluish-white, softer
      than #FFF, matches background’s hue
    - Secondary text: #9FBACD → desaturated light
      blue for metadata/subtitles
  - Accent Colors
    - Primary Accent: #4FD1C5 (teal / cyan) → works
      well on both light & dark, futuristic/tech feel
    - Secondary Accent: #FFB347 (warm amber/orange) →
      contrast color, good for highlights or call-to-actions
    - Optional Tertiary: #7C3AED (electric violet) →
      sparingly, for hover states or special emphasis
    - Usage:
      - Teal = links, key highlights
      - Amber = buttons, hover accents
      - Violet = occasional decorative elements (tags, code highlight keywords, etc.)

## 🔡 Typography

Here are the fonts to be used

- Fonts:
  - IBM Plex Sans → clean, slightly more “techy”,
    subtle personality. A good nod to your IBM role
    without being branded
  - paired with IBM Plex Mono for code snippets in
    the blog

Typography scale: Keep Tailwind defaults but define
a slightly larger rhythm for headings/subtitles.
Extend Tailwind’s default font size scale by approximately 1.125× for headings and subtitles.  
Apply this rhythm globally via `tailwind.config.js` theme extension to maintain consistency.

## 📏 Layout & Spacing

I have no particular indication about container width,
breakpoints, vertical rhythm, padding/margins. Just use the
common ones (for example for breakpoints use Bootstrap library
ones) and anything that is already present in Tailwind or
recommended by Tailwind best practices

## 🌗 Theme & Mode

The site should have light and dark theme, and the color palette
for these themes is specified in the point above.
The starting project from which I started creating the site already
have a theme switch button in the navigation bar, where the
choices are always light, always dark or to follow system settings.
No specific transition is needed for the passage from light to
dark theme, keep instant toggle.
The contrasts should follow accessibility rules.
Continue using `next-themes` for theme switching and persistence.  
Future customizations (e.g. animated transitions or color scheme expansions)  
can be layered on top of its context rather than replacing it.

## 💫 Visual Style

I would like a good mix of visual flair and flat/clean/minimal
design, not too much of both of them. As an iOS developer, use some
glassmorphism: glassmorphism level should be slightly pronounced
(e.g., translucent header and cards) but not too invasive.
Looking at the list of site provided
in the next point, I would say that the best is to have
a good balance of a minimalist/clean design (like mxb.dev)
and of something more visual/animated (like rammaheshwari.com),
slightly tending more to the minimalist/clean design;
surely I don't want something very elaborate
like https://tamalsen.dev (that I included more as a reference
to content disposition/site structure more than as a reference
for the graphical aspect).
As a (not too much) subtle reference my iOS background, use
glassmorphism for the header and cards, and for the footer
(the footer is not a card, but a simple div with a
transparent background). Glassmorphism should be around
20–30% blur + 60% opacity for everything (project cards, blog cards, header, footer)
, but I will evaluate possible changes for specific components
based on the specific context and page when developing that page.
For glassmorphism implementation, use backdrop-filter (true blur),
do not use simulated blur layers.
Glassmorphism parameters (blur, opacity, background color) should be defined as CSS variables in the global theme.  
Components should reference these variables through Tailwind utilities or custom classes,  
so global adjustments can be made without editing multiple components.

## 🖼️ Inspiration References

Here is a list of other developers' sites that you can take
as an inspiration for defining a structure of the page/
disposition of the content of each page for my site and also in
some cases (considering the guidelines provided at the previous
point) as a visual style inspiration:

- https://www.rammaheshwari.com
- https://chaseohlson.com
- https://tamalsen.dev
- https://blog.anniebombanie.com
- https://ianlunn.co.uk
- https://benadam.me
- https://sebkay.com
- https://michaelmannucci.com
- https://mxb.dev
