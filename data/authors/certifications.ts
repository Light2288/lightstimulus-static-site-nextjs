export type Certification = {
  title: string
  issuer: string
  year: number
  url?: string
}

export const certifications: Certification[] = [
  {
    title: 'AWS Certified Solutions Architect – Associate',
    issuer: 'Amazon Web Services',
    year: 2024,
    url: 'https://www.credly.com/badges/575d9bb0-c6e8-4d55-947e-65f8a2b964d7',
  },
  {
    title: 'AWS Certified AI Practitioner',
    issuer: 'Amazon Web Services',
    year: 2025,
  },
  {
    title: 'ITIL 4 Specialist: Drive Stakeholder Value',
    issuer: 'AXELOS',
    year: 2026,
  },
  {
    title: 'ITIL 4 Foundation',
    issuer: 'AXELOS',
    year: 2025,
  },
  {
    title: 'IBM Certified Mobile Application Developer',
    issuer: 'IBM',
    year: 2015,
  },
]
