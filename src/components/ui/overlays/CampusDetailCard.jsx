import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import useDayNight from '../../../hooks/useDayNight'
import { CAMPUS_LANDMARKS } from '../../../config/narrativeTimeline'

const CAMPUS_DETAIL_META = {
  easel: {
    eyebrow: 'Hobby · Traditional art',
  },
  badminton: {
    eyebrow: 'Hobby · Movement',
  },
  skills: {
    eyebrow: 'Skills · Technical foundation',
  },
}

const CAMPUS_DETAILS = Object.fromEntries(
  CAMPUS_LANDMARKS.map(({ id, title, text, techList }) => [
    id,
    {
      ...CAMPUS_DETAIL_META[id],
      title,
      body: text,
      techList,
    },
  ]),
)

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
          className="pointer-events-auto fixed inset-0 z-20 flex items-end justify-end p-3 sm:p-5 lg:p-8"
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
            className={`max-h-[min(34rem,calc(100dvh-1.5rem))] w-[90vw] max-w-[390px] overflow-y-auto rounded-[1.5rem] border p-5 shadow-[0_24px_80px_rgba(15,23,42,0.28)] backdrop-blur-xl transition-colors duration-500 sm:rounded-[1.75rem] sm:p-7 ${isNightMode ? 'border-white/15 bg-[#1E293B]/90 text-[#F8FAFC]' : 'border-white/80 bg-[#FFF9F4]/90 text-[#3E2723]'}`}
            initial={{ opacity: 0, scale: 0.96, x: 24, y: 14 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, x: 18, y: 10 }}
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
                className={`-mr-2 -mt-2 grid size-12 shrink-0 place-items-center rounded-full border text-lg font-semibold transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-[#94A3B8] focus:ring-offset-2 sm:size-10 ${isNightMode ? 'border-white/15 bg-[#334155] text-[#F8FAFC] hover:bg-[#475569]' : 'border-[#3E2723]/10 bg-white text-[#3E2723] hover:bg-[#3E2723] hover:text-white'}`}
                aria-label="Close Campus detail"
              >
                ×
              </button>
            </div>
            <h2
              id="campus-detail-title"
              className="mt-5 font-serif text-2xl font-semibold leading-tight tracking-[-0.025em] sm:mt-7 sm:text-3xl"
            >
              {detail.title}
            </h2>
            <p
              id="campus-detail-description"
              className={`mt-5 font-sans text-base leading-relaxed transition-colors duration-500 ${isNightMode ? 'text-[#F8FAFC]' : 'text-[#3E2723]'}`}
            >
              {detail.body}
            </p>
            {detail.techList?.length > 0 && (
              <ul
                className={`mt-5 list-inside list-disc space-y-2 font-sans text-sm font-medium transition-colors duration-500 ${isNightMode ? 'text-[#E2E8F0] marker:text-[#94A3B8]' : 'text-[#3E2723] marker:text-[#8A817A]'}`}
                aria-label="Core technologies"
              >
                {detail.techList.map((technology) => (
                  <li key={technology}>{technology}</li>
                ))}
              </ul>
            )}
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
