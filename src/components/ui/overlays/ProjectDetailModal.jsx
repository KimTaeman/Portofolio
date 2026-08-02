import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import useDayNight from '../../../hooks/useDayNight'

export default function ProjectDetailModal({ project, onClose = () => {} }) {
  const { isNightMode } = useDayNight()
  const closeButtonRef = useRef(null)

  useEffect(() => {
    if (!project) return undefined

    closeButtonRef.current?.focus()
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [project, onClose])

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          className={`pointer-events-auto fixed inset-0 z-50 grid place-items-center overflow-y-auto p-3 backdrop-blur-md transition-colors duration-500 sm:p-4 md:p-8 ${isNightMode ? 'bg-[#0B0D17]/75' : 'bg-[#3E2723]/45'}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={onClose}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-detail-title"
            aria-describedby="project-detail-description"
            className={`my-auto max-h-[calc(100dvh-1.5rem)] w-full max-w-4xl overflow-y-auto rounded-[1.5rem] border p-5 shadow-[0_32px_100px_rgba(15,23,42,0.42)] transition-colors duration-500 sm:rounded-[2rem] sm:p-6 md:p-10 ${isNightMode ? 'border-white/15 bg-[#1E293B]/95 text-[#F8FAFC]' : 'border-white/80 bg-[#FFF9F4] text-[#3E2723]'}`}
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: 'spring', stiffness: 280, damping: 25 }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className="flex items-start justify-between gap-3 sm:gap-6">
              <div>
                <p className={`font-serif text-xs font-semibold uppercase tracking-[0.18em] transition-colors duration-500 ${isNightMode ? 'text-[#94A3B8]' : 'text-[#8A817A]'}`}>
                  Project {project.number}
                </p>
                <h2
                  id="project-detail-title"
                  className="mt-3 font-serif text-3xl font-semibold tracking-[-0.035em] sm:text-4xl md:text-5xl"
                >
                  {project.title}
                </h2>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                className={`grid size-11 shrink-0 place-items-center rounded-full border text-xl transition-all duration-500 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#94A3B8] focus:ring-offset-2 ${isNightMode ? 'border-white/15 bg-[#334155] text-[#F8FAFC] hover:bg-[#475569]' : 'border-[#3E2723]/10 bg-white text-[#3E2723] hover:bg-[#3E2723] hover:text-white'}`}
                aria-label="Close project details"
              >
                ×
              </button>
            </header>

            <p className={`mt-5 font-sans text-lg font-medium transition-colors duration-500 ${isNightMode ? 'text-[#F8FAFC]' : 'text-[#3E2723]'}`}>
              {project.subtitle}
            </p>
            <p
              id="project-detail-description"
              className={`mt-4 max-w-3xl font-sans text-base leading-relaxed transition-colors duration-500 ${isNightMode ? 'text-[#F8FAFC]' : 'text-[#3E2723]'}`}
            >
              {project.description}
            </p>

            <div className="mt-7 flex flex-wrap gap-2" aria-label="Technologies">
              {project.stack.map((technology) => (
                <span
                  key={technology}
                  className={`rounded-full px-3.5 py-2 font-sans text-xs font-semibold transition-colors duration-500 ${isNightMode ? 'bg-[#334155] text-[#94A3B8]' : 'bg-[#EDE2D3] text-[#3E2723]'}`}
                >
                  {technology}
                </span>
              ))}
            </div>

            <div className="mt-9 grid gap-4 md:grid-cols-2" aria-label="Project screenshots">
              {project.screenshots.map((screenshot) => (
                <figure
                  key={screenshot.label}
                  className={`overflow-hidden rounded-3xl border p-3 shadow-[0_16px_40px_rgba(15,23,42,0.18)] transition-colors duration-500 ${isNightMode ? 'border-white/10 bg-[#334155]' : 'border-white bg-white'}`}
                >
                  {screenshot.src ? (
                    <img
                      src={screenshot.src}
                      alt={screenshot.label}
                      className="aspect-video w-full rounded-2xl object-cover"
                    />
                  ) : (
                    <div
                      className={`grid aspect-video place-items-center rounded-2xl text-center font-sans text-sm font-semibold uppercase tracking-[0.14em] transition-colors duration-500 ${isNightMode ? 'text-[#1E293B]' : 'text-[#3E2723]/65'}`}
                      style={{ backgroundColor: screenshot.tone }}
                    >
                      {screenshot.label}
                    </div>
                  )}
                  <figcaption className={`px-2 pb-1 pt-3 font-sans text-sm font-medium transition-colors duration-500 ${isNightMode ? 'text-[#94A3B8]' : 'text-[#3E2723]'}`}>
                    {screenshot.label}
                  </figcaption>
                </figure>
              ))}
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
