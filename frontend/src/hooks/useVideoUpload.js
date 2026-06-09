import { useState }  from 'react'
import { videoApi }  from '@/api/video.api'

/**
 * Manages video upload state with progress tracking.
 *
 * Usage:
 *   const { upload, progress, uploading } = useVideoUpload()
 *   const result = await upload(formData)
 */
export function useVideoUpload() {
  const [progress,  setProgress]  = useState(0)
  const [uploading, setUploading] = useState(false)

  const upload = async (formData) => {
    setUploading(true)
    setProgress(0)

    try {
      const result = await videoApi.publish(formData, (pct) => setProgress(pct))
      setProgress(100)
      return result
    } finally {
      setUploading(false)
    }
  }

  const reset = () => { setProgress(0); setUploading(false) }

  return { upload, progress, uploading, reset }
}