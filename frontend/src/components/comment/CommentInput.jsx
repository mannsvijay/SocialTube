import { useState } from 'react'
import { cn }       from '@/utils/helpers'
import Avatar       from '@/components/ui/Avatar'
import Button       from '@/components/ui/Button'

const MAX_LENGTH = 1000

/**
 * Comment box used for new comments and for editing.
 * onSubmit(content) must return a promise — the box clears when it resolves.
 */
export default function CommentInput({
  user,
  initialValue = '',
  placeholder  = 'Add a comment...',
  submitLabel  = 'Comment',
  autoFocus    = false,
  onSubmit,
  onCancel,
}) {
  const [text,    setText]    = useState(initialValue)
  const [focused, setFocused] = useState(autoFocus)
  const [saving,  setSaving]  = useState(false)

  const trimmed  = text.trim()
  const tooLong  = text.length > MAX_LENGTH
  const showBar  = focused || !!text || !!onCancel

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!trimmed || tooLong) return
    setSaving(true)
    try {
      await onSubmit(trimmed)
      setText('')
      setFocused(false)
    } catch {
      // the caller shows the error toast, keep the text so it isn't lost
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setText(initialValue)
    setFocused(false)
    onCancel?.()
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      {user && <Avatar src={user.avatar} name={user.fullName} size="sm" className="mt-1" />}

      <div className="flex-1 min-w-0">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          rows={focused || text ? 2 : 1}
          aria-label={placeholder}
          className="w-full bg-transparent border-b border-border focus:border-text-primary
                     outline-none resize-none text-sm text-text-primary
                     placeholder:text-text-muted py-1.5 transition-colors"
        />

        {showBar && (
          <div className="flex items-center justify-end gap-2 mt-2">
            <span className={cn('text-xs mr-auto', tooLong ? 'text-error' : 'text-text-muted')}>
              {text.length > MAX_LENGTH * 0.8 && `${text.length}/${MAX_LENGTH}`}
            </span>
            <Button type="button" variant="ghost" size="sm" onClick={handleCancel} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={saving} disabled={!trimmed || tooLong}>
              {submitLabel}
            </Button>
          </div>
        )}
      </div>
    </form>
  )
}
