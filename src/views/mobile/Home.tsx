import { Route, Routes } from 'react-router-dom'
import RestaurantVWorldMap from '@/components/mobile/core/RestaurantVWorldMap'

const Home = () => {
  return (
    <Routes>
      <Route path="/m" element={<RestaurantVWorldMap />} />
      <Route path="/m/map" element={<RestaurantVWorldMap />} />
    </Routes>
  )
}

export default Home