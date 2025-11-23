import { useState, useEffect } from 'react'

export type DeviceType = 'mobile' | 'tablet' | 'pc'

export interface DeviceInfo {
  type: DeviceType
  isMobile: boolean
  isTablet: boolean
  isPC: boolean
}

const detectDevice = (): DeviceType => {
  const userAgent = navigator.userAgent.toLowerCase()

  // PC 브라우저 체크 (모바일 기기가 아니면 PC)
  const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|tablet|kindle|silk|playbook/i.test(userAgent)

  if (!isMobileDevice) {
    // PC는 화면 너비 무관하게 PC
    return 'pc'
  }

  // 모바일 기기인 경우에만 화면 너비로 mobile/tablet 구분
  const width = window.innerWidth

  // 태블릿 User-Agent 또는 너비가 768px 초과
  if (/ipad|android.*tablet|tablet|kindle|silk|playbook/i.test(userAgent) || width > 768) {
    return 'tablet'
  }

  // 그 외는 모바일
  return 'mobile'
}

export const useDeviceType = (): DeviceInfo => {
  const [deviceType, setDeviceType] = useState<DeviceType>(() => detectDevice())

  useEffect(() => {
    const handleResize = () => {
      setDeviceType(detectDevice())
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return {
    type: deviceType,
    isMobile: deviceType === 'mobile',
    isTablet: deviceType === 'tablet',
    isPC: deviceType === 'pc',
  }
}