import RestaurantVWorldMap from '../../components/pc/core/RestaurantVWorldMap'
import { Route, Routes } from 'react-router-dom'
import Introduction from '@/components/pc/cs/Introduction'
import Patchnote from '@/components/pc/cs/Patchnote'
import Question from '@/components/pc/cs/Question'

const Home = () => {
  return (
    <Routes>
      <Route path="/" element={<RestaurantVWorldMap />} />
      <Route path="/map" element={<RestaurantVWorldMap />} />
      <Route path="/introduction" element={<Introduction />} />
      <Route path="/question" element={<Question />} />
      <Route path="/patchnote" element={<Patchnote />} />
    </Routes>
  )
}

export default Home