import './Header.css'
import { useNavigate, Routes, Route, useLocation } from 'react-router-dom'

const Header = () => {

  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <header className="header">
      <div className="logo-header" onClick={() => navigate('/')}>
      </div>
      <div className="menu-header">
        <div className={`map-header ${isActive('/map') ? 'active' : ''}`} onClick={() => navigate('/map')}>
          <span>지도</span>
        </div>
        <div className={`faq-header ${isActive('/faq') ? 'active' : ''}`} onClick={() => navigate('/faq')}>
          <span>FAQ</span>
        </div>
        <div className={`suggestion-header ${isActive('/suggestion') ? 'active' : ''}`} onClick={() => navigate('/suggestion')}>
          <span>건의사항</span>
        </div>
        <div className={`patchnote-header ${isActive('/patchnote') ? 'active' : ''}`} onClick={() => navigate('/patchnote')}>
          <span>패치노트</span>
        </div>
      </div>
    </header>
  )
}

export default Header