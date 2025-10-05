import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDeviceType } from './hooks/useMediaQuery'

const DeviceRedirect = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const device = useDeviceType()

  useEffect(() => {
    const { pathname, search } = location

    // 모바일/태블릿은 /m 경로로
    if ((device.isMobile || device.isTablet) && !pathname.startsWith('/m/') && pathname !== '/m') {
      let mobilePath: string

      if (pathname === '/') {
        mobilePath = '/m'  // 홈
      } else if (pathname === '/map') {
        mobilePath = '/m/map'  // 지도
      } else {
        mobilePath = `/m${pathname}`
      }

      console.log(`[${device.type}] → ${mobilePath}`)
      navigate(mobilePath + search, { replace: true })
      return
    }

    // PC는 /m 경로에서 벗어나기
    if (device.isPC && (pathname.startsWith('/m/') || pathname === '/m')) {
      const pcPath = pathname.replace(/^\/m/, '') || '/'
      console.log(`[${device.type}] → ${pcPath}`)
      navigate(pcPath + search, { replace: true })
    }
  }, [device, location, navigate])

  return null
}

export default DeviceRedirect