import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'

import { AppShell } from '@/components/shell/app-shell'
import { useAuth } from '@/app/providers/auth-provider'
import { firebaseReady } from '@/lib/firebase'
import { LandingPage } from '@/pages/landing/landing-page'
import { UploadPage } from '@/pages/upload/upload-page'
import { ProcessingPage } from '@/pages/processing/processing-page'
import { DashboardPage } from '@/pages/dashboard/dashboard-page'
import { ChatPage } from '@/pages/chat/chat-page'
import { HistoryPage } from '@/pages/history/history-page'
import { LoginPage } from '@/pages/auth/login-page'
import { SignupPage } from '@/pages/auth/signup-page'

const pageVariants = {
  initial: { opacity: 0, y: 10, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -10, filter: 'blur(6px)' },
} as const

function Page({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-[calc(100vh-72px)]"
    >
      {children}
    </motion.div>
  )
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  // If Firebase isn't configured, don't block demo/dev navigation.
  if (!firebaseReady) return <>{children}</>

  if (loading) return null
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <>{children}</>
}

export function AppRoutes() {
  const location = useLocation()

  return (
    <AppShell>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <Page>
                <LandingPage />
              </Page>
            }
          />
          <Route
            path="/upload"
            element={
              <RequireAuth>
                <Page>
                  <UploadPage />
                </Page>
              </RequireAuth>
            }
          />
          <Route
            path="/processing"
            element={
              <RequireAuth>
                <Page>
                  <ProcessingPage />
                </Page>
              </RequireAuth>
            }
          />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <Page>
                  <DashboardPage />
                </Page>
              </RequireAuth>
            }
          />
          <Route
            path="/chat"
            element={
              <RequireAuth>
                <Page>
                  <ChatPage />
                </Page>
              </RequireAuth>
            }
          />
          <Route
            path="/history"
            element={
              <RequireAuth>
                <Page>
                  <HistoryPage />
                </Page>
              </RequireAuth>
            }
          />
          <Route
            path="/login"
            element={
              <Page>
                <LoginPage />
              </Page>
            }
          />
          <Route
            path="/signup"
            element={
              <Page>
                <SignupPage />
              </Page>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </AppShell>
  )
}

