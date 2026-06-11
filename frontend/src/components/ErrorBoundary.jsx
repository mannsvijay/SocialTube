import { Component } from 'react'
import { Link }      from 'react-router-dom'
import { ROUTES }    from '@/constants/routes'

/**
 * Catches JS errors anywhere in the tree and shows a fallback UI.
 * Wrap the entire app in this — production must-have.
 */
export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // Replace with Sentry.captureException(error) in production
    console.error('[ErrorBoundary caught]', error, info.componentStack)
  }

  handleReset = () => this.setState({ hasError: false, error: null })

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="min-h-screen bg-bg-primary flex flex-col items-center
                      justify-center gap-5 text-center px-6">
        <span className="text-7xl select-none">💥</span>

        <div className="max-w-sm">
          <h1 className="text-xl font-semibold text-text-primary">
            Something went wrong
          </h1>
          <p className="text-text-muted text-sm mt-2 leading-relaxed">
            An unexpected error occurred. Refresh the page or return to home.
          </p>
          {/* Dev only — show error message */}
          {import.meta.env.DEV && this.state.error && (
            <pre className="mt-4 p-3 bg-bg-elevated border border-border rounded-xl
                            text-error text-xs text-left overflow-auto max-h-32">
              {this.state.error.toString()}
            </pre>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={this.handleReset}
            className="px-5 py-2 rounded-full border border-border text-text-secondary
                       hover:text-text-primary hover:border-border-light text-sm transition-colors"
          >
            Try again
          </button>
          <Link
            to={ROUTES.HOME}
            onClick={this.handleReset}
            className="px-5 py-2 rounded-full bg-accent hover:bg-accent-hover
                       text-white text-sm font-medium transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    )
  }
}