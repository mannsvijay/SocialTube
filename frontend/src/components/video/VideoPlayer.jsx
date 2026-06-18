import { useState }   from 'react'
import ReactPlayer    from 'react-player'
import Spinner        from '@/components/ui/Spinner'

/**
 * @param {string}   url      — Cloudinary video URL
 * @param {string}   title    — shown as accessible title
 * @param {function} onEnded  — called when video finishes (used for autoplay)
 */
export default function VideoPlayer({ url, title, onEnded }) {
  const [ready, setReady] = useState(false)

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
      {!ready && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-bg-secondary">
          <Spinner size="lg" />
        </div>
      )}

      <ReactPlayer
        url={url}
        width="100%"
        height="100%"
        controls
        onReady={() => setReady(true)}
        onEnded={onEnded}
        style={{ opacity: ready ? 1 : 0 }}
        config={{
          file: {
            attributes: {
              title:       title || '',
              controlsList: 'nodownload',
            },
          },
        }}
      />
    </div>
  )
}