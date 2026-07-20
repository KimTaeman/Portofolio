import { useCallback, useEffect, useRef } from 'react'
import {
  hasExitedMountainInteractionRange,
  isInMountainTriggerRange,
} from '../../../config/narrativeTimeline'

export default function PolaroidInteraction({
  scrollOffset = 0,
  isOpen = false,
  onOpen = () => {},
  onClose = () => {},
}) {
  const isArmedRef = useRef(true)
  const wasInTriggerRangeRef = useRef(false)

  const handleClose = useCallback(() => {
    isArmedRef.current = false
    onClose()
  }, [onClose])

  useEffect(() => {
    const hasExited = hasExitedMountainInteractionRange(scrollOffset)
    const isInTriggerRange = isInMountainTriggerRange(scrollOffset)

    if (hasExited) {
      isArmedRef.current = true
      wasInTriggerRangeRef.current = false
      return
    }

    if (
      isArmedRef.current &&
      isInTriggerRange &&
      !wasInTriggerRangeRef.current
    ) {
      onOpen()
    }

    wasInTriggerRangeRef.current = isInTriggerRange
  }, [onOpen, scrollOffset])

  useEffect(() => {
    if (!isOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') handleClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleClose, isOpen])

  if (!isOpen) return null

  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      role="dialog"
      aria-modal="true"
      aria-label="Mountain project snapshot"
    >
      <button
        type="button"
        onClick={handleClose}
        className="pointer-events-auto w-64 bg-white border-8 border-white shadow-2xl px-4 pt-4 pb-10 text-left hover:scale-[1.02] transition-transform"
      >
        <p className="text-sm font-semibold text-gray-800">Project Snapshot</p>
        <p className="mt-2 text-xs text-gray-600">
          Click or press Escape to continue climbing.
        </p>
      </button>
    </div>
  )
}
