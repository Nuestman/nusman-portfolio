import React from 'react'
import { motion } from 'framer-motion'

type Collaboration = {
  name: string
  logo?: string
  logoOnDark?: boolean
  initials: string
}

const collaborations: Collaboration[] = [
  {
    name: 'AngloGold Ashanti Ghana',
    logo: '/logos/collaborations/aga-logo-white.png',
    logoOnDark: true,
    initials: 'AGA',
  },
  {
    name: 'AGA Health Foundation',
    logo: '/logos/collaborations/agahf-logo.png',
    initials: 'AHF',
  },
  {
    name: 'EM Nurses Society of Ghana',
    logo: '/logos/collaborations/ensog-logo-green.png',
    initials: 'ENSOG',
  },
  {
    name: 'SDA Church, Kwabrafoso',
    logo: '/logos/collaborations/sda-kwabrafoso.png',
    initials: 'SDA',
  },
  {
    name: 'My Joy Medical',
    initials: 'MJM',
  },
]

const LOOP_COPIES = 4

const CollaborationCard: React.FC<{ collab: Collaboration }> = ({ collab }) => (
  <div className="w-max shrink-0 rounded-2xl border border-gray-200 bg-white px-5 py-4 text-center">
    <div
      className={`${collab.logoOnDark ? 'bg-dark-950' : 'bg-gray-50'} mx-auto mb-3 flex h-16 w-40 items-center justify-center rounded-xl p-2`}
    >
      {collab.logo ? (
        <img
          src={collab.logo}
          alt=""
          className="h-full w-full object-contain"
        />
      ) : (
        <span className="font-heading text-lg font-bold text-gold-600">{collab.initials}</span>
      )}
    </div>
    <h3 className="whitespace-nowrap font-heading text-sm font-bold text-dark-950 md:text-base">
      {collab.name}
    </h3>
  </div>
)

const Collaborations: React.FC = () => {
  return (
    <section className="bg-gray-100 py-20" aria-labelledby="collaborations-heading">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <motion.h2
            id="collaborations-heading"
            className="section-heading text-dark-950"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            I've Collaborated With...
          </motion.h2>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div
          className="collab-marquee"
          aria-label="Organizations I have collaborated with"
        >
          <div className="collab-track">
            {Array.from({ length: LOOP_COPIES }, (_, copyIndex) => (
              <div
                key={copyIndex}
                className="collab-group"
                aria-hidden={copyIndex > 0}
              >
                {collaborations.map((collab) => (
                  <CollaborationCard
                    key={`${collab.name}-${copyIndex}`}
                    collab={collab}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Collaborations
