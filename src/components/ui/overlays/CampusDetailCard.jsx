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
          className="pointer-events-auto fixed inset-0 z-20 flex items-center justify-center bg-[#18213d]/20 p-5 backdrop-blur-sm"
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
            className="w-full max-w-md rounded-[2rem] border border-white/80 bg-[#fffaf0] p-7 text-[#18213d] shadow-[0_24px_80px_rgba(24,33,61,0.28)] md:p-9"
            initial={{ opacity: 0, scale: 0.94, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-5">
              <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.2em] text-[#e88c47]">
                {detail.eyebrow}
              </p>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                className="-mr-2 -mt-2 grid size-10 shrink-0 place-items-center rounded-full border border-[#18213d]/10 bg-white text-lg font-bold transition hover:bg-[#18213d] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#e88c47] focus:ring-offset-2"
                aria-label="Close Campus detail"
              >
                ×
              </button>
            </div>
            <h2
              id="campus-detail-title"
              className="mt-7 text-4xl font-black leading-none tracking-[-0.045em]"
            >
              {detail.title}
            </h2>
            <p
              id="campus-detail-description"
              className="mt-5 text-base leading-relaxed text-[#4d5874]"
            >
              {detail.body}
            </p>
            {detailId === 'skills' && (
              <div className="mt-7 flex flex-wrap gap-2" aria-label="Example skills">
                {['Frontend systems', 'Interactive 3D', 'Accessible UI'].map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-[#e9ddc9] px-3 py-1.5 text-xs font-bold text-[#29324c]"
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
