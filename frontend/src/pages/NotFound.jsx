import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import Button from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center gap-4 text-center px-4">
      <span className="text-8xl font-bold text-bg-elevated select-none">404</span>
      <h1 className="text-2xl font-semibold text-text-primary">Page not found</h1>
      <p className="text-text-muted text-sm max-w-xs">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Button as={Link} to={ROUTES.HOME} className="mt-2">
        Go home
      </Button>
    </div>
  )
}