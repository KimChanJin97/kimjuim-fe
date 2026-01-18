import './Header.css'
import { useState } from 'react'
import { useNavigate, Routes, Route, useLocation } from 'react-router-dom'
import { Ellipse } from '@/assets/Ellipse'
import Tooltip from '@/components/pc/common/Tooltip'

const Header = () => {

  const navigate = useNavigate()
  const location = useLocation()
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0 })

  const isActive = (path: string) => location.pathname === path

  // 강력 새로고침 함수
  const handleLogoClick = () => {
    window.location.href = '/'
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    setTooltip({
      visible: true,
      x: e.clientX + 10,
      y: e.clientY + 15
    })
  }

  const handleMouseLeave = () => {
    setTooltip({ ...tooltip, visible: false })
  }

  return (
    <header className="header">
      <div className="logo-container" >
        <button onClick={handleLogoClick}><Ellipse /></button>
        <span
          className="beta-badge"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          베타 버전
        </span>
      </div>
      <Tooltip
        visible={tooltip.visible}
        x={tooltip.x}
        y={tooltip.y}
        text="서울/경기 지역만 서비스 중입니다."
        zIndex={99999}
      />
      <div className="menu-header">
        <div className={`map-header-tab ${isActive('/map') ? 'active' : ''}`} onClick={() => navigate('/map')}>
          <span>지도</span>
        </div>
        <div className={`introduction-header-tab ${isActive('/introduction') ? 'active' : ''}`} onClick={() => navigate('/introduction')}>
          <span>소개</span>
        </div>
        <div className={`question-header-tab ${isActive('/question') ? 'active' : ''}`} onClick={() => navigate('/question')}>
          <span>문의하기</span>
        </div>
        <div className={`patchnote-header-tab ${isActive('/patchnote') ? 'active' : ''}`} onClick={() => navigate('/patchnote')}>
          <span>패치노트</span>
        </div>
      </div>
    </header>
  )
}

export default Header