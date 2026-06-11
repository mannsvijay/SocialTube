import Modal  from './Modal'
import Button from './Button'

/**
 * Usage:
 *   const [open, setOpen] = useState(false)
 *
 *   <ConfirmDialog
 *     isOpen={open}
 *     onClose={() => setOpen(false)}
 *     onConfirm={handleDelete}
 *     title="Delete Video?"
 *     description="This cannot be undone."
 *     confirmLabel="Delete"
 *     variant="danger"
 *   />
 */
export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title        = 'Are you sure?',
  description  = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel  = 'Cancel',
  variant      = 'danger',
  isLoading    = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-5">
        <p className="text-text-secondary text-sm leading-relaxed">
          {description}
        </p>
        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 rounded-lg"
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant}
            isLoading={isLoading}
            onClick={onConfirm}
            className="flex-1 rounded-lg"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}