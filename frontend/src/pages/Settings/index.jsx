import { useState } from 'react'
import { cn }       from '@/utils/helpers'
import ProfileTab   from './ProfileTab'
import PasswordTab  from './PasswordTab'

const TABS = [
  { id: 'profile',  label: 'Profile'  },
  { id: 'security', label: 'Security' },
]

export default function Settings() {
  const [active, setActive] = useState('profile')

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-text-primary mb-6">Settings</h1>

      <div className="flex gap-1 bg-bg-elevated rounded-xl p-1 mb-8 w-fit">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={cn(
              'px-5 py-2 rounded-lg text-sm font-medium transition-all',
              active === tab.id
                ? 'bg-bg-secondary text-text-primary shadow-sm'
                : 'text-text-muted hover:text-text-secondary'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {active === 'profile'  && <ProfileTab />}
      {active === 'security' && <PasswordTab />}
    </div>
  )
}