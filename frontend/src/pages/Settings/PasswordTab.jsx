import { useForm }     from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z }           from 'zod'
import { toast }       from 'sonner'
import { authApi }     from '@/api/auth.api'
import Input  from '@/components/ui/Input'
import Button from '@/components/ui/Button'

const schema = z.object({
  oldPassword:     z.string().min(6, 'Enter current password'),
  newPassword:     z.string().min(6, 'At least 6 characters'),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: "Passwords don't match",
  path:    ['confirmPassword'],
})

export default function PasswordTab() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async ({ oldPassword, newPassword }) => {
    try {
      await authApi.changePassword({ oldPassword, newPassword })
      toast.success('Password changed!')
      reset()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to change password')
    }
  }

  return (
    <div className="max-w-md">
      <h2 className="text-lg font-semibold text-text-primary mb-6">Change Password</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input type="password" label="Current Password"  error={errors.oldPassword?.message}     {...register('oldPassword')} />
        <Input type="password" label="New Password"      error={errors.newPassword?.message}     {...register('newPassword')} />
        <Input type="password" label="Confirm Password"  error={errors.confirmPassword?.message} {...register('confirmPassword')} />
        <Button type="submit" isLoading={isSubmitting} className="rounded-lg">
          Update Password
        </Button>
      </form>
    </div>
  )
}