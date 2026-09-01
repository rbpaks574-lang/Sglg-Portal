import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { barangayAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import StatCard from '../components/common/StatCard'
import StatusBadge from '../components/common/StatusBadge'
import { format } from 'date-fns'
import {
  HiDocumentText, HiClock, HiCheckCircle, HiExclamationCircle,
  HiArrowRight, HiSpeakerphone, HiCalendar
} from 'react-icons/hi'

export default function BarangayDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    barangayAPI.dashboard()
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSkeleton />
  if (!data) return null

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
        <p className="text-base-content/60 text-lg">{data.barangay?.name} — Compliance Dashboard</p>
      </div>

      {/* Compliance Score */}
      <div className="card bg-base-100 shadow-sm border border-base-300">
        <div className="card-body p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-base-content/60 text-sm font-medium">Your Compliance Score</p>
              <p className="text-5xl font-bold mt-1">{data.compliance_score || 0}%</p>
            </div>
            <div className="flex-1 max-w-xs">
              <progress
                className={`progress w-full h-4 ${
                  data.compliance_score >= 80 ? 'progress-success' :
                  data.compliance_score >= 50 ? 'progress-warning' : 'progress-error'
                }`}
                value={data.compliance_score || 0}
                max="100"
              ></progress>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Submitted" value={data.total_submissions} icon={HiDocumentText} color="primary" />
        <StatCard title="Pending" value={data.pending_submissions} icon={HiClock} color="warning" />
        <StatCard title="Verified" value={data.verified_submissions} icon={HiCheckCircle} color="success" />
        <StatCard title="Returned" value={data.returned_submissions} icon={HiExclamationCircle} color="error" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Category Progress */}
        <div className="card bg-base-100 shadow-sm border border-base-300">
          <div className="card-body p-6">
            <h2 className="card-title text-lg mb-4">Submission Progress</h2>
            <div className="space-y-4">
              {data.progress?.map((cat, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{cat.category}</span>
                    <span className="text-base-content/60">{cat.verified}/{cat.total} ({cat.percentage}%)</span>
                  </div>
                  <progress
                    className={`progress w-full ${
                      cat.percentage === 100 ? 'progress-success' :
                      cat.percentage > 0 ? 'progress-warning' : ''
                    }`}
                    value={cat.percentage}
                    max="100"
                  ></progress>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link to="/barangay/documents" className="btn btn-primary btn-sm gap-1">
                View All Documents <HiArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="card bg-base-100 shadow-sm border border-base-300">
          <div className="card-body p-6">
            <h2 className="card-title text-lg mb-4">Recent Submissions</h2>
            {data.recent_submissions?.length > 0 ? (
              <div className="space-y-3">
                {data.recent_submissions.map(sub => (
                  <div key={sub.id} className="flex items-center justify-between p-3 bg-base-200 rounded-lg">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{sub.original_filename}</p>
                      <p className="text-sm text-base-content/50">{sub.required_document?.name}</p>
                    </div>
                    <StatusBadge status={sub.status} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-base-content/50 text-center py-8">No submissions yet</p>
            )}
            <div className="mt-4">
              <Link to="/barangay/submissions" className="btn btn-outline btn-sm gap-1">
                View All <HiArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Announcements */}
      {data.announcements?.length > 0 && (
        <div className="card bg-base-100 shadow-sm border border-base-300">
          <div className="card-body p-6">
            <h2 className="card-title text-lg mb-4">
              <HiSpeakerphone className="w-5 h-5" /> Announcements
            </h2>
            <div className="space-y-3">
              {data.announcements.map(a => (
                <div key={a.id} className={`p-4 rounded-lg border-l-4 ${
                  a.priority === 'urgent' ? 'border-error bg-error/5' :
                  a.priority === 'high' ? 'border-warning bg-warning/5' :
                  'border-info bg-info/5'
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold">{a.title}</h3>
                    {a.is_pinned && <span className="badge badge-sm badge-primary">Pinned</span>}
                  </div>
                  <p className="text-sm text-base-content/70 mt-1">{a.content}</p>
                  <p className="text-xs text-base-content/40 mt-2">
                    {format(new Date(a.created_at), 'MMM d, yyyy')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Deadlines */}
      {data.upcoming_deadlines?.length > 0 && (
        <div className="card bg-base-100 shadow-sm border border-base-300">
          <div className="card-body p-6">
            <h2 className="card-title text-lg mb-4">
              <HiCalendar className="w-5 h-5" /> Upcoming Deadlines
            </h2>
            <div className="space-y-2">
              {data.upcoming_deadlines.map(d => (
                <div key={d.id} className="flex items-center justify-between p-3 bg-base-200 rounded-lg">
                  <div>
                    <p className="font-medium">{d.name}</p>
                    <p className="text-sm text-base-content/50">{d.category?.name}</p>
                  </div>
                  <span className="text-sm font-semibold text-error">
                    {format(new Date(d.deadline), 'MMM d, yyyy')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="skeleton h-8 w-64"></div>
      <div className="skeleton h-24 w-full"></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="skeleton h-28"></div>)}
      </div>
    </div>
  )
}
