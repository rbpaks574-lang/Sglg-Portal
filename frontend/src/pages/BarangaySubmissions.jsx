import { useState, useEffect } from 'react'
import { submissionAPI } from '../services/api'
import StatusBadge from '../components/common/StatusBadge'
import EmptyState from '../components/common/EmptyState'
import DocumentPreviewModal from '../components/common/DocumentPreviewModal'
import DocumentViewer from '../components/common/DocumentViewer'
import { format } from 'date-fns'
import { HiDocumentText, HiDownload, HiEye, HiChat, HiX, HiInformationCircle } from 'react-icons/hi'
import toast from 'react-hot-toast'

export default function BarangaySubmissions() {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [previewDoc, setPreviewDoc] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const params = filter !== 'all' ? { status: filter } : {}
    submissionAPI.list(params)
      .then(res => setSubmissions(res.data.data || res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [filter])

  const handleDownload = async (id, filename) => {
    try {
      const res = await submissionAPI.download(id)
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
      toast.error('Failed to download document')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">My Document Submissions</h1>
          <p className="text-base-content/60 text-base">Track compliance status and review submitted files</p>
        </div>
        <div className="flex gap-2 bg-base-200 p-1.5 rounded-xl border border-base-300">
          {['all', 'pending', 'verified', 'returned'].map(f => (
            <button
              key={f}
              className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {submissions.length === 0 ? (
        <EmptyState
          icon={HiDocumentText}
          title="No submissions found"
          description="Submit your first document from the Documents page"
        />
      ) : (
        <div className="card bg-base-100 shadow-sm border border-base-300 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr className="bg-base-200/60 text-base font-semibold">
                  <th className="py-4">Document</th>
                  <th>Category</th>
                  <th>Submitted On</th>
                  <th>Status</th>
                  <th>Score</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map(sub => (
                  <tr key={sub.id} className="hover:bg-base-200/40">
                    <td>
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 bg-primary/10 text-primary rounded-xl mt-0.5">
                          <HiDocumentText className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-base text-base-content truncate max-w-xs md:max-w-md">
                            {sub.original_filename}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="badge badge-sm badge-outline uppercase font-mono text-xs">
                              {sub.file_type || 'FILE'}
                            </span>
                            <span className="text-xs text-base-content/60 font-medium">
                              • {sub.required_document?.name}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="text-sm font-medium">{sub.required_document?.category?.name}</td>
                    <td className="text-sm text-base-content/70">
                      {format(new Date(sub.created_at), 'MMM d, yyyy')}
                    </td>
                    <td><StatusBadge status={sub.status} /></td>
                    <td className="text-base font-bold">
                      {sub.score !== null && sub.score !== undefined ? (
                        <span className="badge badge-success text-white font-bold">{sub.score} / 100</span>
                      ) : (
                        <span className="text-base-content/40">—</span>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          className="btn btn-primary btn-sm gap-1 font-semibold"
                          onClick={() => setSelected(sub)}
                          title="View Details and Preview File"
                        >
                          <HiEye className="w-4 h-4" /> View File
                        </button>
                        <button
                          className="btn btn-ghost btn-sm btn-square border border-base-300"
                          onClick={() => handleDownload(sub.id, sub.original_filename)}
                          title="Download"
                        >
                          <HiDownload className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Standalone Preview Modal */}
      {previewDoc && (
        <DocumentPreviewModal
          submission={previewDoc}
          onClose={() => setPreviewDoc(null)}
        />
      )}

      {/* Detail & File Preview Modal */}
      {selected && (
        <dialog className="modal modal-open z-50">
          <div className="modal-box w-11/12 max-w-6xl h-[90vh] p-0 flex flex-col overflow-hidden bg-base-100 shadow-2xl rounded-2xl border border-base-300">
            <div className="flex items-center justify-between px-6 py-4 border-b border-base-300 bg-base-100">
              <div>
                <h3 className="font-bold text-xl flex items-center gap-2">
                  <span>Submission: {selected.original_filename}</span>
                  <StatusBadge status={selected.status} />
                </h3>
                <p className="text-sm text-base-content/60">
                  {selected.required_document?.name} • {selected.required_document?.category?.name}
                </p>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm btn-circle"
                onClick={() => setSelected(null)}
              >
                <HiX className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0 bg-base-200/50">
              {/* Left Side: Document Viewer */}
              <div className="lg:w-3/5 h-full p-4 flex flex-col min-h-0">
                <DocumentViewer submission={selected} className="h-full shadow-md" />
              </div>

              {/* Right Side: Details and Remarks */}
              <div className="lg:w-2/5 h-full border-t lg:border-t-0 lg:border-l border-base-300 bg-base-100 p-6 flex flex-col min-h-0 overflow-y-auto space-y-4">
                <div className="p-4 bg-base-200/70 rounded-xl border border-base-300 space-y-3">
                  <h4 className="font-bold text-sm uppercase tracking-wider text-base-content/70 flex items-center gap-1.5">
                    <HiInformationCircle className="w-4 h-4 text-info" /> Submission Information
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-xs text-base-content/50 block">Submitted On</span>
                      <span className="font-medium">{format(new Date(selected.created_at), 'MMM d, yyyy h:mm a')}</span>
                    </div>
                    <div>
                      <span className="text-xs text-base-content/50 block">Score</span>
                      <span className="font-bold text-base">{selected.score ?? 'Pending review'}</span>
                    </div>
                  </div>

                  {selected.submitter_notes && (
                    <div className="pt-2 border-t border-base-300">
                      <span className="text-xs text-base-content/50 block mb-1">Your Submission Notes:</span>
                      <p className="bg-base-100 p-2.5 rounded-lg text-sm italic border border-base-300/50">
                        {selected.submitter_notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Remarks & Feedback */}
                {selected.remarks?.length > 0 ? (
                  <div className="space-y-2">
                    <h4 className="font-bold text-sm text-base-content/70 flex items-center gap-1.5">
                      <HiChat className="w-4 h-4 text-primary" /> Feedback from DILG Checker
                    </h4>
                    <div className="space-y-2">
                      {selected.remarks.map(r => (
                        <div
                          key={r.id}
                          className={`p-3.5 rounded-xl text-sm border ${
                            r.type === 'correction'
                              ? 'bg-error/10 border-error/30 text-error-content'
                              : 'bg-success/10 border-success/30 text-success-content'
                          }`}
                        >
                          <div className="flex justify-between items-center text-xs mb-1 opacity-75">
                            <span className="font-bold">{r.user?.name || 'Checker'}</span>
                            <span>{format(new Date(r.created_at), 'MMM d, yyyy h:mm a')}</span>
                          </div>
                          <p className="font-medium">{r.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-base-200/50 rounded-xl text-center text-sm text-base-content/60">
                    No feedback comments added yet.
                  </div>
                )}

                <div className="pt-4 mt-auto">
                  <button
                    type="button"
                    className="btn btn-outline w-full gap-2"
                    onClick={() => handleDownload(selected.id, selected.original_filename)}
                  >
                    <HiDownload className="w-5 h-5" /> Download File
                  </button>
                </div>
              </div>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop bg-black/60 backdrop-blur-xs">
            <button onClick={() => setSelected(null)}>close</button>
          </form>
        </dialog>
      )}
    </div>
  )
}
