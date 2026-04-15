import { BrowserRouter } from 'react-router-dom'

import { AuthProvider } from '@/app/providers/auth-provider'
import { ThemeProvider } from '@/app/providers/theme-provider'
import { ContractSessionProvider } from '@/app/state/contract-session'
import { AppRoutes } from '@/app/routes'

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="aca-theme">
      <AuthProvider>
        <ContractSessionProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ContractSessionProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
