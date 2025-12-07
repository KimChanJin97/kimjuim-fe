import './Header.css'
import { useNavigate, Routes, Route, useLocation } from 'react-router-dom'
import logo from '@/assets/logo.png'
import { EllipseCanvas } from '@/assets/EllipseCanvas'
import snowman from '@/assets/snowman.png'
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
      <div className="logo-header" onClick={handleLogoClick}>
        <img src={snowman} alt="snowman" className="snowman" />
        <EllipseCanvas />
      </div>
    </header>
  )
}

export default Header