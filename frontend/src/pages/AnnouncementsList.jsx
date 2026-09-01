import { useState, useEffect } from 'react'
import { adminAPI } from '../services/api'
import { format } from 'date-fns'
import { HiSpeakerphone, HiBookmark } from 'react-icons/hi'

export default function AnnouncementsList() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortOrder, setSortOrder] = useState('desc')

  useEffect(() => {
    loadAnnouncements()
  }, [sortOrder])

  const loadAnnouncements = () => {
    setLoading(true)
    adminAPI.announcements({ sort: sortOrder })
      .then(res => {
        const data = res.data.data || res.data
        setAnnouncements(data)
        
        if (data.length > 0) {
          localStorage.setItem('sglg_last_announcement_time', new Date().toISOString())
          window.dispatchEvent(new Event('sglg_announcements_read'))
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  const priorityBadge = (p) => {
    const map = { low: 'badge-ghost', normal: 'badge-info', high: 'badge-warning', urgent: 'badge-error' }
    return `badge ${map[p] || 'badge-ghost'}`
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Announcements</h1>
          <p className="text-base-content/60">Important memos and updates from DILG</p>
        </div>
        <div className="flex items-center gap-2">
          <select 
            className="select select-bordered select-sm"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><span className="loading loading-spinner loading-lg"></span></div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-16">
          <HiSpeakerphone className="w-16 h-16 mx-auto text-base-content/20 mb-4" />
          <p className="text-lg text-base-content/50">No announcements at this time.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map(a => (
            <div key={a.id} className="card bg-base-100 shadow-sm border border-base-300">
              <div className="card-body p-6">
                <div className="flex items-center gap-2 mb-3">
                  {a.is_pinned && <HiBookmark className="w-5 h-5 text-primary" />}
                  <span className={priorityBadge(a.priority)}>{a.priority}</span>
                  <span className="text-sm font-semibold text-base-content/50 ml-auto">
                    {format(new Date(a.created_at), 'MMMM d, yyyy - h:mm a')}
                  </span>
                </div>
                <h3 className="font-bold text-xl text-base-content">{a.title}</h3>
                <p className="text-base-content/80 mt-3 leading-relaxed whitespace-pre-wrap">{a.content}</p>
                {a.expires_at && (
                  <p className="text-xs text-base-content/40 mt-4">
                    Valid until: {format(new Date(a.expires_at), 'MMMM d, yyyy')}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
