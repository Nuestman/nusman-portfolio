import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Download, Mail, MapPin, Phone } from 'lucide-react'
import { Button } from '../components/ui/button'
import { usePageMeta } from '../hooks/usePageMeta'
import {
  RESUME_PDF_HREF,
  resumeAdditionalExperience,
  resumeAffiliations,
  resumeCertifications,
  resumeEducation,
  resumeExperience,
  resumeMeta,
  resumeReferences,
  resumeSkills,
} from '../data/resume'

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-heading text-3xl text-dark-950 md:text-4xl">
      {children}
    </h2>
  )
}

const ResumePage: React.FC = () => {
  usePageMeta({
    title: 'Resume | Numan Usman',
    description:
      'Curriculum vitae for Numan Usman — certified emergency nurse, mining emergency responder, and health informatician based in Obuasi, Ghana.',
    path: '/resume',
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gold-50 pt-20">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <motion.header
          className="mx-auto grid max-w-4xl gap-8 md:grid-cols-[minmax(0,14rem)_1fr] md:items-stretch md:gap-10"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="mx-auto aspect-square w-40 shrink-0 overflow-hidden rounded-2xl sm:w-44 md:mx-0 md:aspect-auto md:h-full md:w-full">
            <img
              src="/images/portraits/numan-caricature.png"
              alt="Caricature portrait of Numan Usman"
              width={440}
              height={440}
              className="h-full w-full object-cover object-top"
            />
          </div>

          <div className="min-w-0 text-center md:text-left">
            <h1 className="section-heading text-dark-950">{resumeMeta.name}</h1>
            <p className="mt-4 max-w-2xl text-lg text-gray-700 md:text-xl">
              {resumeMeta.titles.join(' · ')}
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-gray-600 md:justify-start">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-gold-500" aria-hidden="true" />
                {resumeMeta.location}
              </span>
              {resumeMeta.phones.map((phone) => (
                <a
                  key={phone}
                  href={`tel:${phone.replace(/\s/g, '')}`}
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-gold-600"
                >
                  <Phone className="h-4 w-4 text-gold-500" aria-hidden="true" />
                  {phone}
                </a>
              ))}
              <a
                href={`mailto:${resumeMeta.email}`}
                className="inline-flex items-center gap-1.5 transition-colors hover:text-gold-600"
              >
                <Mail className="h-4 w-4 text-gold-500" aria-hidden="true" />
                {resumeMeta.email}
              </a>
            </div>

            <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center md:justify-start">
              <Button asChild size="lg" className="px-8">
                <Link to="/start">Start a project with me</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="px-8">
                <a href={RESUME_PDF_HREF} download>
                  <Download className="mr-2 h-5 w-5" aria-hidden="true" />
                  Download Resume
                </a>
              </Button>
            </div>
          </div>
        </motion.header>

        <div className="mx-auto mt-14 max-w-4xl space-y-14">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            aria-labelledby="resume-profile"
          >
            <SectionHeading>
              <span id="resume-profile">Professional profile</span>
            </SectionHeading>
            <p className="mt-4 text-base leading-relaxed text-gray-700 md:text-lg">
              {resumeMeta.profile}
            </p>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            aria-labelledby="resume-skills"
          >
            <SectionHeading>
              <span id="resume-skills">Core skills</span>
            </SectionHeading>
            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              {resumeSkills.map((skill) => (
                <li
                  key={skill}
                  className="border-l-2 border-gold-500 pl-3 text-sm leading-snug text-gray-700 md:text-base"
                >
                  {skill}
                </li>
              ))}
            </ul>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            aria-labelledby="resume-experience"
          >
            <SectionHeading>
              <span id="resume-experience">Work experience</span>
            </SectionHeading>
            <ol className="mt-8 space-y-10">
              {resumeExperience.map((role) => (
                <li key={`${role.title}-${role.dates}`} className="relative pl-5">
                  <span
                    className="absolute left-0 top-1.5 h-full w-px bg-gray-200"
                    aria-hidden="true"
                  />
                  <span
                    className="absolute left-[-3px] top-2 h-2 w-2 rounded-full bg-gold-500"
                    aria-hidden="true"
                  />
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                    <h3 className="text-lg font-semibold text-dark-950 md:text-xl">
                      {role.title}
                    </h3>
                    <p className="shrink-0 text-sm font-medium text-gold-600">
                      {role.dates}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-gray-600 md:text-base">{role.org}</p>
                  {role.summary ? (
                    <p className="mt-3 text-sm leading-relaxed text-gray-700 md:text-base">
                      {role.summary}
                    </p>
                  ) : null}
                  <ul className="mt-3 space-y-2">
                    {role.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="text-sm leading-relaxed text-gray-700 md:text-base"
                      >
                        <span className="mr-2 text-gold-500" aria-hidden="true">
                          —
                        </span>
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>

            <div className="mt-10 border-t border-gray-200 pt-8">
              <h3 className="text-base font-semibold text-dark-950 md:text-lg">
                Additional emergency response experience
              </h3>
              <ul className="mt-3 space-y-2">
                {resumeAdditionalExperience.map((item) => (
                  <li
                    key={item}
                    className="text-sm leading-relaxed text-gray-700 md:text-base"
                  >
                    <span className="mr-2 text-gold-500" aria-hidden="true">
                      —
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            aria-labelledby="resume-certs"
          >
            <SectionHeading>
              <span id="resume-certs">Professional development & certifications</span>
            </SectionHeading>
            <ul className="mt-6 divide-y divide-gray-200 border-y border-gray-200">
              {resumeCertifications.map((item) => (
                <li
                  key={item.title}
                  className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
                >
                  <span className="text-sm font-medium text-dark-950 md:text-base">
                    {item.title}
                  </span>
                  <span className="shrink-0 text-sm text-gray-500">{item.detail}</span>
                </li>
              ))}
            </ul>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            aria-labelledby="resume-education"
          >
            <SectionHeading>
              <span id="resume-education">Education</span>
            </SectionHeading>
            <ul className="mt-6 space-y-4">
              {resumeEducation.map((item) => (
                <li key={item.title}>
                  <p className="text-base font-semibold text-dark-950 md:text-lg">
                    {item.title}
                  </p>
                  <p className="text-sm text-gray-600 md:text-base">{item.detail}</p>
                </li>
              ))}
            </ul>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            aria-labelledby="resume-affiliations"
          >
            <SectionHeading>
              <span id="resume-affiliations">Affiliations & volunteer work</span>
            </SectionHeading>
            <ul className="mt-5 space-y-3">
              {resumeAffiliations.map((item) => (
                <li
                  key={item}
                  className="border-l-2 border-gold-500 pl-3 text-sm leading-relaxed text-gray-700 md:text-base"
                >
                  {item}
                </li>
              ))}
            </ul>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            aria-labelledby="resume-references"
            className="pb-8"
          >
            <SectionHeading>
              <span id="resume-references">References</span>
            </SectionHeading>
            <ul className="mt-6 grid gap-6 sm:grid-cols-3">
              {resumeReferences.map((ref) => (
                <li key={ref.email} className="space-y-1">
                  <p className="font-semibold text-dark-950">{ref.name}</p>
                  <p className="text-sm text-gray-600">{ref.title}</p>
                  <a
                    href={`tel:${ref.phone}`}
                    className="block text-sm text-gold-600 hover:text-gold-700"
                  >
                    {ref.phone}
                  </a>
                  <a
                    href={`mailto:${ref.email}`}
                    className="block break-all text-sm text-gold-600 hover:text-gold-700"
                  >
                    {ref.email}
                  </a>
                </li>
              ))}
            </ul>
          </motion.section>
        </div>
      </div>
    </div>
  )
}

export default ResumePage
