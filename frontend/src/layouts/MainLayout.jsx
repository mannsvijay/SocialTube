import { Outlet }    from 'react-router-dom'
import { cn }        from '@/utils/helpers'
import { useUI }     from '@/context/UIContext'
import Navbar        from '@/components/layout/Navbar'
import Sidebar       from '@/components/layout/Sidebar'
import MobileNav     from '@/components/layout/MobileNav'
import ScrollToTop   from '@/components/ui/ScrollToTop'

export default function MainLayout() {
  const { sidebarCollapsed } = useUI()

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar />

      <div className="flex pt-14">
        <Sidebar />

        <main
          id="main-content"
          className={cn(
            'flex-1 min-h-[calc(100vh-56px)]',
            'transition-all duration-300 ease-in-out',
            sidebarCollapsed ? 'md:ml-[72px]' : 'md:ml-[240px]'
          )}
        >
          <div className="p-4 md:p-6 pb-24 md:pb-6 max-w-screen-2xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      <MobileNav />
      <ScrollToTop />
    </div>
  )
}