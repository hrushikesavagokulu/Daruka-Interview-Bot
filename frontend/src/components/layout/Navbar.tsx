import { useState, FC } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, LogOut, Bell, ChevronDown, Sparkles } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

export interface NavbarProps {
  onToggleSidebar?: () => void
}

export const Navbar: FC<NavbarProps> = ({ onToggleSidebar }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const navigate = useNavigate()
  
  const { user, logout } = useAuthStore()
  
  const name = user?.full_name || 'Jane Doe'
  const email = user?.email || 'jane.doe@example.com'
  const avatarInitials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'JD'

  const handleLogout = () => {
    setDropdownOpen(false)
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-border px-6 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-1.5 rounded-lg hover:bg-light text-primary focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            <Sparkles className="w-5 h-5" />
          </button>
        )}
        <Link to="/dashboard" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white transition-transform group-hover:scale-110">
            🤖
          </div>
          <span className="font-bold text-lg text-primary tracking-wide transition-colors group-hover:text-accent">
            Daruka
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {/* Notification Icon */}
        <button 
          className="p-2 text-gray hover:text-primary hover:bg-lightGray rounded-full relative transition-colors focus:outline-none"
          aria-label="View notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger" />
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 hover:bg-lightGray rounded-xl transition-colors focus:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-accent text-white font-bold flex items-center justify-center text-sm">
              {avatarInitials}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-primary leading-tight">{name}</span>
              <span className="text-[10px] text-gray leading-none">Candidate</span>
            </div>
            <ChevronDown className="w-4 h-4 text-gray" />
          </button>

          {dropdownOpen && (
            <>
              {/* Overlay transparent layer to dismiss on click outside */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white border border-border rounded-xl shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2 border-b border-border text-left">
                  <p className="text-sm font-semibold text-primary">{name}</p>
                  <p className="text-xs text-gray truncate">{email}</p>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-primary hover:bg-lightGray transition-colors"
                >
                  <User className="w-4 h-4 text-accent" />
                  <span>My Profile & Resumes</span>
                </Link>
                <div className="border-t border-border my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-danger/5 text-left transition-colors focus:outline-none"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
