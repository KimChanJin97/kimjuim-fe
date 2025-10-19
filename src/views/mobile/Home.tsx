import { Route, Routes } from 'react-router-dom'
import RestaurantVWorldMap from '@/components/mobile/core/RestaurantVWorldMap'
import Introduction from '@/components/mobile/cs/Introduction'
import Question from '@/components/mobile/cs/Question'
import Patchnote from '@/components/pc/cs/Patchnote'

const Home = () => {
  return (
    <Routes>
      <Route path="/m" element={<RestaurantVWorldMap />} />
      <Route path="/m/map" element={<RestaurantVWorldMap />} />
      <Route path="/m/introduction" element={<Introduction />} />
      <Route path="/m/question" element={<Question />} />
      <Route path="/m/patchnote" element={<Patchnote />} />
    </Routes>
  )
}

export default Home