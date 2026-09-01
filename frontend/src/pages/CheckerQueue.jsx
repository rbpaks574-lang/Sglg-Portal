import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { checkerAPI, submissionAPI, sharedAPI } from '../services/api'
import StatusBadge from '../components/common/StatusBadge'
import EmptyState from '../components/common/EmptyState'
import DocumentViewer from '../components/common/DocumentViewer'
import DocumentPreviewModal from '../components/common/DocumentPreviewModal'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import {
  HiDocumentText,
  HiDownload,
  HiCheckCircle,
  HiReply,
  HiEye,
  HiChat,
  HiInformationCircle,
  HiX,
  HiClipboardList
} from 'react-icons/hi'

export default function CheckerQueue() {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [previewOnlyDoc, setPreviewOnlyDoc] = useState(null)
  const [activeTab, setActiveTab] = useState('review') // 'review' or 'document' (mobile view toggle)
  const [action, setAction] = useState(null) // 'approve' or 'return'
  const [remark, setRemark] = useState('')
  const [score, setScore] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [searchParams] = useSearchParams()
  const [filter, setFilter] = useState(searchParams.get('status') || 'pending')
  const [sortBy, setSortBy] = useState('date-desc')
  const [search, setSearch] = useState('')
  const [barangays, setBarangays] = useState([])
  const [selectedBarangay, setSelectedBarangay] = useState('')

  const quickCorrectionReasons = [
    'Missing Barangay Captain Signature',
    'Missing Barangay Resolution Number',
    'Incomplete Supporting Attachments',
    'Scanned copy is blurred or unreadable',
    'Date is expired or mismatched',
  ]

  const loadSubmissions = () => {
    setLoading(true)
    const params = filter !== 'all' ? { status: filter } : {}
    if (search.trim()) params.search = search.trim()
    if (selectedBarangay) params.barangay_id = selectedBarangay
    
    if (sortBy === 'barangay-asc') {
      params.sort_by = 'barangay'
      params.sort_dir = 'asc'
    } else if (sortBy === 'barangay-desc') {
      params.sort_by = 'barangay'
      params.sort_dir = 'desc'
    } else if (sortBy === 'date-asc') {
      params.sort_by = 'date'
      params.sort_dir = 'asc'
    } else {
      params.sort_by = 'date'
      params.sort_dir = 'desc'
    }

    submissionAPI.list(params)
      .then(res => setSubmissions(res.data.data || res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    // Fetch barangays for filter dropdown
    sharedAPI.barangays().then(res => setBarangays(res.data)).catch(console.error)
  }, [])

  useEffect(() => {
    const delay = setTimeout(() => {
      loadSubmissions()
    }, 500)
    return () => clearTimeout(delay)
  }, [filter, sortBy, search, selectedBarangay])

  const handleReview = async () => {
    if (!selected || !action) return
    setSubmitting(true)

    try {
      await checkerAPI.review(selected.id, {
        action,
        remark: remark || undefined,
        score: score ? parseInt(score) : undefined,
      })

      toast.success(`Submission ${action === 'approve' ? 'approved' : 'returned'} successfully!`)
      setSubmissions(prev => prev.filter(s => s.id !== selected.id))
      closeModal()
      loadSubmissions()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Review failed')
    } finally {
      setSubmitting(false)
    }
  }

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
      toast.error('Failed to download file')
    }
  }

  const openReviewModal = (sub) => {
    setSelected(sub)
    setAction(null)
    setRemark('')
    setScore(sub.score ?? (sub.is_late ? 2 : 5))
    setActiveTab('document') // Default to document view on mobile
  }

  const closeModal = () => {
    setSelected(null)
    setAction(null)
    setRemark('')
    setScore('')
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return ''
    const kb = bytes / 1024
    if (kb < 1024) return `${kb.toFixed(0)} KB`
    return `${(kb / 1024).toFixed(1)} MB`
  }

  if (loading && submissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="text-base-content/60 font-medium">Loading submissions...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Review & Validation Queue</h1>
          <p className="text-base-content/60 text-base">
            Inspect submitted forms, preview attached files, and validate SGLG compliance.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Search File..." 
            className="input input-sm input-bordered w-full sm:w-48 shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select 
            className="select select-sm select-bordered w-full sm:w-auto shadow-sm"
            value={selectedBarangay}
            onChange={(e) => setSelectedBarangay(e.target.value)}
          >
            <option value="">Barangay: All Barangays</option>
            {barangays.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          
          <select 
            className="select select-sm select-bordered w-full sm:w-auto shadow-sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date-desc">Sort: Newest First</option>
            <option value="date-asc">Sort: Oldest First</option>
            <option value="barangay-asc">Sort: Barangay (A-Z)</option>
            <option value="barangay-desc">Sort: Barangay (Z-A)</option>
          </select>

          <div className="flex gap-1 bg-base-200 p-1 rounded-xl border border-base-300 w-full sm:w-auto overflow-x-auto hide-scrollbar">
            {['pending', 'verified', 'returned', 'all'].map(f => (
              <button
                key={f}
                className={`btn btn-sm whitespace-nowrap flex-shrink-0 border-none ${
                  filter === f 
                    ? 'bg-base-100 text-base-content shadow-sm hover:bg-base-100 font-bold' 
                    : 'btn-ghost text-base-content/60 hover:bg-base-300/50 hover:text-base-content font-medium'
                }`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {submissions.length === 0 ? (
        <EmptyState
          icon={HiDocumentText}
          title="No submissions in this queue"
          description="All caught up! Select another filter or wait for new barangay submissions."
        />
      ) : (
        <div className="card bg-base-100 shadow-sm border border-base-300 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr className="bg-base-200/60 text-base font-semibold">
                  <th className="py-4">Submitted Form / File</th>
                  <th 
                    className="cursor-pointer hover:text-primary transition-colors"
                    onClick={() => setSortBy(sortBy === 'barangay-asc' ? 'barangay-desc' : 'barangay-asc')}
                    title="Click to sort by Barangay"
                  >
                    Barangay {sortBy === 'barangay-asc' ? '↑' : sortBy === 'barangay-desc' ? '↓' : '↕'}
                  </th>
                  <th>SGLG Category</th>
                  <th 
                    className="cursor-pointer hover:text-primary transition-colors"
                    onClick={() => setSortBy(sortBy === 'date-desc' ? 'date-asc' : 'date-desc')}
                    title="Click to sort by Date"
                  >
                    Submitted On {sortBy === 'date-asc' ? '↑' : sortBy === 'date-desc' ? '↓' : '↕'}
                  </th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map(sub => (
                  <tr key={sub.id} className="hover:bg-base-200/40 transition-colors">
                    <td>
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 bg-primary/10 text-primary rounded-xl mt-0.5">
                          <HiDocumentText className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-base text-base-content truncate max-w-xs md:max-w-md" title={sub.original_filename}>
                            {sub.original_filename}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="badge badge-sm badge-outline uppercase font-mono text-xs">
                              {sub.file_type || 'FILE'}
                            </span>
                            {sub.file_size > 0 && (
                              <span className="text-xs text-base-content/50">
                                {formatFileSize(sub.file_size)}
                              </span>
                            )}
                            <span className="text-xs text-base-content/60 font-medium">
                              • {sub.required_document?.name}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-primary badge-outline font-semibold text-sm px-3 py-3">
                        {sub.barangay?.name}
                      </span>
                    </td>
                    <td>
                      <span className="text-sm font-medium text-base-content/80">
                        {sub.required_document?.category?.name}
                      </span>
                    </td>
                    <td className="text-sm text-base-content/70">
                      {format(new Date(sub.created_at), 'MMM d, yyyy')}
                      <span className="block text-xs text-base-content/40">
                        {format(new Date(sub.created_at), 'h:mm a')}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={sub.status} />
                    </td>
                    <td>
                      <div className="flex items-center justify-center gap-2">
                        {/* Primary Review Button with Preview */}
                        <button
                          className="btn btn-primary btn-sm gap-1 shadow-sm font-semibold flex-nowrap whitespace-nowrap"
                          onClick={() => openReviewModal(sub)}
                          title="Open Form Review & Document Viewer"
                        >
                          <HiEye className="w-4 h-4 flex-shrink-0" />
                          <span className="hidden sm:inline">Review & View File</span>
                          <span className="sm:hidden">Review</span>
                        </button>

                        {/* Quick Download */}
                        <button
                          className="btn btn-ghost btn-sm btn-square border border-base-300 hover:bg-base-200"
                          onClick={() => handleDownload(sub.id, sub.original_filename)}
                          title="Download Original File"
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

      {/* Standalone Quick Preview Modal */}
      {previewOnlyDoc && (
        <DocumentPreviewModal
          submission={previewOnlyDoc}
          onClose={() => setPreviewOnlyDoc(null)}
        />
      )}

      {/* Full Interactive Review & Form Viewer Modal */}
      {selected && (
        <dialog className="modal modal-open z-50">
          <div className="modal-box w-11/12 max-w-7xl h-[92vh] p-0 flex flex-col overflow-hidden bg-base-100 shadow-2xl rounded-2xl border border-base-300">
            {/* Modal Top Header */}
            <div className="flex items-center justify-between px-6 py-3.5 border-b border-base-300 bg-base-100">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-primary text-primary-content rounded-xl">
                  <HiClipboardList className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-lg md:text-xl text-base-content truncate">
                      Review Submission: {selected.required_document?.name}
                    </h3>
                    <span className="badge badge-primary font-bold">
                      Barangay {selected.barangay?.name}
                    </span>
                    <StatusBadge status={selected.status} />
                  </div>
                  <p className="text-xs md:text-sm text-base-content/60 truncate">
                    Category: {selected.required_document?.category?.name} • Submitted on {format(new Date(selected.created_at), 'MMMM d, yyyy h:mm a')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Mobile View Switcher */}
                <div className="join lg:hidden border border-base-300 rounded-lg p-0.5">
                  <button
                    className={`join-item btn btn-xs ${activeTab === 'document' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setActiveTab('document')}
                  >
                    📄 View Form
                  </button>
                  <button
                    className={`join-item btn btn-xs ${activeTab === 'review' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setActiveTab('review')}
                  >
                    ✍️ Review
                  </button>
                </div>

                <button
                  type="button"
                  className="btn btn-ghost btn-sm btn-circle"
                  onClick={closeModal}
                  title="Close modal"
                >
                  <HiX className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Split Screen Modal Body */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0 bg-base-200/50">
              {/* LEFT PANEL: Document & Form Viewer (60% width on Desktop) */}
              <div className={`lg:w-3/5 h-full p-4 flex flex-col min-h-0 ${activeTab === 'document' ? 'flex' : 'hidden lg:flex'}`}>
                <div className="flex-1 min-h-0">
                  <DocumentViewer submission={selected} className="h-full shadow-md" />
                </div>
              </div>

              {/* RIGHT PANEL: Info, Requirements & Review Actions (40% width on Desktop) */}
              <div className={`lg:w-2/5 h-full border-t lg:border-t-0 lg:border-l border-base-300 bg-base-100 flex flex-col min-h-0 overflow-y-auto ${activeTab === 'review' ? 'flex' : 'hidden lg:flex'}`}>
                <div className="p-6 space-y-5 flex-1">
                  {/* Document & Submitter Meta Card */}
                  <div className="p-4 bg-base-200/70 rounded-xl border border-base-300 space-y-3">
                    <h4 className="font-bold text-sm uppercase tracking-wider text-base-content/70 flex items-center gap-1.5">
                      <HiInformationCircle className="w-4 h-4 text-info" /> Submission Details
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-xs text-base-content/50 block">Barangay</span>
                        <span className="font-semibold">{selected.barangay?.name}</span>
                      </div>
                      <div>
                        <span className="text-xs text-base-content/50 block">Original Filename</span>
                        <span className="font-semibold truncate block" title={selected.original_filename}>
                          {selected.original_filename}
                          {selected.is_late && <span className="badge badge-xs badge-error ml-2">Late</span>}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-base-content/50 block">Requirement</span>
                        <span className="font-semibold">{selected.required_document?.name}</span>
                      </div>
                      <div>
                        <span className="text-xs text-base-content/50 block">Category Type</span>
                        <span className="badge badge-sm badge-outline font-medium">
                          {selected.required_document?.category?.type || 'Core'}
                        </span>
                      </div>
                    </div>

                    {selected.submitter_notes && (
                      <div className="pt-2 border-t border-base-300/60">
                        <span className="text-xs text-base-content/50 block mb-1">Notes from Barangay Submitter:</span>
                        <p className="bg-base-100 p-2.5 rounded-lg text-sm italic text-base-content/80 border border-base-300/50">
                          "{selected.submitter_notes}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Previous Feedback & Remarks History */}
                  {selected.remarks?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-bold text-sm text-base-content/70 flex items-center gap-1.5">
                        <HiChat className="w-4 h-4 text-accent" /> Feedback & Revision History
                      </h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {selected.remarks.map(r => (
                          <div
                            key={r.id}
                            className={`p-3 rounded-xl text-sm border ${
                              r.type === 'correction'
                                ? 'bg-error/10 border-error/30 text-error-content'
                                : 'bg-success/10 border-success/30 text-success-content'
                            }`}
                          >
                            <div className="flex justify-between items-center text-xs mb-1 opacity-75">
                              <span className="font-bold">{r.user?.name || 'Reviewer'}</span>
                              <span>{format(new Date(r.created_at), 'MMM d, h:mm a')}</span>
                            </div>
                            <p className="text-sm font-medium">{r.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="divider my-1"></div>

                  {/* Review Action Form */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-base text-base-content">
                      Review Decision
                    </h4>

                    {!action ? (
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          type="button"
                          className="btn btn-success flex-1 gap-2 text-white font-bold shadow-sm"
                          onClick={() => setAction('approve')}
                        >
                          <HiCheckCircle className="w-5 h-5" /> Approve Form
                        </button>
                        <button
                          type="button"
                          className="btn btn-error flex-1 gap-2 text-white font-bold shadow-sm"
                          onClick={() => setAction('return')}
                        >
                          <HiReply className="w-5 h-5" /> Return for Correction
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4 animate-fade-in">
                        <div className={`alert ${action === 'approve' ? 'alert-success text-white' : 'alert-error text-white'} py-2.5 px-4 shadow-sm`}>
                          <span className="text-sm font-bold">
                            {action === 'approve'
                              ? '✓ You are verifying and approving this compliance form.'
                              : '⚠ You are returning this form to the barangay for correction.'}
                          </span>
                        </div>

                        {action === 'approve' && (
                          <div className="form-control">
                            <label className="label py-1">
                              <span className="label-text font-bold text-sm">Compliance Score (Auto-assigned: {selected.is_late ? '2pts (Late)' : '5pts'})</span>
                            </label>
                            <input
                              type="number"
                              className="input input-bordered w-full"
                              placeholder="e.g. 100"
                              min="0"
                              max="100"
                              value={score}
                              onChange={(e) => setScore(e.target.value)}
                            />
                          </div>
                        )}

                        <div className="form-control">
                          <label className="label py-1 flex justify-between">
                            <span className="label-text font-bold text-sm">
                              {action === 'approve' ? 'Checker Remarks (optional)' : 'Correction Remarks (required)'}
                            </span>
                            {action === 'return' && (
                              <span className="badge badge-error badge-sm text-white font-semibold">Required</span>
                            )}
                          </label>

                          {/* Quick suggestions for return action */}
                          {action === 'return' && (
                            <div className="mb-2">
                              <span className="text-xs text-base-content/60 block mb-1.5 font-medium">
                                Quick Reason Presets:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {quickCorrectionReasons.map((reason, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    className="btn btn-xs btn-outline hover:btn-error text-xs"
                                    onClick={() => {
                                      setRemark(prev => prev ? `${prev}. ${reason}` : reason)
                                    }}
                                  >
                                    + {reason}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          <textarea
                            className="textarea textarea-bordered h-28 text-sm focus:textarea-primary"
                            placeholder={action === 'approve'
                              ? 'Add any comments or observations...'
                              : 'Specify the exact errors or missing items that the barangay must correct...'}
                            value={remark}
                            onChange={(e) => setRemark(e.target.value)}
                            required={action === 'return'}
                          ></textarea>
                        </div>

                        <div className="flex gap-3 pt-2">
                          <button
                            type="button"
                            className="btn btn-ghost border border-base-300 flex-1"
                            onClick={() => { setAction(null); setRemark(''); setScore('') }}
                          >
                            Back
                          </button>
                          <button
                            type="button"
                            className={`btn flex-1 text-white font-bold ${action === 'approve' ? 'btn-success' : 'btn-error'} ${submitting ? 'loading' : ''}`}
                            onClick={handleReview}
                            disabled={submitting || (action === 'return' && !remark.trim())}
                          >
                            {submitting
                              ? 'Saving...'
                              : (action === 'approve' ? 'Confirm Approval' : 'Submit Return Request')}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-4 bg-base-200/60 border-t border-base-300 flex items-center justify-between">
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={closeModal}
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline btn-sm gap-1"
                    onClick={() => handleDownload(selected.id, selected.original_filename)}
                  >
                    <HiDownload className="w-4 h-4" /> Download Original
                  </button>
                </div>
              </div>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop bg-black/60 backdrop-blur-xs">
            <button onClick={closeModal}>close</button>
          </form>
        </dialog>
      )}
    </div>
  )
}
