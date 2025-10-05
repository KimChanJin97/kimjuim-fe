import RestaurantVWorldMap from '../../components/pc/core/RestaurantVWorldMap'
import { Route, Routes } from 'react-router-dom'
import FAQ from '@/components/pc/cs/FAQ'
import Patchnote from '@/components/pc/cs/Patchnote'
import Suggestion from '@/components/pc/cs/Suggestion'

const Home = () => {
  return (
    <Routes>
      <Route path="/" element={<RestaurantVWorldMap />} />
      <Route path="/map" element={<RestaurantVWorldMap />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/suggestion" element={<Suggestion />} />
      <Route path="/patchnote" element={<Patchnote />} />
    </Routes>
  )
}

export default Home