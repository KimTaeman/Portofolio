import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export default function ProjectDetailModal({ project, onClose = () => {} }) {
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
          className="pointer-events-auto fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#241D1A]/45 p-4 backdrop-blur-md md:p-8"
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
            className="my-auto w-full max-w-4xl rounded-[2rem] border border-white/80 bg-[#FFF9F4] p-6 text-[#3E2723] shadow-[0_32px_100px_rgba(36,29,26,0.38)] md:p-10"
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: 'spring', stiffness: 280, damping: 25 }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className="flex items-start justify-between gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#E07A5F]">
                  Project {project.number}
                </p>
                <h2
                  id="project-detail-title"
                  className="mt-3 font-serif text-4xl font-semibold tracking-[-0.035em] md:text-5xl"
                >
                  {project.title}
                </h2>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                className="grid size-11 shrink-0 place-items-center rounded-full border border-[#3E2723]/10 bg-white text-xl transition hover:-translate-y-0.5 hover:bg-[#3E2723] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#E07A5F] focus:ring-offset-2"
                aria-label="Close project details"
              >
                ×
              </button>
            </header>

            <p className="mt-5 text-lg font-medium text-[#5F4B40]">
              {project.subtitle}
            </p>
            <p
              id="project-detail-description"
              className="mt-4 max-w-3xl text-base leading-relaxed text-[#6B574B]"
            >
              {project.description}
            </p>

            <div className="mt-7 flex flex-wrap gap-2" aria-label="Technologies">
              {project.stack.map((technology) => (
                <span
                  key={technology}
                  className="rounded-full bg-[#EDE2D3] px-3.5 py-2 text-xs font-semibold text-[#4A3B32]"
                >
                  {technology}
                </span>
              ))}
            </div>

            <div className="mt-9 grid gap-4 md:grid-cols-2" aria-label="Project screenshots">
              {project.screenshots.map((screenshot) => (
                <figure
                  key={screenshot.label}
                  className="overflow-hidden rounded-3xl border border-white bg-white p-3 shadow-[0_16px_40px_rgba(62,39,35,0.1)]"
                >
                  {screenshot.src ? (
                    <img
                      src={screenshot.src}
                      alt={screenshot.label}
                      className="aspect-video w-full rounded-2xl object-cover"
                    />
                  ) : (
                    <div
                      className="grid aspect-video place-items-center rounded-2xl text-center text-sm font-semibold uppercase tracking-[0.14em] text-[#4A3B32]/65"
                      style={{ backgroundColor: screenshot.tone }}
                    >
                      {screenshot.label}
                    </div>
                  )}
                  <figcaption className="px-2 pb-1 pt-3 text-sm font-medium text-[#6B574B]">
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

