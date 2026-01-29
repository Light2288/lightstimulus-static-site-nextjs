import SectionContainer from '@/components/SectionContainer'
import { ContactIntro } from '@/components/contact/ContactIntro'
import { ContactMethods } from '@/components/contact/ContactMethods'
import { allAuthors } from 'contentlayer/generated'

export default function ContactPage() {
  const author = allAuthors.find((a) => a.slug === 'default')

  return (
    <SectionContainer>
      <section className="pt-10 pb-16">
        <ContactIntro />

        <ContactMethods email={author?.email} linkedin={author?.linkedin} />
      </section>
    </SectionContainer>
  )
}
