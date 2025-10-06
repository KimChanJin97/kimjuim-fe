import './Header.css'
import { useNavigate, Routes, Route, useLocation } from 'react-router-dom'
import logo from '@/assets/logo.png'

const Header = () => {

  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <header className="header">
      <div className="logo-header" onClick={() => navigate('/')}>
        <img src={logo} alt="로고" />
      </div>
    </header>
  )
}

export default Header