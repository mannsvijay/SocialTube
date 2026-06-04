import { Outlet } from 'react-router-dom'
import Navbar    from '@/components/layout/Navbar'
import Sidebar   from '@/components/layout/Sidebar'
import MobileNav from '@/components/layout/MobileNav'

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar />

      {/* Below navbar */}
      <div className="flex pt-14">
        <Sidebar />

        {/* Main content — offset by sidebar on desktop */}
        <main className="flex-1 md:ml-[72px] lg:ml-[240px] min-h-[calc(100vh-56px)]">
          <div className="p-4 md:p-6 pb-24 md:pb-6 max-w-screen-2xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  )
}