import { useForm }          from 'react-hook-form'
import { zodResolver }      from '@hookform/resolvers/zod'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { toast }            from 'sonner'
import { loginSchema }      from '@/utils/validators'
import { useAuth }          from '@/context/AuthContext'
import { ROUTES }           from '@/constants/routes'
import Input   from '@/components/ui/Input'
import Button  from '@/components/ui/Button'

export default function Login() {
  const { login }   = useAuth()
  const navigate    = useNavigate()
  const location    = useLocation()
  const from        = location.state?.from?.pathname || ROUTES.HOME

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) })

  const onSubmit = async ({ identifier, password }) => {
    try {
      // identifier can be email or username — send whichever the backend expects
      const isEmail = identifier.includes('@')
      await login(
        isEmail
          ? { email: identifier, password }
          : { username: identifier, password }
      )
      toast.success('Welcome back!')
      navigate(from, { replace: true })
    } catch (err) {
      const msg = err?.response?.data?.message || 'Login failed. Please try again.'
      toast.error(msg)
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-text-primary mb-1">
        Welcome back
      </h2>
      <p className="text-text-muted text-sm mb-6">
        Sign in to your SocialTube account
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Username or Email"
          placeholder="you@example.com"
          autoComplete="username"
          error={errors.identifier?.message}
          {...register('identifier')}
        />

        <Input
          type="password"
          label="Password"
          placeholder="••••••••"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <Button
          type="submit"
          isLoading={isSubmitting}
          className="w-full mt-2 rounded-lg"
        >
          Log in
        </Button>
      </form>

      <p className="text-center text-sm text-text-muted mt-6">
        Don't have an account?{' '}
        <Link to={ROUTES.REGISTER} className="text-accent hover:text-accent-light transition-colors">
          Sign up
        </Link>
      </p>
    </div>
  )
}