import { useCallback, useEffect, useMemo, useState } from 'react'

export const useResponsiveness = () => {
  const [screenSize, setScreenSize] = useState({ x: 0, y: 0 })
  const [loaded, setLoaded] = useState(false)

  const handleResize = useCallback(() => {
    const { innerWidth, innerHeight } = window
    setScreenSize({ x: innerWidth, y: innerHeight })
    setLoaded(true)
  }, [])

  useEffect(() => {
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const media = useMemo(() => {
    const { x } = screenSize
    return {
      sm: x >= 640,
      md: x >= 768,
      lg: x >= 1024,
      xl: x >= 1280,
      '2xl': x >= 1536
    }
  }, [screenSize])

  return { screenSize, loaded, media }
}
