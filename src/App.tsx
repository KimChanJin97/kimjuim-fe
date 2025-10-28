import PCHeader from './views/pc/Header'
import PCHome from './views/pc/Home'
import MobileHome from './views/mobile/Home'
import MobileHeader from './views/mobile/Header'
import './App.css'
import { useLocation } from 'react-router-dom'
import DeviceRedirect from './DeviceRedirect'

const App = () => {
  const location = useLocation()
  const isMobilePath = location.pathname.startsWith('/mobile/') || location.pathname === '/mobile'

  return (
    <>
      <DeviceRedirect />

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
