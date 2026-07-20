import { AnimatePresence, motion } from 'framer-motion'

const SCENE_TEXT = {
  scene1: "Hi, I'm [Your Name]! Welcome to my world. I'm a developer who believes every great project starts with curiosity.",
  scene2: "I spent my time learning, growing, and building my foundation.",
  scene3: "I put my skills to the test. Here's what I've built and where I've been.",
  scene4: "Ready to explore the next peak. Let's build something amazing together.",
}

const getActiveScene = (offset) => {
  if (offset < 0.2) return 'scene1'
  if (offset < 0.5) return 'scene2'
  if (offset < 0.7) return 'scene3'
  return 'scene4'
}

const scrollRange = (offset, start, length) => {
  if (length <= 0) return 0
  return Math.max(0, Math.min(1, (offset - start) / length))
}

const getSceneOpacity = (scene, offset) => {
  if (scene === 'scene1') return 1 - scrollRange(offset, 0.15, 0.05)
  if (scene === 'scene2') {
    const fadeIn = scrollRange(offset, 0.2, 0.05)
    const fadeOut = 1 - scrollRange(offset, 0.45, 0.05)
    return Math.min(fadeIn, fadeOut)
  }
  if (scene === 'scene3') {
    const fadeIn = scrollRange(offset, 0.5, 0.05)
    const fadeOut = 1 - scrollRange(offset, 0.65, 0.05)
    return Math.min(fadeIn, fadeOut)
  }
  return scrollRange(offset, 0.7, 0.1)
}

export default function UIOverlay({ scrollOffset = 0 }) {
  const activeScene = getActiveScene(scrollOffset)
  const opacity = getSceneOpacity(activeScene, scrollOffset)

  return (
    <div className="flex h-full w-full items-center justify-start p-8">
      <div className="max-w-2xl w-full">
        <AnimatePresence mode="wait">
          <motion.p
            key={activeScene}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="text-left text-2xl font-semibold leading-tight text-gray-800 md:text-5xl"
          >
            {SCENE_TEXT[activeScene]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  )
}
