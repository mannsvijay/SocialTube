import { useNavigate, Link } from 'react-router-dom'
import { Home, ArrowLeft }   from 'lucide-react'
import { usePageTitle }      from '@/hooks/usePageTitle'
import { ROUTES }            from '@/constants/routes'

export default function NotFound() {
  const navigate = useNavigate()
  usePageTitle('404 — Page Not Found')

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center
                    justify-center gap-6 text-center px-4">
      {/* Big 404 */}
      <div className="relative select-none">
        <p className="text-[120px] md:text-[180px] font-black text-bg-elevated
                      leading-none tracking-tighter">
          404
        </p>
        <span className="absolute inset-0 flex items-center justify-center
                         text-5xl md:text-7xl">
          🔭
        </span>
      </div>

      <div className="max-w-sm space-y-2">
        <h1 className="text-2xl font-bold text-text-primary">
          Page not found
        </h1>
        <p className="text-text-muted text-sm leading-relaxed">
          Looks like this page drifted into the void.
          Let&apos;s get you back to safety.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full
                     border border-border text-text-secondary text-sm
                     hover:text-text-primary hover:border-border-light transition-colors"
        >
          <ArrowLeft size={15} />
          Go back
        </button>

        <Link
          to={ROUTES.HOME}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full
                     bg-accent hover:bg-accent-hover text-white text-sm
                     font-medium transition-colors"
        >
          <Home size={15} />
          Go home
        </Link>
      </div>
    </div>
  )
}