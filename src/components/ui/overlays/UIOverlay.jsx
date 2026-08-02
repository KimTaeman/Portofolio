import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { FaEnvelope, FaGithub, FaLinkedinIn, FaTimes } from 'react-icons/fa'
import useDayNight from '../../../hooks/useDayNight'
import {
  SCENES,
  SCENE_RANGES,
  SUMMIT_LOOK_AROUND,
  SUMMIT_SEQUENCE,
} from '../../../config/narrativeTimeline'

const SCENE_CONTENT = {
  playground: {
    headline: "Hi, I'm Nang Hayman Aye Mya! Welcome to my world.",
    body: "I'm a developer who believes every great project starts with curiosity.",
  },
  campus: {
    headline: 'I spent my time learning, growing, and building my foundation.',
  },
  mountain: {
    headline: "I put my skills to the test. Here's what I've built and where I've been.",
  },
  summit: {
    headline: 'Let’s build what’s next.',
    body: 'I’m a Computer Science student looking for real problems, thoughtful teams, and room to grow. I’m open to collaborations, mentorship, internships, and roles where I can contribute while learning fast.',
  },
}

const CONTACT_ACTIONS = [
  {
    label: 'Email',
    icon: FaEnvelope,
    href: import.meta.env.VITE_CONTACT_EMAIL
      ? `mailto:${import.meta.env.VITE_CONTACT_EMAIL}`
      : null,
  },
  {
    label: 'GitHub',
    icon: FaGithub,
    href: import.meta.env.VITE_GITHUB_URL || null,
  },
  {
    label: 'LinkedIn',
    icon: FaLinkedinIn,
    href: import.meta.env.VITE_LINKEDIN_URL || null,
  },
]

const SCENE_LABELS = {
  playground: '01 ABOUT ME',
  campus: '02 SKILLS',
  mountain: '03 EXPERIENCES',
  summit: '04 — NEXT HORIZON',
}

// Scene headings and the final signature deliberately share one font token.
const ELEGANT_SERIF_CLASS = 'font-serif'

const getActiveScene = (offset) => {
  const scene = SCENES.find(({ id }) => offset < SCENE_RANGES[id].end)
  return scene?.id ?? SCENES[SCENES.length - 1].id
}

const scrollRange = (offset, start, length) => {
  if (length <= 0) return 0
  return Math.max(0, Math.min(1, (offset - start) / length))
}

const getSceneOpacity = (scene, offset) => {
  if (scene === 'summit') {
    return scrollRange(
      offset,
      SUMMIT_SEQUENCE.uiRevealStart,
      SUMMIT_SEQUENCE.uiRevealEnd - SUMMIT_SEQUENCE.uiRevealStart,
    )
  }

  const range = SCENE_RANGES[scene]
  const fadeInLength = range.fadeInEnd - range.start
  const fadeOutLength = range.end - range.fadeOutStart
  const fadeIn = fadeInLength
    ? scrollRange(offset, range.start, fadeInLength)
    : 1
  const fadeOut = fadeOutLength
    ? 1 - scrollRange(offset, range.fadeOutStart, fadeOutLength)
    : 1

  return Math.min(fadeIn, fadeOut)
}

function ContactPill({ label, href, icon: Icon }) {
  const { isNightMode } = useDayNight()
  const className =
    `pointer-events-auto inline-flex h-12 w-12 flex-none items-center justify-center rounded-full border shadow-[0_12px_34px_rgba(15,23,42,0.2)] backdrop-blur-md transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#94A3B8] focus-visible:ring-offset-2 ${
      isNightMode
        ? 'border-white/15 bg-[#1E293B]/80 text-[#F8FAFC] hover:bg-[#334155] hover:text-white'
        : 'border-white/80 bg-[#FFF9F4]/70 text-[#3E2723] hover:bg-[#FFF9F4] hover:text-[#8A817A]'
    }`
  const motionProps = {
    whileHover: { y: -4, scale: 1.025 },
    whileTap: { scale: 0.98 },
    transition: { type: 'spring', stiffness: 320, damping: 22 },
  }

  if (!href) {
    return (
      <motion.button
        type="button"
        aria-disabled="true"
        aria-label={label}
        title={`Add the ${label} URL in the Vite contact environment variables`}
        className={className}
        {...motionProps}
      >
        <Icon aria-hidden="true" size={20} strokeWidth={1.8} />
      </motion.button>
    )
  }

  const isExternal = href.startsWith('http')
  return (
    <motion.a
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noreferrer' : undefined}
      aria-label={label}
      title={label}
      className={className}
      {...motionProps}
    >
      <Icon aria-hidden="true" size={20} strokeWidth={1.8} />
    </motion.a>
  )
}

