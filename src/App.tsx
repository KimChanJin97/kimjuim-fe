import PCHeader from './views/pc/Header'
import PCHome from './views/pc/Home'
import MobileHome from './views/mobile/Home'
import MobileHeader from './views/mobile/Header'
import './App.css'
import { useLocation } from 'react-router-dom'
import DeviceRedirect from './DeviceRedirect'
import { useEffect, useState } from 'react'

const App = () => {
  const location = useLocation()
  const isMobilePath = location.pathname.startsWith('/m/') || location.pathname === '/m'

  const [showChromePrompt, setShowChromePrompt] = useState(false)

  useEffect(() => {
    // 삼성 인터넷 감지
    const isSamsungBrowser = /SamsungBrowser/i.test(navigator.userAgent)
    const isAndroid = /Android/i.test(navigator.userAgent)

    // 이미 Chrome으로 봤다는 표시가 있는지 확인
    const hasSeenPrompt = sessionStorage.getItem('chromePromptShown')

    if (isSamsungBrowser && isAndroid && !hasSeenPrompt) {
      setShowChromePrompt(true)
      sessionStorage.setItem('chromePromptShown', 'true')
    }
  }, [])

  const openInChrome = () => {
    const currentUrl = window.location.href
    // 현재 프로토콜 감지 (http 또는 https)
    const protocol = window.location.protocol.replace(':', '')

    // URL에서 프로토콜 제거
    const urlWithoutProtocol = currentUrl.replace(/^https?:\/\//, '')

    // Chrome Intent URL - 현재 프로토콜 사용
    const chromeIntent = `intent://${urlWithoutProtocol}#Intent;scheme=${protocol};package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(currentUrl)};end`

    console.log('Opening in Chrome:', chromeIntent) // 디버깅용

    // 크롬으로 열기 시도
    window.location.href = chromeIntent

    // 1초 후에도 페이지가 그대로면 크롬이 없는 것 (fallback)
    setTimeout(() => {
      setShowChromePrompt(false)
    }, 1000)
  }

  const continueWithSamsung = () => {
    setShowChromePrompt(false)
  }

  return (
    <>
      <DeviceRedirect />

      {/* 크롬 프롬프트 */}
      {showChromePrompt && (
        <div className="chrome-prompt-overlay">
          <div className="chrome-prompt">
            <h3>더 나은 경험을 위해</h3>
            <p>Chrome 브라우저로 열어보시겠어요?</p>
            <p className="chrome-prompt-subtitle">
              (일부 브라우저에서 색상이 정상적으로 표시되지 않을 수 있습니다)
            </p>
            <div className="chrome-prompt-buttons">
              <button onClick={openInChrome} className="chrome-prompt-btn primary">
                Chrome으로 열기
              </button>
              <button onClick={continueWithSamsung} className="chrome-prompt-btn secondary">
                계속하기
              </button>
            </div>
          </div>
        </div>
      )}

      {isMobilePath ? (
        <div className="mobile">
          <MobileHeader />
          <MobileHome />
        </div>
      ) : (
        <div className="pc">
          <PCHeader />
          <PCHome />
        </div>
      )}
    </>
  )
}

export default App
