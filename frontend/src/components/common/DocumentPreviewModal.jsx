import { HiX, HiArrowsExpand } from 'react-icons/hi'
import DocumentViewer from './DocumentViewer'

export default function DocumentPreviewModal({ submission, onClose }) {
  if (!submission) return null

  return (
    <dialog className="modal modal-open z-50">
      <div className="modal-box w-11/12 max-w-6xl h-[90vh] p-0 flex flex-col overflow-hidden bg-base-100 shadow-2xl rounded-2xl border border-base-300">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-base-300 bg-base-100">
          <div>
            <h3 className="font-bold text-xl flex items-center gap-2">
              <span>Document Preview</span>
              <span className="badge badge-primary text-xs">
                {submission.barangay?.name || 'Barangay Document'}
              </span>
              {submission.is_late && <span className="badge badge-error text-xs">Late</span>}
            </h3>
            <p className="text-sm text-base-content/60">
              {submission.required_document?.name} — {submission.required_document?.category?.name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn btn-ghost btn-sm btn-circle"
              onClick={onClose}
              title="Close modal"
            >
              <HiX className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Modal Body with DocumentViewer */}
        <div className="flex-1 p-4 overflow-hidden min-h-0 bg-base-200/50">
          <DocumentViewer submission={submission} className="h-full shadow-sm" />
        </div>
      </div>
      <form method="dialog" className="modal-backdrop bg-black/60 backdrop-blur-xs">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  )
}
