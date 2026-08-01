import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import useDayNight from '../../../hooks/useDayNight'

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
  const { isNightMode } = useDayNight()
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
          className={`pointer-events-auto fixed inset-0 z-20 flex items-center justify-center p-5 backdrop-blur-sm transition-colors duration-500 ${isNightMode ? 'bg-[#0B0D17]/65' : 'bg-[#3E2723]/20'}`}
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
            className={`w-full max-w-md rounded-[2rem] border p-7 shadow-[0_24px_80px_rgba(15,23,42,0.32)] transition-colors duration-500 md:p-9 ${isNightMode ? 'border-white/15 bg-[#1E293B]/95 text-[#F8FAFC]' : 'border-white/80 bg-[#FFF9F4] text-[#3E2723]'}`}
            initial={{ opacity: 0, scale: 0.94, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-5">
              <p className={`font-serif text-xs font-semibold uppercase tracking-[0.15em] transition-colors duration-500 ${isNightMode ? 'text-[#94A3B8]' : 'text-[#8A817A]'}`}>
                {detail.eyebrow}
              </p>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                className={`-mr-2 -mt-2 grid size-10 shrink-0 place-items-center rounded-full border text-lg font-semibold transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-[#94A3B8] focus:ring-offset-2 ${isNightMode ? 'border-white/15 bg-[#334155] text-[#F8FAFC] hover:bg-[#475569]' : 'border-[#3E2723]/10 bg-white text-[#3E2723] hover:bg-[#3E2723] hover:text-white'}`}
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
              className={`mt-5 font-sans text-base leading-relaxed transition-colors duration-500 ${isNightMode ? 'text-[#F8FAFC]' : 'text-[#3E2723]'}`}
            >
              {detail.body}
            </p>
            {detailId === 'skills' && (
              <div className="mt-7 flex flex-wrap gap-2" aria-label="Example skills">
                {['Frontend systems', 'Interactive 3D', 'Accessible UI'].map((skill) => (
                  <span
                    key={skill}
                    className={`rounded-full px-3 py-1.5 font-sans text-xs font-semibold transition-colors duration-500 ${isNightMode ? 'bg-[#334155] text-[#94A3B8]' : 'bg-[#E9DDC9] text-[#3E2723]'}`}
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
