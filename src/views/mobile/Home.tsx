import { Route, Routes } from 'react-router-dom'
import RestaurantVWorldMap from '@/components/mobile/core/RestaurantVWorldMap'

const Home = () => {
  return (
    <Routes>
      <Route path="/mobile" element={<RestaurantVWorldMap />} />
      <Route path="/mobile/map" element={<RestaurantVWorldMap />} />
    </Routes>
  )
}

export default Home