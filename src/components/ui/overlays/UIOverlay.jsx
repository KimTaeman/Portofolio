import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { FaEnvelope, FaGithub, FaLinkedinIn, FaTimes } from 'react-icons/fa'
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
    headline: 'Ready to conquer the next challenge.',
    body: "Whether it is architecting full-stack systems or crafting cross-platform mobile experiences, let's build something amazing together.",
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
  mountain: '03 EXPERIENCE',
  summit: '04 - THE SUMMIT',
}

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
  const className =
    'pointer-events-auto inline-flex h-12 w-12 flex-none items-center justify-center rounded-full border border-white/80 bg-white/60 text-[#3E2723] shadow-[0_12px_34px_rgba(62,39,35,0.14)] backdrop-blur-md transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E07A5F] focus-visible:ring-offset-2'
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
            ? 'absolute bottom-5 left-5 w-[min(400px,calc(100vw-2.5rem))] sm:bottom-10 sm:left-10'
            : 'absolute left-[5%] top-1/2 w-[min(350px,90vw)] -translate-y-1/2'
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
            >
              <p className="mb-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-[#E07A5F]">
                {SCENE_LABELS[activeScene]}
              </p>
              <h1
                className="text-left font-serif text-[clamp(1.9rem,3.2vw,2.25rem)] font-semibold leading-[1.14] tracking-[-0.025em] text-[#4A3B32]"
                style={{
                  textShadow: '0 2px 10px rgba(255, 255, 255, 0.5)',
                }}
              >
                {content.headline}
              </h1>
              {content.body && (
                <p
                  className="mt-5 max-w-[330px] text-left text-base font-normal leading-relaxed text-[#5F4B40]"
                  style={{
                    textShadow: '0 2px 10px rgba(255, 255, 255, 0.5)',
                  }}
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
              className="pointer-events-auto relative rounded-[1.6rem] border border-white/70 bg-white/45 px-6 py-6 text-left shadow-[0_24px_70px_rgba(62,39,35,0.18)] backdrop-blur-xl"
              style={{ pointerEvents: opacity > 0.08 ? 'auto' : 'none' }}
            >
              <button
                type="button"
                aria-label="Minimize contact panel"
                onClick={() => setIsMinimized(true)}
                className="pointer-events-auto absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full border border-white/75 bg-white/55 text-lg leading-none text-[#3E2723] transition hover:-translate-y-0.5 hover:bg-white/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E07A5F] focus-visible:ring-offset-2"
              >
                <FaTimes aria-hidden="true" size={14} />
              </button>

              <p className="mb-3 pr-10 text-left text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[#E07A5F]">
                {SCENE_LABELS.summit}
              </p>
              <h1
                className="pr-7 text-left font-serif text-[clamp(1.75rem,3vw,2.2rem)] font-semibold leading-[1.12] tracking-[-0.025em] text-[#3E2723]"
                style={{
                  textShadow: '0 2px 10px rgba(255, 255, 255, 0.5)',
                }}
              >
                {SCENE_CONTENT.summit.headline}
              </h1>
              <p className="mt-4 text-left text-sm font-normal leading-relaxed text-[#5F4B40]">
                {SCENE_CONTENT.summit.body}
              </p>

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
              className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/75 bg-white/55 px-5 py-3 text-sm font-semibold text-[#3E2723] shadow-[0_16px_44px_rgba(62,39,35,0.16)] backdrop-blur-xl transition-colors hover:bg-white/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E07A5F] focus-visible:ring-offset-2"
              aria-label="Expand contact panel"
            >
              <span className="h-2 w-2 rounded-full bg-[#E07A5F]" />
              Connect / Contact
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
            className="pointer-events-none fixed bottom-6 right-6 hidden rounded-full border border-white/70 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#4A3B32] shadow-[0_10px_30px_rgba(72,52,36,0.12)] backdrop-blur-md md:inline-flex"
          >
            Drag to explore the 360° view
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
