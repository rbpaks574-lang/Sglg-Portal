import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import BarangayLayout from './components/layout/BarangayLayout'
import CheckerLayout from './components/layout/CheckerLayout'
import AdminLayout from './components/layout/AdminLayout'
import BarangayDashboard from './pages/BarangayDashboard'
import BarangayDocuments from './pages/BarangayDocuments'
import BarangaySubmissions from './pages/BarangaySubmissions'
import CheckerDashboard from './pages/CheckerDashboard'
import CheckerQueue from './pages/CheckerQueue'
import AdminDashboard from './pages/AdminDashboard'
import AdminUsers from './pages/AdminUsers'
import AdminBarangays from './pages/AdminBarangays'
import AdminAnnouncements from './pages/AdminAnnouncements'
import AdminRequirements from './pages/AdminRequirements'
import AdminAnalytics from './pages/AdminAnalytics'
import AdminAuditLogs from './pages/AdminAuditLogs'
import Profile from './pages/Profile'
import AnnouncementsList from './pages/AnnouncementsList'
import NotFound from './pages/NotFound'

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />
  return children
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100">
      <div className="text-center">
        <span className="loading loading-spinner loading-lg"></span>
        <p className="mt-4 text-lg text-base-content/60">Loading...</p>
      </div>
    </div>
  )
}

function RoleRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" />
  if (user.role === 'admin') return <Navigate to="/admin" />
  if (user.role === 'checker') return <Navigate to="/checker" />
  return <Navigate to="/barangay" />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<RoleRedirect />} />

      {/* Barangay Routes */}
      <Route path="/barangay" element={
        <ProtectedRoute roles={['barangay']}><BarangayLayout /></ProtectedRoute>
      }>
        <Route index element={<BarangayDashboard />} />
        <Route path="documents" element={<BarangayDocuments />} />
        <Route path="submissions" element={<BarangaySubmissions />} />
        <Route path="announcements" element={<AnnouncementsList />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Checker Routes */}
      <Route path="/checker" element={
        <ProtectedRoute roles={['checker', 'admin']}><CheckerLayout /></ProtectedRoute>
      }>
        <Route index element={<CheckerDashboard />} />
        <Route path="queue" element={<CheckerQueue />} />
        <Route path="announcements" element={<AnnouncementsList />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute roles={['admin']}><AdminLayout /></ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="requirements" element={<AdminRequirements />} />
        <Route path="announcements" element={<AdminAnnouncements />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="barangays" element={<AdminBarangays />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="audit-logs" element={<AdminAuditLogs />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
