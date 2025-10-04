import './Home.css'
import RestaurantVWorldMap from '../components/core/RestaurantVWorldMap'
import { Route, Routes } from 'react-router-dom'
import FAQ from '@/components/cs/FAQ'
import Patchnote from '@/components/cs/Patchnote'
import Suggestion from '@/components/cs/Suggestion'

const Home = () => {
  return (
    <Routes>
      <Route path="/" element={<RestaurantVWorldMap />} />
      <Route path="/restaurant-vworld-map" element={<RestaurantVWorldMap />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/suggestion" element={<Suggestion />} />
      <Route path="/patchnote" element={<Patchnote />} />
    </Routes>
  )
}

export default Home