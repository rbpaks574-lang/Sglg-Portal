import { useState, useEffect, useRef } from 'react'
import { barangayAPI } from '../services/api'
import StatusBadge from '../components/common/StatusBadge'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import {
  HiUpload, HiDocumentText, HiExclamationCircle, HiCheckCircle, HiClock
} from 'react-icons/hi'

export default function BarangayDocuments() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(null)
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [notes, setNotes] = useState('')
  const fileRef = useRef()

  useEffect(() => {
    barangayAPI.requiredDocuments()
      .then(res => setCategories(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async () => {
    const file = fileRef.current?.files[0]
    if (!file || !selectedDoc) return

    setUploading(selectedDoc.id)
    const formData = new FormData()
    formData.append('required_document_id', selectedDoc.id)
    formData.append('file', file)
    if (notes) formData.append('submitter_notes', notes)

    try {
      await barangayAPI.submit(formData)
      toast.success('Document submitted successfully!')
      // Refresh
      const res = await barangayAPI.requiredDocuments()
      setCategories(res.data)
      setSelectedDoc(null)
      setNotes('')
      if (fileRef.current) fileRef.current.value = ''
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(null)
    }
  }

  const handleResubmit = async (submissionId) => {
    const file = fileRef.current?.files[0]
    if (!file) return

    setUploading(submissionId)
    const formData = new FormData()
    formData.append('file', file)
    if (notes) formData.append('submitter_notes', notes)

    try {
      await barangayAPI.resubmit(submissionId, formData)
      toast.success('Document resubmitted successfully!')
      const res = await barangayAPI.requiredDocuments()
      setCategories(res.data)
      setSelectedDoc(null)
      setNotes('')
      if (fileRef.current) fileRef.current.value = ''
    } catch (err) {
      toast.error(err.response?.data?.message || 'Resubmit failed')
    } finally {
      setUploading(null)
    }
  }

  if (loading) return <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg"></span></div>

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Required Documents</h1>
        <p className="text-base-content/60">Submit your compliance documents for each SGLG category</p>
      </div>

      {categories.map(cat => (
        <div key={cat.category_id} className="card bg-base-100 shadow-sm border border-base-300">
          <div className="card-body p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-3 h-3 rounded-full ${cat.type === 'core' ? 'bg-primary' : 'bg-accent'}`}></div>
              <h2 className="card-title text-lg">{cat.category}</h2>
              <span className={`badge badge-sm ${cat.type === 'core' ? 'badge-primary' : 'badge-accent'}`}>
                {cat.type}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th className="text-base">Document</th>
                    <th className="text-base">Frequency</th>
                    <th className="text-base">Deadline</th>
                    <th className="text-base">Status</th>
                    <th className="text-base">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cat.documents?.map(doc => (
                    <tr key={doc.id}>
                      <td>
                        <div>
                          <p className="font-medium text-base">{doc.name}</p>
                          {doc.description && (
                            <p className="text-sm text-base-content/50">{doc.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="text-sm capitalize">{doc.frequency}</td>
                      <td className="text-sm">
                        {doc.deadline ? format(new Date(doc.deadline), 'MMM d, yyyy') : '—'}
                      </td>
                      <td><StatusBadge status={doc.status} /></td>
                      <td>
                        {doc.status === 'not_submitted' || doc.status === 'returned' ? (
                          <button
                            className="btn btn-primary btn-sm gap-1"
                            onClick={() => setSelectedDoc(doc)}
                          >
                            <HiUpload className="w-4 h-4" />
                            {doc.status === 'returned' ? 'Resubmit' : 'Submit'}
                          </button>
                        ) : doc.status === 'verified' ? (
                          <span className="text-success flex items-center gap-1 text-sm">
                            <HiCheckCircle className="w-4 h-4" /> Complete
                          </span>
                        ) : (
                          <span className="text-base-content/50 flex items-center gap-1 text-sm">
                            <HiClock className="w-4 h-4" /> Waiting
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ))}

      {/* Upload Modal */}
      {selectedDoc && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-lg">
            <h3 className="font-bold text-xl mb-2">
              {selectedDoc.status === 'returned' ? 'Resubmit' : 'Submit'} Document
            </h3>
            <p className="text-base-content/60 mb-4">{selectedDoc.name}</p>

            {selectedDoc.status === 'returned' && selectedDoc.latest_submission && (
              <div className="alert alert-error mb-4">
                <HiExclamationCircle className="w-5 h-5" />
                <div>
                  <p className="font-semibold">This document was returned</p>
                  <p className="text-sm">Please review the feedback and upload a corrected file.</p>
                </div>
              </div>
            )}

            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text font-medium">Select File</span>
              </label>
              <input
                ref={fileRef}
                type="file"
                className="file-input file-input-bordered w-full"
                accept=".pdf,.docx,.xlsx,.jpg,.png"
              />
              <label className="label">
                <span className="label-text-alt text-base-content/50">
                  Accepted: PDF, DOCX, XLSX, JPG, PNG (Max 10MB)
                </span>
              </label>
            </div>

            <div className="form-control mb-6">
              <label className="label">
                <span className="label-text font-medium">Notes (optional)</span>
              </label>
              <textarea
                className="textarea textarea-bordered h-24"
                placeholder="Add any notes about this submission..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>
            </div>

            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setSelectedDoc(null)}>Cancel</button>
              <button
                className={`btn btn-primary ${uploading ? 'loading' : ''}`}
                onClick={() => selectedDoc.status === 'returned' && selectedDoc.latest_submission
                  ? handleResubmit(selectedDoc.latest_submission.id)
                  : handleSubmit()
                }
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Submit'}
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setSelectedDoc(null)}>close</button>
          </form>
        </dialog>
      )}
    </div>
  )
}
