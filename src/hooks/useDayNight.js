import { useContext } from 'react'
import DayNightContext from '../context/dayNightContext'

export default function useDayNight() {
  const context = useContext(DayNightContext)
  if (!context) {
    throw new Error('useDayNight must be used inside DayNightProvider')
  }
  return context
}
