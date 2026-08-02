import useDayNight from '../../../hooks/useDayNight'

export default function IntroOverlay() {
  const { isNightMode } = useDayNight()

  return (
    <div className="pointer-events-none absolute left-6 top-8 z-10 max-w-[450px] md:left-10 md:top-12">
      <h1 className={`font-serif text-2xl font-semibold leading-snug transition-colors duration-500 md:text-4xl ${isNightMode ? 'text-[#F8FAFC]' : 'text-[#3E2723]'}`}>
        Hi, I&apos;m [Your Name]! Welcome to my world. I&apos;m a developer who believes every
        great project starts with curiosity.
      </h1>
    </div>
  )
}
