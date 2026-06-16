import { FC } from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'

export const DashboardLayout: FC = () => {
  return (
    <div className="min-h-screen bg-lightGray flex flex-col font-sans">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full animate-in fade-in duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
