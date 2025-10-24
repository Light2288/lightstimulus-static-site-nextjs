# 📁 Pages & Site Structure

## 🌐 Overview

Here is a list of all the pages I am considering for now.
In the future I will probably add a newsletter / mailing list
later (like a small audience-builder), but for now keep things
simple and do not add this page. For the key content, I will
provide what I think should be included, but feel free to suggest
any improvement and additional content, or to remove or modify
some content I considered if this is not a best practice/useful
in your opinion.
The site should at least have an home page, a project page,
a bio/about page, a blog page and a contact page.

| Page     | Purpose / Key Content                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| Home     | Short intro, featured projects, few of the most recent blog articles. After hero, sections should be Featured Projects → Latest Blog -> Simplified contact form -> Footer, on this order; for the homepage, use a scroll-to-section behaviour for anchors (e.g. Projects, Blog); featured project should show 3 or 4 project cards with preview animation; latest blog should show the preview of latest 4 blog articles                                                                                                                                                                                                                                                                                                                                                                                                                            |
| About    | Bio, experience, photo is not mandatory; tone of the page should be "colloquial", without direct references to IBM (even if my current job can be cited)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Projects | All portfolio items with filters; Projects page should only showcase personal/experimental projects (computer vision, XR, Snowflake demos, AI workflows, etc.); projects are stored in mdx files, one for each project; the projects home should have a grid of projects with tags/filters (filters be a sidebar on the left on desktop / dropdown on top of the list on mobile), and clicking on a project should redirect the user to the specific project detail page.the project cards in the main home page and project home page should only have an image and a descriptive content; the project detail page will have more info (more images, longer description, GitHub links and live demo only if possible). Project cards should have hover animations (glassmorphism); project cards should open in dedicated route (/projects/[slug]) |
| Blog     | Articles and notes; blog style should be technical deep dives/tutorials (e.g., Gatsby, XR, AI workflows, SwiftUI tips), and short reflections/essays; blog posts are stored in mdx files, one for each post; like in the starting project, the blog homepage should display a a list with tag filters sidebar on the left and blog posts preview on the right; clicking on a post preview redirect the user to the specific blog post page. Blog cards should have hover animations (glassmorphism); filters as sidebar (like tags); blog cards should open in dedicated route; the card should include estimated read time and date of publication                                                                                                                                                                                                 |     |
| Contact  | just a simple form that actually sends emails via Netlify Forms; form should be simple name/email/message; in the same page, social links                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |

## 🧩 Global Components

The global component reused across pages should be

- header: should contain the logo, navigation bar to move across
  pages, a search button and a toggle for dark and light switch; header is
  hidden/revealed dynamically; it should appear immediately on page load,
  and we want it to hide on scroll down / reveal on scroll up, with a smooth
  transition (tranlsation); at the beginning the header should be transparent
  over the hero then solid on scroll.
  For the scroll behavior for Header, it should smoothly fade in/out.
- search button: Use Pliny Kbar for local search (cmd+k); in the
  initial header version of the starting project, there is already a
  visible search button in the header.
- theme toggle is part of the header and must keep the three options system
  (light / dark / system) and save user preference in local storage
- footer: minimal footer with social links icons for email, github, linkedin,
  and the copyright info; in the future maybe i will add an input to
  subscribe to the newsletter
- a layout wrapper already present in the documents
- please suggest any other cross component that could be userful

## 🔗 Navigation & Routing

Navigation is performed through the menu in the header that exposes
all the available pages, except for the detail page for blog article
and for project details. The header should not be fixed but about
this make your proposal, always thinking in a creative way
The active link in the navbar should be highlighted
