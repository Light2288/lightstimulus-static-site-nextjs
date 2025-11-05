import SectionContainer from './SectionContainer'
import Footer from './common/Footer'
import { ReactNode } from 'react'
import Header from './common/Header'

interface Props {
  children: ReactNode
}

const LayoutWrapper = ({ children }: Props) => {
  return (
    <SectionContainer>
      <div className="flex h-screen flex-col justify-between bg-[var(--color-bg-light)] font-sans text-[var(--color-text-light)] dark:bg-[var(--color-bg-dark)] dark:text-[var(--color-text-dark)]">
        <Header />
        <main className="mb-auto pt-16">{children}</main>
        <Footer />
      </div>
    </SectionContainer>
  )
}

export default LayoutWrapper
