import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'

// Layouts
import { DashboardLayout } from './components/layout/DashboardLayout'
import { AdminLayout } from './components/layout/AdminLayout'
import { ProtectedRoute } from './components/ProtectedRoute'

// Pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Results from './pages/Results'
import ResultDetail from './pages/ResultDetail'
import InterviewSetup from './pages/Interview/Setup'
import SystemCheck from './pages/Interview/SystemCheck'
import ActiveInterview from './pages/ActiveInterview'
import FeedbackWaiting from './pages/FeedbackWaiting'
import Admin from './pages/Admin'
import MonacoWrapper from './components/CodeEditor/MonacoWrapper'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Public Routes ──────────────────────────────────────────────── */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dev/editor-test" element={<MonacoWrapper />} />

          {/* ── Full-screen Routes (no sidebar/navbar) ─────────────────────── */}
          <Route
            path="/interview/active"
            element={
              <ProtectedRoute>
                <ActiveInterview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interview/feedback"
            element={
              <ProtectedRoute>
                <FeedbackWaiting />
              </ProtectedRoute>
            }
          />

          {/* ── Candidate Dashboard Layout ─────────────────────────────────── */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/results" element={<Results />} />
            <Route path="/results/:id" element={<ResultDetail />} />
            <Route path="/interview/setup" element={<InterviewSetup />} />
            <Route path="/interview/system-check" element={<SystemCheck />} />
          </Route>

          {/* ── Admin Layout ───────────────────────────────────────────────── */}
          <Route
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/admin" element={<Admin />} />
          </Route>

          {/* ── Catch-all ──────────────────────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
