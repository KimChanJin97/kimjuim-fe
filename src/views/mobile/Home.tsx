import { Route, Routes } from 'react-router-dom'
import RestaurantVWorldMap from '@/components/mobile/core/RestaurantVWorldMap'
import FAQ from '@/components/mobile/cs/FAQ'
import Suggestion from '@/components/mobile/cs/Suggestion'
import Patchnote from '@/components/mobile/cs/Patchnote'

const Home = () => {
  return (
    <Routes>
      <Route path="/m" element={<RestaurantVWorldMap />} />
      <Route path="/m/map" element={<RestaurantVWorldMap />} />
      <Route path="/m/faq" element={<FAQ />} />
      <Route path="/m/suggestion" element={<Suggestion />} />
      <Route path="/m/patchnote" element={<Patchnote />} />
    </Routes>
  )
}

export default Home