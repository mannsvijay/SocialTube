import { useState }   from 'react'
import ReactPlayer    from 'react-player'
import Spinner        from '@/components/ui/Spinner'

/**
 * @param {string}   url      — Cloudinary video URL
 * @param {string}   title    — shown as accessible title
 * @param {function} onEnded  — called when video finishes (used for autoplay)
 *
 * Render with key={url} so the loading state resets when the video changes.
 */
export default function VideoPlayer({ url, title, onEnded }) {
  const [ready,  setReady]  = useState(false)
  const [failed, setFailed] = useState(false)

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
      {!ready && !failed && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-bg-secondary">
          <Spinner size="lg" />
        </div>
      )}

      {failed && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-bg-secondary">
          <p className="text-text-muted text-sm">This video could not be loaded.</p>
        </div>
      )}

      {/* react-player v3: the url prop is `src`, native <video> attributes are passed directly */}
      <ReactPlayer
        src={url}
        title={title || ''}
        width="100%"
        height="100%"
        controls
        playsInline
        onReady={() => setReady(true)}
        onError={() => setFailed(true)}
        onEnded={onEnded}
        style={{ opacity: ready ? 1 : 0 }}
      />
    </div>
  )
}
