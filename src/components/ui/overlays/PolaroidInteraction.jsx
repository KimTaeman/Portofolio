export default function PolaroidInteraction({ setIsLocked, setShowPolaroid }) {
  const handleClick = () => {
    setIsLocked(false)
    setShowPolaroid(false)
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <button
        type="button"
        onClick={handleClick}
        className="pointer-events-auto w-64 bg-white border-8 border-white shadow-2xl px-4 pt-4 pb-10 text-left hover:scale-[1.02] transition-transform"
      >
        <p className="text-sm font-semibold text-gray-800">Project Snapshot</p>
        <p className="mt-2 text-xs text-gray-600">Click to continue climbing.</p>
      </button>
    </div>
  )
}
