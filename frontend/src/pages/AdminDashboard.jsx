import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminAPI } from '../services/api'
import StatCard from '../components/common/StatCard'
import StatusBadge from '../components/common/StatusBadge'
import BarangayStatusModal from '../components/admin/BarangayStatusModal'
import { format } from 'date-fns'
import {
  HiOfficeBuilding, HiDocumentText, HiClock, HiCheckCircle,
  HiExclamationCircle, HiUsers, HiTrendingUp
} from 'react-icons/hi'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#22c55e', '#f59e0b', '#ef4444', '#6b7280']

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedBarangayId, setSelectedBarangayId] = useState(null)

  useEffect(() => {
    adminAPI.dashboard()
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg"></span></div>
  if (!data) return null

  const pieData = [
    { name: 'Verified', value: data.verified_submissions },
    { name: 'Pending', value: data.pending_submissions },
    { name: 'Returned', value: data.returned_submissions },
  ].filter(d => d.value > 0)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-base-content/60">Overview of SGLG compliance across all 64 barangays</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <a href="/admin/requirements" className="btn btn-primary btn-sm gap-1.5 shadow-sm font-semibold">
            <HiDocumentText className="w-4 h-4" /> Manage Requirements
          </a>
          <a href="/admin/announcements" className="btn btn-outline btn-sm gap-1.5 shadow-sm font-semibold">
            Post Announcement
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard 
          title="Total Barangays" 
          value={data.total_barangays} 
          icon={HiOfficeBuilding} 
          color="primary" 
          onClick={() => navigate('/admin/barangays')} 
        />
        <StatCard 
          title="Total Submissions" 
          value={data.total_submissions} 
          icon={HiDocumentText} 
          color="accent" 
          onClick={() => navigate('/admin/analytics')}
        />
        <StatCard 
          title="Pending Review" 
          value={data.pending_submissions} 
          icon={HiClock} 
          color="warning" 
          onClick={() => navigate('/admin/analytics')}
        />
        <StatCard 
          title="Late Submissions" 
          value={data.late_submissions} 
          icon={HiExclamationCircle} 
          color="error" 
          onClick={() => navigate('/admin/analytics')}
        />
        <StatCard 
          title="Avg. Compliance" 
          value={`${data.average_compliance_score}%`} 
          icon={HiTrendingUp} 
          color="success" 
          onClick={() => navigate('/admin/analytics')}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Status Distribution Chart */}
        <div className="card bg-base-100 shadow-sm border border-base-300">
          <div className="card-body p-6">
            <h2 className="card-title text-lg mb-4">Submission Status</h2>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-base-content/50 text-center py-12">No data yet</p>
            )}
          </div>
        </div>

        {/* Top Barangays */}
        <div className="card bg-base-100 shadow-sm border border-base-300">
          <div className="card-body p-6">
            <h2 className="card-title text-lg mb-4">Top Compliant Barangays</h2>
            {data.top_barangays?.length > 0 ? (
              <div className="space-y-3">
                {data.top_barangays.map((b, i) => (
                  <div 
                    key={b.id} 
                    className="flex items-center gap-3 cursor-pointer hover:bg-base-200 p-2 rounded-lg transition-colors"
                    onClick={() => setSelectedBarangayId(b.id)}
                  >
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      i < 3 ? 'bg-primary text-primary-content' : 'bg-base-300 text-base-content'
                    }`}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate hover:text-primary transition-colors">{b.name}</p>
                    </div>
                    <div className="w-24">
                      <progress
                        className={`progress ${
                          b.compliance_score >= 80 ? 'progress-success' :
                          b.compliance_score >= 50 ? 'progress-warning' : 'progress-error'
                        }`}
                        value={b.compliance_score}
                        max="100"
                      ></progress>
                    </div>
                    <span className="text-sm font-bold w-12 text-right">{b.compliance_score}%</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-base-content/50 text-center py-8">No data yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Barangays */}
      {data.bottom_barangays?.length > 0 && (
        <div className="card bg-base-100 shadow-sm border border-base-300">
          <div className="card-body p-6">
            <h2 className="card-title text-lg mb-4">
              <HiExclamationCircle className="w-5 h-5 text-error" /> Barangays Needing Attention
            </h2>
            <div className="grid md:grid-cols-2 gap-3">
              {data.bottom_barangays.map(b => (
                <div 
                  key={b.id} 
                  className="flex items-center justify-between p-3 bg-error/5 rounded-lg border border-error/20 cursor-pointer hover:bg-error/10 transition-colors"
                  onClick={() => setSelectedBarangayId(b.id)}
                >
                  <p className="font-medium hover:text-error transition-colors">{b.name}</p>
                  <span className="text-sm font-bold text-error">{b.compliance_score}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Submissions */}
      <div className="card bg-base-100 shadow-sm border border-base-300">
        <div className="card-body p-6">
          <h2 className="card-title text-lg mb-4">Recent Submissions</h2>
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Barangay</th>
                  <th>Category</th>
                  <th>Submitted</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_submissions?.map(sub => (
                  <tr key={sub.id}>
                    <td className="font-medium">
                      {sub.original_filename}
                      {sub.is_late && <span className="badge badge-xs badge-error ml-2">Late</span>}
                    </td>
                    <td>{sub.barangay?.name}</td>
                    <td className="text-sm">{sub.required_document?.category?.name}</td>
                    <td className="text-sm">{format(new Date(sub.created_at), 'MMM d, yyyy')}</td>
                    <td><StatusBadge status={sub.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedBarangayId && (
        <BarangayStatusModal
          barangayId={selectedBarangayId}
          onClose={() => setSelectedBarangayId(null)}
        />
      )}
    </div>
  )
}
