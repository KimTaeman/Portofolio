import { useCallback, useMemo, useState } from 'react'
import DayNightContext from './dayNightContext'

export default function DayNightProvider({ children }) {
  const [isNightMode, setIsNightMode] = useState(false)
  const toggleNightMode = useCallback(() => {
    setIsNightMode((currentMode) => !currentMode)
  }, [])
  const value = useMemo(
    () => ({ isNightMode, toggleNightMode }),
    [isNightMode, toggleNightMode],
  )

  return (
    <DayNightContext.Provider value={value}>
      {children}
    </DayNightContext.Provider>
  )
}
