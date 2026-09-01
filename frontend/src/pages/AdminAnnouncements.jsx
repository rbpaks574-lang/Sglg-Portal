import { useState, useEffect } from 'react'
import { adminAPI } from '../services/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { HiPlus, HiPencil, HiTrash, HiSpeakerphone, HiBookmark } from 'react-icons/hi'

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortOrder, setSortOrder] = useState('desc')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({
    title: '', content: '', priority: 'normal', target_role: 'all',
    is_pinned: false, expires_at: ''
  })

  useEffect(() => {
    loadAnnouncements()
  }, [sortOrder])

  const loadAnnouncements = () => {
    setLoading(true)
    adminAPI.announcements({ sort: sortOrder })
      .then(res => setAnnouncements(res.data.data || res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = { ...form }
      if (!data.expires_at) delete data.expires_at

      if (editing) {
        await adminAPI.updateAnnouncement(editing.id, data)
        toast.success('Announcement updated')
      } else {
        await adminAPI.createAnnouncement(data)
        toast.success('Announcement created')
      }
      setShowModal(false)
      setEditing(null)
      resetForm()
      loadAnnouncements()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed')
    }
  }

  const handleDelete = async (a) => {
    if (!confirm('Delete this announcement?')) return
    try {
      await adminAPI.deleteAnnouncement(a.id)
      toast.success('Announcement deleted')
      loadAnnouncements()
    } catch (err) {
      toast.error('Delete failed')
    }
  }

  const handleEdit = (a) => {
    setEditing(a)
    setForm({
      title: a.title,
      content: a.content,
      priority: a.priority,
      target_role: a.target_role || 'all',
      is_pinned: a.is_pinned,
      expires_at: a.expires_at ? a.expires_at.split('T')[0] : '',
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setForm({ title: '', content: '', priority: 'normal', target_role: 'all', is_pinned: false, expires_at: '' })
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
          <p className="text-base-content/60">Broadcast memos and updates to all barangays</p>
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
          <button className="btn btn-primary gap-2" onClick={() => { resetForm(); setEditing(null); setShowModal(true) }}>
            <HiPlus className="w-5 h-5" /> New Announcement
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><span className="loading loading-spinner loading-lg"></span></div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-16">
          <HiSpeakerphone className="w-16 h-16 mx-auto text-base-content/20 mb-4" />
          <p className="text-lg text-base-content/50">No announcements yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map(a => (
            <div key={a.id} className="card bg-base-100 shadow-sm border border-base-300">
              <div className="card-body p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {a.is_pinned && <HiBookmark className="w-4 h-4 text-primary" />}
                      <span className={priorityBadge(a.priority)}>{a.priority}</span>
                      <span className="badge badge-outline text-xs uppercase">{a.target_role || 'all'}</span>
                      <span className="text-xs text-base-content/40">
                        {format(new Date(a.created_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg">{a.title}</h3>
                    <p className="text-base-content/70 mt-2">{a.content}</p>
                    {a.expires_at && (
                      <p className="text-xs text-base-content/40 mt-2">
                        Expires: {format(new Date(a.expires_at), 'MMM d, yyyy')}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(a)}>
                      <HiPencil className="w-4 h-4" />
                    </button>
                    <button className="btn btn-ghost btn-sm text-error" onClick={() => handleDelete(a)}>
                      <HiTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-lg">
            <h3 className="font-bold text-xl mb-4">{editing ? 'Edit Announcement' : 'New Announcement'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-3">
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Title</span></label>
                  <input type="text" className="input input-bordered" value={form.title}
                    onChange={(e) => setForm({...form, title: e.target.value})} required />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Content</span></label>
                  <textarea className="textarea textarea-bordered h-32" value={form.content}
                    onChange={(e) => setForm({...form, content: e.target.value})} required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="form-control">
                    <label className="label"><span className="label-text font-medium">Audience</span></label>
                    <select className="select select-bordered" value={form.target_role}
                      onChange={(e) => setForm({...form, target_role: e.target.value})}>
                      <option value="all">Everyone</option>
                      <option value="barangay">Barangays Only</option>
                      <option value="checker">Checkers Only</option>
                    </select>
                  </div>
                  <div className="form-control">
                    <label className="label"><span className="label-text font-medium">Priority</span></label>
                    <select className="select select-bordered" value={form.priority}
                      onChange={(e) => setForm({...form, priority: e.target.value})}>
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Expires At</span></label>
                  <input type="date" className="input input-bordered" value={form.expires_at}
                    onChange={(e) => setForm({...form, expires_at: e.target.value})} />
                </div>
                <div className="form-control">
                  <label className="cursor-pointer flex items-center gap-2">
                    <input type="checkbox" className="checkbox" checked={form.is_pinned}
                      onChange={(e) => setForm({...form, is_pinned: e.target.checked})} />
                    <span className="label-text">Pin this announcement</span>
                  </label>
                </div>
              </div>
              <div className="modal-action mt-4">
                <button type="button" className="btn btn-ghost" onClick={() => { setShowModal(false); setEditing(null) }}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Publish'}</button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => { setShowModal(false); setEditing(null) }}>close</button>
          </form>
        </dialog>
      )}
    </div>
  )
}
