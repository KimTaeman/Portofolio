import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const CAMPUS_DETAILS = {
  easel: {
    eyebrow: 'Hobby · Creative practice',
    title: 'Visual exploration',
    body: 'Sketching and visual studies keep my interface work playful, observant, and open to new ideas.',
  },
  badminton: {
    eyebrow: 'Hobby · Movement',
    title: 'Rhythm and focus',
    body: 'Badminton is a reminder that consistent practice, fast feedback, and a good reset make better work.',
  },
  skills: {
    eyebrow: 'Skills · Technical foundation',
    title: 'Building for the web',
    body: 'This is the space for an approved stack: languages, frameworks, databases, and the tools that support each project.',
  },
}

export default function CampusDetailCard({ detailId, onClose = () => {} }) {
  const closeButtonRef = useRef(null)
  const detail = detailId ? CAMPUS_DETAILS[detailId] : null

  useEffect(() => {
    if (!detail) return undefined

    closeButtonRef.current?.focus()
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [detail, onClose])

  return (
    <AnimatePresence>
      {detail && (
        <motion.div
          className="pointer-events-auto fixed inset-0 z-20 flex items-center justify-center bg-[#4A3B32]/20 p-5 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={onClose}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="campus-detail-title"
            aria-describedby="campus-detail-description"
            className="w-full max-w-md rounded-[2rem] border border-white/80 bg-[#FFF9F4] p-7 text-[#4A3B32] shadow-[0_24px_80px_rgba(74,59,50,0.28)] md:p-9"
            initial={{ opacity: 0, scale: 0.94, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-5">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#E07A5F]">
                {detail.eyebrow}
              </p>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                className="-mr-2 -mt-2 grid size-10 shrink-0 place-items-center rounded-full border border-[#4A3B32]/10 bg-white text-lg font-semibold transition hover:bg-[#4A3B32] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#E07A5F] focus:ring-offset-2"
                aria-label="Close Campus detail"
              >
                ×
              </button>
            </div>
            <h2
              id="campus-detail-title"
              className="mt-7 font-serif text-3xl font-semibold leading-tight tracking-[-0.025em]"
            >
              {detail.title}
            </h2>
            <p
              id="campus-detail-description"
              className="mt-5 text-base leading-relaxed text-[#5F4B40]"
            >
              {detail.body}
            </p>
            {detailId === 'skills' && (
              <div className="mt-7 flex flex-wrap gap-2" aria-label="Example skills">
                {['Frontend systems', 'Interactive 3D', 'Accessible UI'].map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-[#E9DDC9] px-3 py-1.5 text-xs font-semibold text-[#4A3B32]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
