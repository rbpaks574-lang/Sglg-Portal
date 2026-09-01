import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { checkerAPI } from '../services/api'
import StatCard from '../components/common/StatCard'
import StatusBadge from '../components/common/StatusBadge'
import DocumentPreviewModal from '../components/common/DocumentPreviewModal'
import { format } from 'date-fns'
import {
  HiClock,
  HiCheckCircle,
  HiExclamationCircle,
  HiClipboardCheck,
  HiArrowRight,
  HiDocumentText,
  HiEye
} from 'react-icons/hi'

export default function CheckerDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [previewDoc, setPreviewDoc] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    checkerAPI.dashboard()
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg text-primary"></span></div>
  if (!data) return null

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold">Checker Dashboard</h1>
        <p className="text-base-content/60 text-base">Review and validate barangay SGLG submissions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Pending Review" value={data.pending_count} icon={HiClock} color="warning" onClick={() => navigate('/checker/queue?status=pending')} />
        <StatCard title="Reviewed Today" value={data.reviewed_today} icon={HiClipboardCheck} color="info" onClick={() => navigate('/checker/queue?status=all')} />
        <StatCard title="Total Reviewed" value={data.total_reviewed} icon={HiCheckCircle} color="success" onClick={() => navigate('/checker/queue?status=verified')} />
        <StatCard title="Returned" value={data.returned_count} icon={HiExclamationCircle} color="error" onClick={() => navigate('/checker/queue?status=returned')} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending Queue */}
        <div className="card bg-base-100 shadow-sm border border-base-300">
          <div className="card-body p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="card-title text-lg">Pending Queue</h2>
                <p className="text-xs text-base-content/50">Submissions awaiting review</p>
              </div>
              <Link to="/checker/queue" className="btn btn-primary btn-sm gap-1">
                Open Full Queue <HiArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {data.pending_queue?.length > 0 ? (
              <div className="space-y-3">
                {data.pending_queue.slice(0, 5).map(sub => (
                  <div key={sub.id} className="flex items-center justify-between p-3.5 bg-base-200/80 hover:bg-base-200 rounded-xl transition-colors border border-base-300/60">
                    <div className="min-w-0 flex-1 pr-3">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm truncate text-base-content" title={sub.original_filename}>
                          {sub.original_filename}
                        </p>
                        <span className="badge badge-xs badge-outline uppercase font-mono text-[10px]">
                          {sub.file_type || 'PDF'}
                        </span>
                      </div>
                      <p className="text-xs text-base-content/60 mt-0.5">
                        <strong className="text-primary">{sub.barangay?.name}</strong> • {sub.required_document?.category?.name}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="btn btn-primary btn-xs gap-1 font-semibold"
                        onClick={() => setPreviewDoc(sub)}
                        title="Preview submitted document"
                      >
                        <HiEye className="w-3.5 h-3.5" /> View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-base-content/50 text-center py-8">No pending submissions</p>
            )}
          </div>
        </div>

        {/* Recently Reviewed */}
        <div className="card bg-base-100 shadow-sm border border-base-300">
          <div className="card-body p-6">
            <h2 className="card-title text-lg mb-4">Recently Reviewed</h2>
            {data.recently_reviewed?.length > 0 ? (
              <div className="space-y-3">
                {data.recently_reviewed.map(sub => (
                  <div key={sub.id} className="flex items-center justify-between p-3.5 bg-base-200/80 hover:bg-base-200 rounded-xl transition-colors border border-base-300/60">
                    <div className="min-w-0 flex-1 pr-3">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm truncate text-base-content">{sub.original_filename}</p>
                      </div>
                      <p className="text-xs text-base-content/60 mt-0.5">
                        <strong className="text-base-content/80">{sub.barangay?.name}</strong> • {sub.required_document?.name}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <StatusBadge status={sub.status} />
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs btn-square border border-base-300"
                        onClick={() => setPreviewDoc(sub)}
                        title="View document"
                      >
                        <HiEye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-base-content/50 text-center py-8">No reviewed submissions yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Standalone Preview Modal */}
      {previewDoc && (
        <DocumentPreviewModal
          submission={previewDoc}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  )
}
