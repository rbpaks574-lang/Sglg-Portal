import { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import { HiX, HiOfficeBuilding, HiMail, HiPhone, HiUser, HiCheckCircle, HiClock, HiXCircle } from 'react-icons/hi'

export default function BarangayStatusModal({ barangayId, onClose }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (barangayId) {
      loadBarangayData()
    }
  }, [barangayId])

  const loadBarangayData = async () => {
    setLoading(true)
    try {
      const res = await adminAPI.barangayDetails(barangayId)
      setData(res.data)
    } catch (error) {
      console.error('Failed to load barangay details', error)
    } finally {
      setLoading(false)
    }
  }

  if (!barangayId) return null

  return (
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-5xl max-h-[90vh] p-0 flex flex-col bg-base-200">
        
        {/* Header */}
        <div className="bg-primary text-primary-content p-6 flex justify-between items-start shrink-0">
          <div className="flex gap-4 items-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <HiOfficeBuilding className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {loading ? 'Loading...' : data?.barangay?.name}
              </h2>
              <p className="opacity-80 mt-1">Barangay Compliance Profile</p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-circle btn-sm text-primary-content">
            <HiX className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex justify-center py-20">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : data && (
            <>
              {/* Quick Info & Stats */}
              <div className="grid lg:grid-cols-3 gap-6">
                
                {/* Contact Info */}
                <div className="card bg-base-100 shadow-sm border border-base-300">
                  <div className="card-body p-5">
                    <h3 className="font-bold border-b border-base-200 pb-2 mb-3">Contact Information</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-3">
                        <HiUser className="w-5 h-5 text-base-content/50" />
                        <div>
                          <p className="text-xs text-base-content/50">Captain</p>
                          <p className="font-medium">{data.barangay.captain_name || 'Not specified'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <HiUser className="w-5 h-5 text-base-content/50" />
                        <div>
                          <p className="text-xs text-base-content/50">Secretary</p>
                          <p className="font-medium">{data.barangay.secretary_name || 'Not specified'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <HiPhone className="w-5 h-5 text-base-content/50" />
                        <div>
                          <p className="text-xs text-base-content/50">Contact Number</p>
                          <p className="font-medium">{data.barangay.contact_number || 'Not specified'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <HiMail className="w-5 h-5 text-base-content/50" />
                        <div>
                          <p className="text-xs text-base-content/50">Email</p>
                          <p className="font-medium">{data.barangay.email || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Score & Submissions */}
                <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
                  <div className="card bg-base-100 shadow-sm border border-base-300">
                    <div className="card-body p-5 justify-center items-center text-center">
                      <p className="text-sm text-base-content/60 font-medium">SGLG Compliance Score</p>
                      <div className="radial-progress text-primary my-4" 
                           style={{ "--value": data.barangay.compliance_score || 0, "--size": "6rem", "--thickness": "8px" }}>
                        <span className="text-2xl font-bold">{Math.round(data.barangay.compliance_score || 0)}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="card bg-base-100 shadow-sm border border-base-300">
                    <div className="card-body p-5 space-y-4">
                      <h3 className="font-bold text-sm">Submission Status</h3>
                      
                      <div className="flex justify-between items-center text-sm">
                        <span className="flex items-center gap-2"><HiCheckCircle className="text-success" /> Verified</span>
                        <span className="font-bold">{data.stats.verified} / {data.stats.total_required}</span>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm">
                        <span className="flex items-center gap-2"><HiClock className="text-warning" /> Pending Review</span>
                        <span className="font-bold">{data.stats.pending}</span>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm">
                        <span className="flex items-center gap-2"><HiXCircle className="text-error" /> Returned</span>
                        <span className="font-bold">{data.stats.returned}</span>
                      </div>
                      
                      <progress className="progress progress-success w-full mt-2" 
                                value={data.stats.verified} 
                                max={data.stats.total_required}></progress>
                    </div>
                  </div>
                </div>
              </div>

              {/* Categories Compliance Breakdown */}
              <h3 className="font-bold text-lg pt-4">Checklist & Requirements Status</h3>
              
              <div className="grid sm:grid-cols-2 gap-4">
                {data.compliance.map(cat => (
                  <div key={cat.category} className="card bg-base-100 shadow-sm border border-base-300">
                    <div className="card-body p-5">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold">{cat.category}</h4>
                        <span className="badge badge-primary">{cat.percentage}%</span>
                      </div>
                      <progress className="progress progress-primary w-full" value={cat.percentage} max="100"></progress>
                      
                      <div className="mt-4 space-y-2">
                        {cat.documents.map(doc => {
                           let badgeClass = 'badge-ghost'
                           let label = 'Missing'
                           
                           if (doc.status === 'verified') { badgeClass = 'badge-success'; label = 'Verified' }
                           else if (doc.status === 'pending') { badgeClass = 'badge-warning'; label = 'Pending' }
                           else if (doc.status === 'returned') { badgeClass = 'badge-error'; label = 'Returned' }
                           
                           return (
                             <div key={doc.id} className="flex justify-between items-center text-xs py-1 border-b border-base-200 last:border-0">
                               <span className="truncate pr-2 flex-1" title={doc.name}>{doc.name}</span>
                               <span className={`badge badge-xs p-2 ${badgeClass}`}>{label}</span>
                             </div>
                           )
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </>
          )}
        </div>
      </div>
      
      {/* Click outside to close (Optional) */}
      <div className="modal-backdrop" onClick={onClose}>
        <button className="cursor-default">close</button>
      </div>
    </div>
  )
}