export default function UIOverlay({ scrollOffset = 0 }) {
  const { isNightMode } = useDayNight()
  const [isMinimized, setIsMinimized] = useState(false)
  const activeScene = getActiveScene(scrollOffset)
  const opacity = getSceneOpacity(activeScene, scrollOffset)
  const prefersReducedMotion = useReducedMotion()
  const content = SCENE_CONTENT[activeScene]
  const isSummit = activeScene === 'summit'
  const showSummitHud =
    isSummit && scrollOffset >= SUMMIT_SEQUENCE.uiRevealStart
  const entranceTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 1, ease: [0.22, 1, 0.36, 1] }

  return (
    <div className="pointer-events-none relative z-10 h-full w-full">
      <div
        className={
          isSummit
            ? 'absolute bottom-3 left-3 right-3 w-auto max-w-[400px] sm:bottom-10 sm:left-10 sm:right-auto sm:w-[min(400px,calc(100vw-2.5rem))]'
            : 'absolute left-4 right-4 top-[44%] w-auto max-w-[350px] -translate-y-1/2 sm:left-[5%] sm:right-auto sm:top-1/2 sm:w-[min(350px,90vw)]'
        }
      >
        <AnimatePresence mode="wait" initial={false}>
          {!isSummit && (
            <motion.div
              key={activeScene}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity, y: 0 }}
              exit={{ opacity: 0, y: -12, transition: { duration: 0 } }}
              transition={entranceTransition}
              className={`scene-copy-scrim ${isNightMode ? 'scene-copy-scrim--night' : ''}`}
            >
              <p className={`mb-3 text-left font-serif text-[0.68rem] font-semibold uppercase tracking-[0.18em] transition-colors duration-500 sm:mb-4 sm:text-xs ${isNightMode ? 'text-[#94A3B8]' : 'text-[#8A817A]'}`}>
                {SCENE_LABELS[activeScene]}
              </p>
              <h1
                className={`text-left ${ELEGANT_SERIF_CLASS} text-[clamp(1.65rem,7vw,2.25rem)] font-semibold leading-[1.14] tracking-[-0.025em] transition-colors duration-500 sm:text-[clamp(1.9rem,3.2vw,2.25rem)] ${isNightMode ? 'text-[#F8FAFC]' : 'text-[#3E2723]'}`}
              >
                {content.headline}
              </h1>
              {content.body && (
                <p
                  className={`mt-4 max-w-[330px] text-left font-sans text-sm font-normal leading-relaxed transition-colors duration-500 sm:mt-5 sm:text-base ${isNightMode ? 'text-[#F8FAFC]' : 'text-[#3E2723]'}`}
                >
                  {content.body}
                </p>
              )}
            </motion.div>
          )}

          {showSummitHud && !isMinimized && (
            <motion.section
              key="summit-expanded"
              aria-label="Summit contact panel"
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.97 }}
              transition={entranceTransition}
              className={`pointer-events-auto relative max-h-[calc(100dvh-5.5rem)] overflow-y-auto rounded-[1.4rem] border px-5 py-5 text-left shadow-[0_24px_70px_rgba(15,23,42,0.28)] backdrop-blur-xl transition-colors duration-500 sm:rounded-[1.6rem] sm:px-6 sm:py-6 ${isNightMode ? 'border-white/15 bg-[#1E293B]/80 text-[#F8FAFC]' : 'border-white/70 bg-[#FFF9F4]/65 text-[#3E2723]'}`}
              style={{ pointerEvents: opacity > 0.08 ? 'auto' : 'none' }}
            >
              <button
                type="button"
                aria-label="Minimize contact panel"
                onClick={() => setIsMinimized(true)}
                className={`pointer-events-auto absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full border text-lg leading-none transition-all duration-500 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#94A3B8] focus-visible:ring-offset-2 ${isNightMode ? 'border-white/15 bg-[#334155]/80 text-[#F8FAFC] hover:bg-[#475569]' : 'border-white/75 bg-[#FFF9F4]/70 text-[#3E2723] hover:bg-white'}`}
              >
                <FaTimes aria-hidden="true" size={14} />
              </button>

              <p className={`mb-3 pr-10 text-left font-serif text-[0.7rem] font-semibold uppercase tracking-[0.18em] transition-colors duration-500 ${isNightMode ? 'text-[#94A3B8]' : 'text-[#8A817A]'}`}>
                {SCENE_LABELS.summit}
              </p>
              <h1
                className={`pr-7 text-left font-serif text-[clamp(1.5rem,7vw,2.2rem)] font-semibold leading-[1.12] tracking-[-0.025em] transition-colors duration-500 sm:text-[clamp(1.75rem,3vw,2.2rem)] ${isNightMode ? 'text-[#F8FAFC]' : 'text-[#3E2723]'}`}
              >
                {SCENE_CONTENT.summit.headline}
              </h1>
              <p className={`mt-4 text-left font-sans text-sm font-normal leading-relaxed transition-colors duration-500 ${isNightMode ? 'text-[#F8FAFC]' : 'text-[#3E2723]'}`}>
                {SCENE_CONTENT.summit.body}
              </p>

              {/* <div className={`mt-5 border-t pt-4 transition-colors duration-500 ${isNightMode ? 'border-white/15' : 'border-[#8A817A]/25'}`}>
                <p className={`${ELEGANT_SERIF_CLASS} text-lg font-semibold transition-colors duration-500 ${isNightMode ? 'text-[#F8FAFC]' : 'text-[#3E2723]'}`}>
                  Nang Hayman Aye Mya
                </p>
                <p className={`mt-1 font-sans text-xs font-medium uppercase tracking-[0.12em] transition-colors duration-500 ${isNightMode ? 'text-[#94A3B8]' : 'text-[#8A817A]'}`}>
                  Computer Science, KMUTT
                </p>
              </div> */}

              <div
                className="mt-5 flex w-full gap-3"
                aria-label="Contact links"
              >
                {CONTACT_ACTIONS.map((action) => (
                  <ContactPill key={action.label} {...action} />
                ))}
              </div>
            </motion.section>
          )}

          {showSummitHud && isMinimized && (
            <motion.button
              key="summit-minimized"
              type="button"
              onClick={() => setIsMinimized(false)}
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={entranceTransition}
              className={`pointer-events-auto inline-flex items-center gap-2 rounded-full border px-5 py-3 font-sans text-sm font-semibold shadow-[0_16px_44px_rgba(15,23,42,0.2)] backdrop-blur-xl transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#94A3B8] focus-visible:ring-offset-2 ${isNightMode ? 'border-white/15 bg-[#1E293B]/80 text-[#F8FAFC] hover:bg-[#334155]' : 'border-white/75 bg-[#FFF9F4]/70 text-[#3E2723] hover:bg-white'}`}
              aria-label="Expand contact panel"
            >
              <span className={`h-2 w-2 rounded-full transition-colors duration-500 ${isNightMode ? 'bg-[#94A3B8]' : 'bg-[#8A817A]'}`} />
              Connect Me!
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isSummit && scrollOffset >= SUMMIT_LOOK_AROUND.start && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 0.72, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className={`pointer-events-none fixed bottom-6 right-6 hidden rounded-full border px-4 py-2 font-sans text-xs font-semibold uppercase tracking-[0.12em] shadow-[0_10px_30px_rgba(15,23,42,0.18)] backdrop-blur-md transition-colors duration-500 md:inline-flex ${isNightMode ? 'border-white/15 bg-[#1E293B]/75 text-[#94A3B8]' : 'border-white/70 bg-[#FFF9F4]/75 text-[#8A817A]'}`}
          >
            Drag to explore the 360° view
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
