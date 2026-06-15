import { StrictMode }        from 'react'
import { createRoot }        from 'react-dom/client'
import { BrowserRouter }     from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster }           from 'sonner'
import { AuthProvider }      from '@/context/AuthContext'
import { UIProvider }        from '@/context/UIContext'
import App                   from './App.jsx'
import './styles/globals.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:            1000 * 60 * 5,
      gcTime:               1000 * 60 * 10,
      retry:                1,
      refetchOnWindowFocus: false,
    },
    mutations: { retry: 0 },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <UIProvider>
            <App />
            <Toaster
              position="top-right"
              theme="dark"
              richColors
              closeButton
            />
          </UIProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
)