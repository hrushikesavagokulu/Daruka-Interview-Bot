import { FC } from 'react'
import { Link, Outlet, NavLink } from 'react-router-dom'
import { ShieldAlert, ArrowLeft, Users, Settings, Database, Activity } from 'lucide-react'

export const AdminLayout: FC = () => {
  const adminNavItems = [
    { to: '/admin', label: 'Admin Overview', icon: <ShieldAlert className="w-5 h-5" /> },
    { to: '#users', label: 'User Accounts', icon: <Users className="w-5 h-5" /> },
    { to: '#logs', label: 'Evaluation Logs', icon: <Database className="w-5 h-5" /> },
    { to: '#metrics', label: 'System Health', icon: <Activity className="w-5 h-5" /> },
  ]

  return (
    <div className="min-h-screen bg-lightGray flex flex-col font-sans">
      {/* Admin Warning Banner */}
      <div className="bg-warning text-white text-xs font-bold text-center py-1.5 px-4 tracking-wider flex items-center justify-center gap-2">
        <ShieldAlert className="w-4 h-4" />
        <span>SECURE ADMIN AREA — AUTHORIZED PERSONNEL ONLY</span>
      </div>

      {/* Admin Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-border px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-warning flex items-center justify-center text-white">
              🛡️
            </div>
            <span className="font-bold text-lg text-primary tracking-wide">
              Daruka Admin
            </span>
          </Link>
        </div>

        <Link
          to="/dashboard"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-lightGray border border-border rounded-lg transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit Admin</span>
        </Link>
      </header>

      {/* Admin Layout Body */}
      <div className="flex flex-1">
        <aside className="w-64 bg-white border-r border-border min-h-[calc(100vh-101px)] py-4 flex flex-col justify-between shadow-sm">
          <nav className="flex flex-col gap-1">
            {adminNavItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) => 
                  isActive && item.to.startsWith('/admin')
                    ? 'flex items-center gap-3 px-4 py-3 text-sm font-bold bg-warning/10 text-warning border-r-4 border-warning transition-all'
                    : 'flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray hover:text-primary hover:bg-lightGray transition-all'
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-lightGray text-[11px] text-gray">
              <Settings className="w-4 h-4 animate-spin" />
              <span>v1.0.0 (Local Build)</span>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full animate-in fade-in duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
