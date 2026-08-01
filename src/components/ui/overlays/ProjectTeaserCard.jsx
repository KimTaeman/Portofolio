import useDayNight from '../../../hooks/useDayNight'

export default function ProjectTeaserCard({ project, onViewDetails }) {
  const { isNightMode } = useDayNight()

  return (
    <div
      className="pointer-events-none fixed inset-0 z-30"
      aria-live="polite"
    >
      <div
        className={`absolute bottom-6 right-4 w-[min(360px,calc(100vw-2rem))] transition-[opacity,transform,visibility] duration-300 sm:bottom-auto sm:right-[5%] sm:top-[22%] ${
          project
            ? 'pointer-events-auto visible translate-x-0 scale-100 opacity-100'
            : 'pointer-events-none invisible translate-x-[18px] scale-95 opacity-0'
        }`}
        aria-hidden={project ? 'false' : 'true'}
      >
        {project && (
          <article className={`rounded-[1.75rem] border p-6 text-left shadow-[0_24px_70px_rgba(15,23,42,0.3)] backdrop-blur-md transition-colors duration-500 ${isNightMode ? 'border-white/15 bg-[#1E293B]/90 text-[#F8FAFC]' : 'border-white/90 bg-[#FFF9F4]/95 text-[#3E2723]'}`}>
            <div
              className="mb-4 h-1.5 w-12 rounded-full"
              style={{ backgroundColor: project.accent }}
            />
            <p className={`font-serif text-[10px] font-semibold uppercase tracking-[0.18em] transition-colors duration-500 ${isNightMode ? 'text-[#94A3B8]' : 'text-[#8A817A]'}`}>
              Project {project.number}
            </p>
            <h3 className="mt-2 font-serif text-2xl font-semibold leading-tight">
              {project.title}
            </h3>
            <p className={`mt-3 font-sans text-sm leading-relaxed transition-colors duration-500 ${isNightMode ? 'text-[#F8FAFC]' : 'text-[#3E2723]'}`}>
              {project.subtitle}
            </p>
            <button
              type="button"
              className={`mt-5 inline-flex min-h-11 items-center justify-center rounded-full px-5 py-2.5 font-sans text-sm font-semibold transition-all duration-500 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#94A3B8] focus:ring-offset-2 ${isNightMode ? 'bg-[#F8FAFC] text-[#1E293B] hover:bg-white' : 'bg-[#3E2723] text-[#FFF9F4] hover:bg-[#8A817A]'}`}
              onClick={() => onViewDetails(project.id)}
            >
              View Details
            </button>
          </article>
        )}
      </div>
    </div>
  )
}
