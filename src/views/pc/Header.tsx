import './Header.css'
import { useNavigate, Routes, Route, useLocation } from 'react-router-dom'
import { Ellipse } from '@/assets/Ellipse'

const Header = () => {

  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  // 강력 새로고침 함수
  const handleLogoClick = () => {
    window.location.href = '/'
  }

  return (
    <header className="header">
      <div className="logo-container" >
        <button onClick={handleLogoClick}><Ellipse /></button>
        <span className="beta-badge">베타 버전</span>
      </div>
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