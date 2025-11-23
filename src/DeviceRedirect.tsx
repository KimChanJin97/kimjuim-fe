import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDeviceType } from './hooks/useMediaQuery'

const DeviceRedirect = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const device = useDeviceType()

  useEffect(() => {
    const { pathname, search } = location

    // 모바일/태블릿은 /mobile 경로로
    if ((device.isMobile || device.isTablet) && !pathname.startsWith('/mobile/') && pathname !== '/mobile') {
      let mobilePath: string

      if (pathname === '/') {
        mobilePath = '/mobile'
      } else if (pathname === '/map' || pathname === '/introduction' || pathname === '/question' || pathname === '/patchnote') {
        mobilePath = '/mobile'
      } else {
        mobilePath = `/mobile${pathname}`
      }

      console.log(`[${device.type}] → ${mobilePath}`)
      navigate(mobilePath + search, { replace: true })
      return
    }

    // PC는 /mobile 경로에서 벗어나기
    if (device.isPC && (pathname.startsWith('/mobile/') || pathname === '/mobile')) {
      const pcPath = pathname.replace(/^\/mobile/, '') || '/'
      console.log(`[${device.type}] → ${pcPath}`)
      navigate(pcPath + search, { replace: true })
    }
  }, [device, location, navigate])

  return null
}

export default DeviceRedirect