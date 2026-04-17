import { Routes, Route, BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { LoginProvider } from '../context/AuthContext'

import Layout from './Layout'
import NotFound from './NotFound'
import { SignIn } from './SignIn'
import { Landing } from './Landing'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LoginProvider>
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
      </LoginProvider >
      <ReactQueryDevtools />
    </QueryClientProvider>
  )
}
