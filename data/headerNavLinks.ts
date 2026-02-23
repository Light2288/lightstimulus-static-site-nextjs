export interface NavLink {
  href: string
  title: string
}

const headerNavLinks: NavLink[] = [
  { href: '/', title: 'Home' },
  { href: '/projects', title: 'Projects' },
  { href: '/blog', title: 'Blog' },
  { href: '/about', title: 'About' },
  { href: '/contact', title: 'Contact' },
]

export default headerNavLinks
