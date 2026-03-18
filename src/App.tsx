import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import GenrePage from './pages/GenrePage'
import LevelPage from './pages/LevelPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/genre/:id" element={<GenrePage />} />
        <Route path="/genre/:id/level/:level" element={<LevelPage />} />
      </Routes>
    </BrowserRouter>
  )
}
