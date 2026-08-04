import SectionContainer from '@/components/SectionContainer'
import { ContactIntro } from '@/components/contact/ContactIntro'
import { ContactForm } from '@/components/contact/ContactForm'
import { ContactMethods } from '@/components/contact/ContactMethods'
import { allAuthors } from 'contentlayer/generated'
import { genPageMetadata } from '@/app/seo'

export const metadata = genPageMetadata({
  title: 'Contact',
  description:
    'Get in touch with Davide Aliti for discussions about technology, systems, and innovative ideas.',
})

export default function ContactPage() {
  const author = allAuthors.find((a) => a.slug === 'default')

  return (
    <SectionContainer>
      <section className="pt-10 pb-16">
        <ContactIntro />

        <ContactForm />

        <ContactMethods email={author?.email} linkedin={author?.linkedin} />
      </section>
    </SectionContainer>
  )
}
