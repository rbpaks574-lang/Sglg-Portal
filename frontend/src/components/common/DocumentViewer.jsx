import { useState, useEffect } from 'react'
import { submissionAPI } from '../../services/api'
import {
  HiDownload,
  HiExternalLink,
  HiZoomIn,
  HiZoomOut,
  HiRefresh,
  HiDocumentText,
  HiExclamationCircle,
  HiEye
} from 'react-icons/hi'

export default function DocumentViewer({ submission, className = '' }) {
  const [blobUrl, setBlobUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    let active = true
    let currentUrl = null

    if (!submission?.id) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    setZoom(100)
    setRotation(0)

    submissionAPI.preview(submission.id)
      .then((res) => {
        if (!active) return
        const fileType = submission.file_type?.toLowerCase() || ''
        let mimeType = 'application/octet-stream'
        if (fileType === 'pdf') mimeType = 'application/pdf'
        else if (['jpg', 'jpeg'].includes(fileType)) mimeType = 'image/jpeg'
        else if (fileType === 'png') mimeType = 'image/png'
        else if (fileType === 'webp') mimeType = 'image/webp'
        else if (fileType === 'svg') mimeType = 'image/svg+xml'

        const blob = new Blob([res.data], { type: mimeType })
        currentUrl = window.URL.createObjectURL(blob)
        setBlobUrl(currentUrl)
      })
      .catch((err) => {
        if (!active) return
        console.error('Error loading preview:', err)
        setError(err.response?.data?.message || 'Unable to load file preview.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
      if (currentUrl) {
        window.URL.revokeObjectURL(currentUrl)
      }
    }
  }, [submission?.id, submission?.file_type])

  const handleDownload = async () => {
    try {
      const res = await submissionAPI.download(submission.id)
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = submission.original_filename || 'document'
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download failed:', err)
    }
  }

  const handleOpenNewTab = () => {
    if (blobUrl) {
      window.open(blobUrl, '_blank')
    }
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size'
    const kb = bytes / 1024
    if (kb < 1024) return `${kb.toFixed(1)} KB`
    return `${(kb / 1024).toFixed(2)} MB`
  }

  const fileType = (submission?.file_type || submission?.original_filename?.split('.').pop() || '').toLowerCase()
  const isPDF = fileType === 'pdf'
  const isImage = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(fileType)
  const isOfficeDoc = ['docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt'].includes(fileType)

  return (
    <div className={`flex flex-col h-full bg-base-200 rounded-xl overflow-hidden border border-base-300 ${className}`}>
      {/* Viewer Header Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-base-100 border-b border-base-300 text-sm">
        <div className="flex items-center gap-2 min-w-0 pr-2">
          <HiDocumentText className="w-5 h-5 text-primary flex-shrink-0" />
          <span className="font-semibold truncate text-base" title={submission?.original_filename}>
            {submission?.original_filename || 'Document Preview'}
          </span>
          <span className="badge badge-sm badge-outline uppercase font-mono text-xs">
            {fileType || 'FILE'}
          </span>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {isImage && (
            <div className="flex items-center gap-1 bg-base-200 rounded-lg p-1 mr-2 border border-base-300">
              <button
                type="button"
                className="btn btn-ghost btn-xs btn-square"
                onClick={() => setZoom((z) => Math.max(30, z - 20))}
                title="Zoom Out"
              >
                <HiZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono px-1 font-medium">{zoom}%</span>
              <button
                type="button"
                className="btn btn-ghost btn-xs btn-square"
                onClick={() => setZoom((z) => Math.min(300, z + 20))}
                title="Zoom In"
              >
                <HiZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-xs btn-square ml-1"
                onClick={() => setRotation((r) => (r + 90) % 360)}
                title="Rotate 90°"
              >
                <HiRefresh className="w-4 h-4" />
              </button>
            </div>
          )}

          {blobUrl && (
            <button
              type="button"
              className="btn btn-ghost btn-sm gap-1 text-xs"
              onClick={handleOpenNewTab}
              title="Open in new browser tab"
            >
              <HiExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">New Tab</span>
            </button>
          )}

          <button
            type="button"
            className="btn btn-primary btn-sm gap-1 text-xs"
            onClick={handleDownload}
            title="Download document"
          >
            <HiDownload className="w-4 h-4" />
            <span className="hidden sm:inline">Download</span>
          </button>
        </div>
      </div>

      {/* Viewer Main Body */}
      <div className="flex-1 relative overflow-hidden bg-neutral/5 flex items-center justify-center p-2 min-h-[350px]">
        {loading && (
          <div className="flex flex-col items-center gap-3 p-8 text-center">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <p className="text-sm font-medium text-base-content/70">
              Loading document preview...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center gap-3 p-8 text-center max-w-md bg-base-100 rounded-xl shadow-sm border border-base-300">
            <HiExclamationCircle className="w-12 h-12 text-warning" />
            <div>
              <p className="font-bold text-base text-base-content mb-1">Preview Unavailable</p>
              <p className="text-xs text-base-content/60 mb-4">{error}</p>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-sm gap-2"
              onClick={handleDownload}
            >
              <HiDownload className="w-4 h-4" /> Download File Instead
            </button>
          </div>
        )}

        {!loading && !error && blobUrl && isPDF && (
          <div className="w-full h-full min-h-[500px] flex flex-col bg-white rounded-lg shadow-inner overflow-hidden">
            <iframe
              src={`${blobUrl}#toolbar=0&navpanes=0`}
              className="w-full h-full flex-1 border-0 rounded-lg"
              title={submission?.original_filename || 'PDF Preview'}
            />
          </div>
        )}

        {!loading && !error && blobUrl && isImage && (
          <div className="w-full h-full overflow-auto flex items-center justify-center p-4">
            <div
              className="transition-transform duration-150 ease-out origin-center"
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              }}
            >
              <img
                src={blobUrl}
                alt={submission?.original_filename || 'Document Image Preview'}
                className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-lg border border-base-300 bg-white"
              />
            </div>
          </div>
        )}

        {!loading && !error && isOfficeDoc && (
          <div className="flex flex-col items-center gap-4 p-8 text-center max-w-lg bg-base-100 rounded-2xl shadow-sm border border-base-300">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold uppercase">
              {fileType}
            </div>
            <div>
              <h4 className="font-bold text-lg text-base-content mb-1">
                {submission?.original_filename}
              </h4>
              <p className="text-sm text-base-content/60">
                {formatFileSize(submission?.file_size)} • {submission?.required_document?.name || 'Document'}
              </p>
            </div>
            <div className="alert alert-info py-2 px-3 text-xs text-left">
              <span>Office files (.docx, .xlsx) can be reviewed by downloading or opening in your local viewer.</span>
            </div>
            <div className="flex gap-3 mt-2">
              <button
                type="button"
                className="btn btn-primary gap-2"
                onClick={handleDownload}
              >
                <HiDownload className="w-5 h-5" /> Download to Review
              </button>
              {blobUrl && (
                <button
                  type="button"
                  className="btn btn-outline gap-2"
                  onClick={handleOpenNewTab}
                >
                  <HiExternalLink className="w-5 h-5" /> Open Direct
                </button>
              )}
            </div>
          </div>
        )}

        {!loading && !error && !isPDF && !isImage && !isOfficeDoc && (
          <div className="flex flex-col items-center gap-3 p-8 text-center max-w-md bg-base-100 rounded-xl shadow-sm border border-base-300">
            <HiDocumentText className="w-16 h-16 text-base-content/40" />
            <div>
              <h4 className="font-bold text-base text-base-content mb-1">
                {submission?.original_filename}
              </h4>
              <p className="text-xs text-base-content/60">
                {formatFileSize(submission?.file_size)}
              </p>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-sm gap-2 mt-2"
              onClick={handleDownload}
            >
              <HiDownload className="w-4 h-4" /> Download File
            </button>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2 bg-base-100 border-t border-base-300 text-xs text-base-content/60 flex items-center justify-between">
        <span>Barangay: <strong className="text-base-content">{submission?.barangay?.name || 'Adlas'}</strong></span>
        <span>Size: <strong>{formatFileSize(submission?.file_size)}</strong></span>
      </div>
    </div>
  )
}
