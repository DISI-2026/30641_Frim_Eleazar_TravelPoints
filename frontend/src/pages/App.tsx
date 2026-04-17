import { Routes, Route, BrowserRouter } from 'react-router-dom'
import Layout from './Layout'
import NotFound from './NotFound'
import { SignIn } from './SignIn'
import { Landing } from './Landing'

export default function App() {
  return (

    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Layout />}>
          <Route index element={<Landing />} />
          <Route path='signin' element={<SignIn />} />
          <Route path='noaccess' element={<p> Acces restrictionat </p>} />
          <Route path='profile' element={<p> Profil </p>} />
        </Route>
        <Route path='*' element={<NotFound />} />
      </Routes>
    </BrowserRouter>

  )
}
