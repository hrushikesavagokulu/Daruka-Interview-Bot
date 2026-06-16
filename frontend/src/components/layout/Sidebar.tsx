import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, User, Play, ClipboardList, ShieldAlert } from 'lucide-react'

export interface SidebarProps {
  isOpen?: boolean
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = true }) => {
  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { to: '/profile', label: 'Profile & Resumes', icon: <User className="w-5 h-5" /> },
    { to: '/interview/setup', label: 'Start Interview', icon: <Play className="w-5 h-5" /> },
    { to: '/results', label: 'Interview Results', icon: <ClipboardList className="w-5 h-5" /> },
  ]

  const activeLinkClass = 'flex items-center gap-3 px-4 py-3 text-sm font-bold bg-light text-primary border-r-4 border-accent transition-all'
  const inactiveLinkClass = 'flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray hover:text-primary hover:bg-lightGray transition-all'

  return (
    <aside className={`w-64 bg-white border-r border-border min-h-[calc(100vh-61px)] flex flex-col justify-between shadow-sm ${isOpen ? 'block' : 'hidden md:block'}`}>
      <div className="py-4">
        {/* Navigation Section */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? activeLinkClass : inactiveLinkClass)}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Admin Section (Stub/Demo navigation shortcut) */}
      <div className="border-t border-border p-4 bg-lightGray/50">
        <NavLink
          to="/admin"
          className={({ isActive }) => (isActive ? activeLinkClass + ' rounded-lg' : inactiveLinkClass + ' rounded-lg border border-transparent border-dashed hover:border-border')}
        >
          <ShieldAlert className="w-5 h-5 text-warning" />
          <div className="flex flex-col">
            <span className="font-semibold text-xs text-primary leading-tight">Admin Console</span>
            <span className="text-[10px] text-gray leading-none">System Settings</span>
          </div>
        </NavLink>
      </div>
    </aside>
  )
}
