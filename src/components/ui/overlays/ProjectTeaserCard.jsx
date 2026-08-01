export default function ProjectTeaserCard({ project, onViewDetails }) {
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
          <article className="rounded-[1.75rem] border border-white/90 bg-[#FFF9F4]/95 p-6 text-left text-[#3E2723] shadow-[0_24px_70px_rgba(58,42,34,0.24)] backdrop-blur-md">
            <div
              className="mb-4 h-1.5 w-12 rounded-full"
              style={{ backgroundColor: project.accent }}
            />
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A817A]">
              Project {project.number}
            </p>
            <h3 className="mt-2 font-serif text-2xl font-semibold leading-tight">
              {project.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-[#6C5549]">
              {project.subtitle}
            </p>
            <button
              type="button"
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-[#3E2723] px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#E07A5F] focus:outline-none focus:ring-2 focus:ring-[#E07A5F] focus:ring-offset-2"
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
