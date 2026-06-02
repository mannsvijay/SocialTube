/**
 * 1500 → "1.5K"  |  1_200_000 → "1.2M"
 */
export function formatViews(num) {
  if (num == null) return '0'
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M views`
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K views`
  return `${num} views`
}

/**
 * 125 → "2:05"  |  3661 → "1:01:01"
 */
export function formatDuration(seconds) {
  if (!seconds) return '0:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const mm = m.toString().padStart(2, '0')
  const ss = s.toString().padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${m}:${ss}`
}

/**
 * ISO date string → "3 days ago" / "Just now"
 */
export function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)

  const units = [
    { label: 'year',   secs: 31_536_000 },
    { label: 'month',  secs:  2_592_000 },
    { label: 'week',   secs:    604_800 },
    { label: 'day',    secs:     86_400 },
    { label: 'hour',   secs:      3_600 },
    { label: 'minute', secs:         60 },
  ]

  for (const { label, secs } of units) {
    const count = Math.floor(diff / secs)
    if (count >= 1) return `${count} ${label}${count > 1 ? 's' : ''} ago`
  }

  return 'Just now'
}

/**
 * "Helo there this is a very lon..." with custom max length
 */
export function truncate(str, max = 100) {
  if (!str) return ''
  return str.length <= max ? str : str.slice(0, max) + '...'
}