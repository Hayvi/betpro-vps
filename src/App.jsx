import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Layout from './components/layout/Layout'
import ErrorBoundary from './components/layout/ErrorBoundary'
import { useAuth } from './contexts/AuthContext'

// Lazy load pages for code splitting
const Home = lazy(() => import('./pages/Home'))
const Sports = lazy(() => import('./pages/Sports'))
const LiveSports = lazy(() => import('./pages/LiveSports'))
const Casino = lazy(() => import('./pages/Casino'))
const SuperDashboard = lazy(() => import('./pages/dashboard/SuperDashboard'))
const AdminDashboard = lazy(() => import('./pages/dashboard/AdminDashboard'))
const SubAdminDashboard = lazy(() => import('./pages/dashboard/SubAdminDashboard'))
const UserDashboard = lazy(() => import('./pages/dashboard/UserDashboard'))

// Simple loading spinner
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-950">
    <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
  </div>
)

function RequireRole({ allowedRoles, children }) {
  const { isAuthenticated, role, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <PageLoader />
  }

  if (!isAuthenticated) {
    return <Navigate to="/home" replace state={{ from: location }} />
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    let target = '/dashboard/user'
    if (role === 'super_admin') target = '/dashboard/super'
    else if (role === 'admin') target = '/dashboard/admin'
    else if (role === 'sub_admin') target = '/dashboard/sub'

    if (location.pathname === target) {
      return children
    }

    return <Navigate to={target} replace />
  }

  return children
}

function App() {
    return (
        <ErrorBoundary>
            <Layout>
                <Suspense fallback={<PageLoader />}>
                    <Routes>
                        <Route path="/" element={<Navigate to="/home" replace />} />
                        <Route path="/home" element={<Home />} />
                        <Route path="/prematch" element={<Sports />} />
                        <Route path="/sports" element={<Navigate to="/prematch" replace />} />
                        <Route path="/live-sports" element={<LiveSports />} />
                        <Route path="/casino" element={<Casino />} />

                        {/* Role-based dashboards */}
                        <Route
                          path="/dashboard/super"
                          element={
                            <RequireRole allowedRoles={['super_admin']}>
                              <SuperDashboard />
                            </RequireRole>
                          }
                        />
                        <Route
                          path="/dashboard/admin"
                          element={
                            <RequireRole allowedRoles={['admin']}>
                              <AdminDashboard />
                            </RequireRole>
                          }
                        />
                        <Route
                          path="/dashboard/sub"
                          element={
                            <RequireRole allowedRoles={['sub_admin']}>
                              <SubAdminDashboard />
                            </RequireRole>
                          }
                        />
                        <Route
                          path="/dashboard/user"
                          element={
                            <RequireRole allowedRoles={['user']}>
                              <UserDashboard />
                            </RequireRole>
                          }
                        />

                        <Route path="*" element={<Navigate to="/home" replace />} />
                    </Routes>
                </Suspense>
            </Layout>
        </ErrorBoundary>
    )
}

export default App
