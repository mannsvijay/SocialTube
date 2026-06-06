import { useForm }         from 'react-hook-form'
import { zodResolver }     from '@hookform/resolvers/zod'
import { z }               from 'zod'
import { useState }        from 'react'
import { useMutation }     from '@tanstack/react-query'
import { toast }           from 'sonner'
import { Camera }          from 'lucide-react'
import { userApi }         from '@/api/user.api'
import { useAuth }         from '@/context/AuthContext'
import Input   from '@/components/ui/Input'
import Button  from '@/components/ui/Button'
import Avatar  from '@/components/ui/Avatar'

const schema = z.object({
  fullName: z.string().min(2, 'Full name required'),
  email:    z.string().email('Invalid email'),
  username: z.string().min(3).regex(/^[a-z0-9_]+$/, 'Lowercase, numbers, underscores only'),
})

export default function ProfileTab() {
  const { user, updateUser } = useAuth()

  const [avatarFile,    setAvatarFile]    = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [coverFile,     setCoverFile]     = useState(null)
  const [coverPreview,  setCoverPreview]  = useState(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: user?.fullName || '',
      email:    user?.email    || '',
      username: user?.username || '',
    },
  })

  const avatarMutation = useMutation({
    mutationFn: (file) => {
      const fd = new FormData()
      fd.append('avatar', file)
      return userApi.updateAvatar(fd)
    },
    onSuccess: (data) => updateUser({ avatar: data.avatar }),
  })

  const coverMutation = useMutation({
    mutationFn: (file) => {
      const fd = new FormData()
      fd.append('coverImage', file)
      return userApi.updateCoverImage(fd)
    },
    onSuccess: (data) => updateUser({ coverImage: data.coverImage }),
  })

  const onSubmit = async (data) => {
    try {
      const updated = await userApi.updateAccount(data)
      updateUser(updated)
      if (avatarFile) await avatarMutation.mutateAsync(avatarFile)
      if (coverFile)  await coverMutation.mutateAsync(coverFile)
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Update failed')
    }
  }

  return (
    <div className="space-y-8">

      {/* Cover image */}
      <div>
        <p className="text-sm font-medium text-text-secondary mb-2">Cover Image</p>
        <label htmlFor="cover-input" className="cursor-pointer block">
          <div className="w-full h-36 rounded-xl bg-bg-elevated border-2 border-dashed
                          border-border hover:border-accent transition-colors overflow-hidden relative">
            {(coverPreview || user?.coverImage)
              ? <img src={coverPreview || user.coverImage} alt="Cover" className="w-full h-full object-cover" />
              : (
                <div className="absolute inset-0 flex items-center justify-center gap-2">
                  <Camera size={20} className="text-text-muted" />
                  <span className="text-text-muted text-sm">Upload cover image</span>
                </div>
              )
            }
          </div>
        </label>
        <input
          id="cover-input"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => {
            const f = e.target.files[0]
            if (!f) return
            setCoverFile(f)
            setCoverPreview(URL.createObjectURL(f))
          }}
        />
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar src={avatarPreview || user?.avatar} name={user?.fullName} size="xl" />
          <label
            htmlFor="avatar-input"
            className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-accent
                       flex items-center justify-center cursor-pointer hover:bg-accent-hover transition-colors"
          >
            <Camera size={13} className="text-white" />
          </label>
          <input
            id="avatar-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => {
              const f = e.target.files[0]
              if (!f) return
              setAvatarFile(f)
              setAvatarPreview(URL.createObjectURL(f))
            }}
          />
        </div>
        <div>
          <p className="text-text-primary font-medium">{user?.fullName}</p>
          <p className="text-text-muted text-sm">@{user?.username}</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Full Name" error={errors.fullName?.message} {...register('fullName')} />
        <Input label="Username"  error={errors.username?.message} {...register('username')} />
        <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
        <Button type="submit" isLoading={isSubmitting} className="rounded-lg">
          Save Changes
        </Button>
      </form>
    </div>
  )
}