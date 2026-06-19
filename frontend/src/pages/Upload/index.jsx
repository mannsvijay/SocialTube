import { useState, useCallback }  from 'react'
import { useNavigate }            from 'react-router-dom'
import { useDropzone }            from 'react-dropzone'
import { useForm }                from 'react-hook-form'
import { zodResolver }            from '@hookform/resolvers/zod'
import { z }                      from 'zod'
import { toast }                  from 'sonner'
import {
  FileVideo, ImageIcon, CheckCircle2,
  ArrowLeft, UploadCloud,
} from 'lucide-react'
import { useVideoUpload }  from '@/hooks/useVideoUpload'
import { toWatch }         from '@/constants/routes'
import Input       from '@/components/ui/Input'
import Textarea    from '@/components/ui/Textarea'
import Button      from '@/components/ui/Button'
import ProgressBar from '@/components/ui/ProgressBar'
import { usePageTitle } from '@/hooks/usePageTitle'



/* ── Zod schema ── */
const metaSchema = z.object({
  title:       z.string().min(1, 'Title is required').max(100, 'Max 100 characters'),
  description: z.string().max(5000, 'Max 5000 characters').optional().default(''),
})

/* ── Reusable Dropzone ── */
function DropZone({ accept, label, hint, Icon, file, preview, onDrop }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
    maxFiles: 1,
    onDrop:   (accepted) => { if (accepted[0]) onDrop(accepted[0]) },
  })

  const hasFile = !!file

  return (
    <div
      {...getRootProps()}
      className={[
        'relative border-2 border-dashed rounded-2xl p-8 text-center',
        'cursor-pointer transition-all duration-200 select-none',
        isDragActive  ? 'border-accent bg-accent/5 scale-[1.01]' : '',
        hasFile       ? 'border-success/60 bg-success/5'         : '',
        !isDragActive && !hasFile
          ? 'border-border hover:border-accent/50 hover:bg-bg-elevated/50'
          : '',
      ].join(' ')}
    >
      <input {...getInputProps()} />

      {hasFile ? (
        /* ── File selected state ── */
        <div className="flex flex-col items-center gap-3">
          <CheckCircle2 size={36} className="text-success" />

          {/* Image preview for thumbnail */}
          {preview && (
            <img
              src={preview}
              alt="Thumbnail preview"
              className="max-h-28 rounded-xl object-cover shadow-md mx-auto"
            />
          )}

          <div>
            <p className="text-success text-sm font-semibold">{file.name}</p>
            <p className="text-text-muted text-xs mt-0.5">
              {(file.size / 1024 / 1024).toFixed(1)} MB · Click to change
            </p>
          </div>
        </div>
      ) : (
        /* ── Empty state ── */
        <div className="flex flex-col items-center gap-3">
          <div className={[
            'w-14 h-14 rounded-2xl flex items-center justify-center',
            'bg-bg-elevated transition-colors',
            isDragActive ? 'bg-accent/20' : '',
          ].join(' ')}>
            <Icon size={28} className={isDragActive ? 'text-accent' : 'text-text-muted'} />
          </div>
          <div>
            <p className="text-text-primary text-sm font-medium">{label}</p>
            <p className="text-text-muted text-xs mt-1">{hint}</p>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Step indicator ── */
function StepIndicator({ current }) {
  return (
    <div className="flex items-center gap-3 mb-8">
      {[1, 2].map((n) => (
        <div key={n} className="flex items-center gap-2">
          <div className={[
            'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all',
            n === current
              ? 'bg-accent text-white'
              : n < current
                ? 'bg-success text-white'
                : 'bg-bg-elevated text-text-muted',
          ].join(' ')}>
            {n < current ? <CheckCircle2 size={14} /> : n}
          </div>
          <span className={`text-sm ${n === current ? 'text-text-primary font-medium' : 'text-text-muted'}`}>
            {n === 1 ? 'Select Files' : 'Add Details'}
          </span>
          {n < 2 && <div className="w-12 h-px bg-border mx-1" />}
        </div>
      ))}
    </div>
  )
}

/* ── Main Upload page ── */
export default function Upload() {
  usePageTitle('Upload Video')
  const navigate   = useNavigate()
  const { upload, progress, uploading } = useVideoUpload()

  const [step, setStep]           = useState(1)
  const [videoFile, setVideoFile] = useState(null)
  const [thumbFile, setThumbFile] = useState(null)
  const [thumbPreview, setThumbPreview] = useState(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ resolver: zodResolver(metaSchema) })

  const titleValue = watch('title', '')

  /* ── Thumbnail handler — generate preview ── */
  const handleThumbDrop = useCallback((file) => {
    setThumbFile(file)
    setThumbPreview(URL.createObjectURL(file))
  }, [])

  /* ── Final submit ── */
  const onSubmit = async ({ title, description }) => {
    if (!videoFile || !thumbFile) {
      toast.error('Both video and thumbnail are required')
      return
    }

    const formData = new FormData()
    formData.append('videoFile',  videoFile)
    formData.append('thumbnail',  thumbFile)
    formData.append('title',      title.trim())
    formData.append('description', description?.trim() ?? '')

    try {
      const video = await upload(formData)
      toast.success('Video published!')
      navigate(toWatch(video._id))
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Upload failed. Please try again.')
    }
  }

  const canProceed = !!videoFile && !!thumbFile

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-text-primary mb-2">Upload Video</h1>
      <p className="text-text-muted text-sm mb-8">
        Share your content with the world.
      </p>

      <StepIndicator current={step} />

      {/* ══════════ STEP 1 — FILE SELECTION ══════════ */}
      {step === 1 && (
        <div className="space-y-4">
          {/* Video file */}
          <div>
            <p className="text-sm font-medium text-text-secondary mb-2">
              Video File <span className="text-error">*</span>
            </p>
            <DropZone
              accept={{ 'video/*': ['.mp4', '.webm', '.mov', '.avi', '.mkv'] }}
              label="Drop your video here"
              hint="MP4, WebM, MOV, AVI · Max 500MB"
              Icon={FileVideo}
              file={videoFile}
              onDrop={setVideoFile}
            />
          </div>

          {/* Thumbnail */}
          <div>
            <p className="text-sm font-medium text-text-secondary mb-2">
              Thumbnail <span className="text-error">*</span>
            </p>
            <DropZone
              accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }}
              label="Drop your thumbnail here"
              hint="JPG, PNG, WebP · Recommended 1280×720"
              Icon={ImageIcon}
              file={thumbFile}
              preview={thumbPreview}
              onDrop={handleThumbDrop}
            />
          </div>

          <Button
            onClick={() => setStep(2)}
            disabled={!canProceed}
            className="w-full rounded-xl mt-2"
            size="lg"
          >
            Continue →
          </Button>

          {!canProceed && (
            <p className="text-text-muted text-xs text-center">
              Select both a video file and thumbnail to continue
            </p>
          )}
        </div>
      )}

      {/* ══════════ STEP 2 — METADATA ══════════ */}
      {step === 2 && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* Files summary */}
          <div className="flex gap-3 p-4 bg-bg-elevated rounded-xl border border-border">
            {thumbPreview && (
              <img
                src={thumbPreview}
                alt="Thumbnail"
                className="w-24 aspect-video object-cover rounded-lg flex-shrink-0"
              />
            )}
            <div className="flex flex-col justify-center gap-1 min-w-0">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-success flex-shrink-0" />
                <span className="text-text-secondary text-xs truncate">{videoFile?.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-success flex-shrink-0" />
                <span className="text-text-secondary text-xs truncate">{thumbFile?.name}</span>
              </div>
            </div>
          </div>

          <Input
            label="Title"
            placeholder="Give your video a descriptive title..."
            error={errors.title?.message}
            {...register('title')}
          />
          <div className="flex justify-end">
            <span className={`text-xs ${titleValue.length > 90 ? 'text-warning' : 'text-text-muted'}`}>
              {titleValue.length}/100
            </span>
          </div>

          <Textarea
            label="Description (optional)"
            placeholder="Tell viewers about your video..."
            rows={5}
            error={errors.description?.message}
            {...register('description')}
          />

          {/* Progress bar — shows during upload */}
          {uploading && (
            <div className="space-y-2 py-2">
              <ProgressBar value={progress} showLabel />
              <p className="text-text-muted text-xs text-center">
                {progress < 100
                  ? 'Uploading to server...'
                  : 'Processing your video...'}
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={() => setStep(1)}
              disabled={uploading}
              className="flex-1 rounded-xl gap-2"
            >
              <ArrowLeft size={16} />
              Back
            </Button>

            <Button
              type="submit"
              size="lg"
              isLoading={uploading}
              className="flex-1 rounded-xl gap-2"
            >
              {!uploading && <UploadCloud size={16} />}
              {uploading ? `Uploading ${progress}%...` : 'Publish Video'}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}