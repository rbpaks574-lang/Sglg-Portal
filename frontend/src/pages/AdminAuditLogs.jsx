import { useState, useEffect } from 'react'
import { adminAPI } from '../services/api'
import { format } from 'date-fns'
import { HiClipboardList, HiSearch } from 'react-icons/hi'

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    setLoading(true)
    adminAPI.auditLogs({ page })
      .then(res => {
        setLogs(res.data.data || res.data)
        setTotalPages(res.data.last_page || 1)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [page])

  const actionBadge = (action) => {
    const map = {
      login: 'badge-info',
      logout: 'badge-ghost',
      submit: 'badge-primary',
      review_verified: 'badge-success',
      review_returned: 'badge-error',
      resubmit: 'badge-warning',
      create_user: 'badge-accent',
      update_user: 'badge-accent',
      delete_user: 'badge-error',
      create_announcement: 'badge-primary',
      delete_announcement: 'badge-error',
    }
    return `badge ${map[action] || 'badge-ghost'} badge-sm`
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Audit Logs</h1>
        <p className="text-base-content/60">Track all system activities and user actions</p>
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-300">
        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>Time</th>
                <th>User</th>
                <th>Action</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="text-center py-8"><span className="loading loading-spinner"></span></td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8 text-base-content/50">No logs found</td></tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id}>
                    <td className="text-sm whitespace-nowrap">
                      {format(new Date(log.created_at), 'MMM d, yyyy h:mm a')}
                    </td>
                    <td>
                      <div>
                        <p className="font-medium text-sm">{log.user?.name || 'System'}</p>
                        <p className="text-xs text-base-content/50">{log.user?.role}</p>
                      </div>
                    </td>
                    <td><span className={actionBadge(log.action)}>{log.action}</span></td>
                    <td className="text-sm max-w-xs truncate">{log.description}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="card-body border-t border-base-300 flex justify-center">
            <div className="join">
              <button className="join-item btn btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                «
              </button>
              <button className="join-item btn btn-sm">Page {page} of {totalPages}</button>
              <button className="join-item btn btn-sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                »
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
