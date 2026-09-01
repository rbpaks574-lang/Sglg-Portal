import { useState, useEffect } from 'react'
import { adminAPI } from '../services/api'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts'
import { HiTrendingUp, HiChartBar, HiOfficeBuilding } from 'react-icons/hi'
import BarangayStatusModal from '../components/admin/BarangayStatusModal'

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function AdminAnalytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedBarangayId, setSelectedBarangayId] = useState(null)

  useEffect(() => {
    adminAPI.analytics()
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg"></span></div>
  if (!data) return null

  const distData = [
    { name: 'Excellent (80-100%)', value: data.distribution?.excellent || 0, color: '#22c55e' },
    { name: 'Good (60-79%)', value: data.distribution?.good || 0, color: '#3b82f6' },
    { name: 'Fair (40-59%)', value: data.distribution?.fair || 0, color: '#f59e0b' },
    { name: 'Poor (<40%)', value: data.distribution?.poor || 0, color: '#ef4444' },
  ].filter(d => d.value > 0)

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Compliance Analytics</h1>
        <p className="text-base-content/60">Visual insights into barangay performance and compliance</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Compliance Distribution */}
        <div className="card bg-base-100 shadow-sm border border-base-300">
          <div className="card-body p-6">
            <h2 className="card-title text-lg mb-4">
              <HiChartBar className="w-5 h-5" /> Compliance Distribution
            </h2>
            {distData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={distData} cx="50%" cy="50%" outerRadius={100} dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}>
                    {distData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-base-content/50 py-12">No data available</p>
            )}
          </div>
        </div>

        {/* Category Completion */}
        <div className="card bg-base-100 shadow-sm border border-base-300">
          <div className="card-body p-6">
            <h2 className="card-title text-lg mb-4">
              <HiTrendingUp className="w-5 h-5" /> Category Completion Rates
            </h2>
            {data.category_stats?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.category_stats} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis type="category" dataKey="category" width={140} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => `${v}%`} />
                  <Bar dataKey="completion_rate" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-base-content/50 py-12">No data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Submission Trends */}
      {data.trends?.length > 0 && (
        <div className="card bg-base-100 shadow-sm border border-base-300">
          <div className="card-body p-6">
            <h2 className="card-title text-lg mb-4">Submission Trends (Last 30 Days)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Full Ranking Table */}
      <div className="card bg-base-100 shadow-sm border border-base-300">
        <div className="card-body p-6">
          <h2 className="card-title text-lg mb-4">
            <HiOfficeBuilding className="w-5 h-5" /> Full Compliance Ranking
          </h2>
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Barangay</th>
                  <th>Compliance Score</th>
                  <th>Progress</th>
                </tr>
              </thead>
              <tbody>
                {data.ranking?.map(b => (
                  <tr 
                    key={b.id} 
                    className="hover cursor-pointer transition-colors"
                    onClick={() => setSelectedBarangayId(b.id)}
                  >
                    <td>
                      <span className={`w-8 h-8 rounded-full inline-flex items-center justify-center text-sm font-bold ${
                        b.rank <= 3 ? 'bg-primary text-primary-content' : 'bg-base-200'
                      }`}>
                        {b.rank}
                      </span>
                    </td>
                    <td className="font-medium">{b.name}</td>
                    <td className="font-bold">{b.compliance_score}%</td>
                    <td className="w-40">
                      <progress
                        className={`progress w-full ${
                          b.compliance_score >= 80 ? 'progress-success' :
                          b.compliance_score >= 50 ? 'progress-warning' : 'progress-error'
                        }`}
                        value={b.compliance_score}
                        max="100"
                      ></progress>
                    </td>
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
