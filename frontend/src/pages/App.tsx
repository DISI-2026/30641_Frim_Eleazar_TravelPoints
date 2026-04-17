import { Routes, Route, BrowserRouter } from 'react-router-dom'
import Layout from './Layout'
import NotFound from './NotFound'

export default function App() {
  return (

    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Layout />}>
          <Route index element={<p> Home </p>} />
          <Route path='noaccess' element={<p> Acces restrictionat </p>} />
          <Route path='profile' element={<p> Profil </p>} />
        </Route>
        <Route path='*' element={<NotFound />} />
      </Routes>
    </BrowserRouter>

  )
}
