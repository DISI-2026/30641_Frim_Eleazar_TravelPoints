import { Routes, Route, BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { LoginProvider } from '../context/AuthContext'

import Layout from './Layout'
import NotFound from './NotFound'
import { Register } from './Register'
import { Landing } from './Landing'
import LogIn from './LogIn'
import NewAttraction from './NewAttraction'
import AttractionsPage from './AttractionsPage'
import AttractionPage from './AttractionPage'
import ForgotPassword from './ForgotPassword'
import ResetPassword from './ResetPassword'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LoginProvider>
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<Layout />}>
              <Route index element={<Landing />} />
              <Route path='register' element={<Register />} />
              <Route path='login' element={<LogIn />} />
              <Route path='attractions' element={<AttractionsPage />} />
              <Route path='attraction/:id' element={<AttractionPage />} />
              <Route path='newattraction' element={<NewAttraction />} />
              <Route path='noaccess' element={<p> Acces restrictionat </p>} />
              <Route path='profile' element={<p> Profil </p>} />
              <Route path='forgot-password' element={<ForgotPassword />} />
              <Route path='reset-password' element={<ResetPassword />} />
            </Route>
            <Route path='*' element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </LoginProvider >
      <ReactQueryDevtools />
    </QueryClientProvider>
  )
}
