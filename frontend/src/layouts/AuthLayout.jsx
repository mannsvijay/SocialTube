import { Outlet, Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-4 py-12">
      <Link to={ROUTES.HOME} className="mb-8 select-none">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Social<span className="text-accent">Tube</span>
        </h1>
      </Link>

      <div className="w-full max-w-md bg-bg-secondary border border-border rounded-2xl p-8 shadow-xl">
        <Outlet />
      </div>
    </div>
  )
}