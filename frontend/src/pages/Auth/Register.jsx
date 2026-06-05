import { useState }     from 'react'
import { useForm }      from 'react-hook-form'
import { zodResolver }  from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { toast }        from 'sonner'
import { Camera }       from 'lucide-react'
import { registerSchema } from '@/utils/validators'
import { authApi }      from '@/api/auth.api'
import { useAuth }      from '@/context/AuthContext'
import { ROUTES }       from '@/constants/routes'
import Input  from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function Register() {
  const { login }  = useAuth()
  const navigate   = useNavigate()

  const [avatarFile,    setAvatarFile]    = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(registerSchema) })

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const onSubmit = async (data) => {
    if (!avatarFile) {
      toast.error('Please upload a profile picture')
      return
    }

    const form = new FormData()
    form.append('fullName', data.fullName)
    form.append('username', data.username.toLowerCase())
    form.append('email',    data.email)
    form.append('password', data.password)
    form.append('avatar',   avatarFile)

    try {
      await authApi.register(form)
      // Auto login after register
      await login({ username: data.username.toLowerCase(), password: data.password })
      toast.success('Account created! Welcome 🎉')
      navigate(ROUTES.HOME, { replace: true })
    } catch (err) {
      const msg = err?.response?.data?.message || 'Registration failed.'
      toast.error(msg)
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-text-primary mb-1">Create account</h2>
      <p className="text-text-muted text-sm mb-6">Join SocialTube today</p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

        {/* Avatar upload */}
        <div className="flex flex-col items-center gap-2">
          <label htmlFor="avatar-input" className="cursor-pointer group">
            <div className="w-20 h-20 rounded-full bg-bg-elevated border-2
                            border-dashed border-border group-hover:border-accent
                            flex items-center justify-center overflow-hidden transition-colors">
              {avatarPreview
                ? <img src={avatarPreview} alt="preview" className="w-full h-full object-cover" />
                : <Camera size={24} className="text-text-muted group-hover:text-accent transition-colors" />
              }
            </div>
            <p className="text-xs text-text-muted text-center mt-1.5">
              {avatarPreview ? 'Change photo' : 'Upload photo *'}
            </p>
          </label>
          <input
            id="avatar-input"
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>

        <Input
          label="Full Name"
          placeholder="Alex Johnson"
          error={errors.fullName?.message}
          {...register('fullName')}
        />

        <Input
          label="Username"
          placeholder="alexj"
          error={errors.username?.message}
          {...register('username')}
        />

        <Input
          label="Email"
          type="email"
          placeholder="alex@example.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          type="password"
          label="Password"
          placeholder="Min. 6 characters"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <Input
          type="password"
          label="Confirm Password"
          placeholder="Repeat password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button
          type="submit"
          isLoading={isSubmitting}
          className="w-full mt-2 rounded-lg"
        >
          Create account
        </Button>
      </form>

      <p className="text-center text-sm text-text-muted mt-6">
        Already have an account?{' '}
        <Link to={ROUTES.LOGIN} className="text-accent hover:text-accent-light transition-colors">
          Log in
        </Link>
      </p>
    </div>
  )
}