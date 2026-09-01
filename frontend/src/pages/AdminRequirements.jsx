import { useState, useEffect } from 'react'
import { adminAPI } from '../services/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import {
  HiPlus,
  HiPencil,
  HiTrash,
  HiClipboardCheck,
  HiDocumentAdd,
  HiFolder,
  HiCalendar,
  HiOutlineInformationCircle,
  HiSearch,
  HiTag,
  HiFilter,
  HiDownload
} from 'react-icons/hi'

export default function AdminRequirements() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  // Modals
  const [showDocModal, setShowDocModal] = useState(false)
  const [editingDoc, setEditingDoc] = useState(null)
  const [selectedCatId, setSelectedCatId] = useState('')

  const [showCatModal, setShowCatModal] = useState(false)
  const [editingCat, setEditingCat] = useState(null)

  // Forms
  const [docForm, setDocForm] = useState({
    category_id: '',
    name: '',
    description: '',
    frequency: 'annual',
    accepted_formats: 'pdf,docx,xlsx',
    max_file_size_mb: 10,
    deadline: '',
    template_file: null,
  })

  const [catForm, setCatForm] = useState({
    name: '',
    description: '',
    type: 'core',
    sort_order: 0,
  })

  const loadCategories = () => {
    setLoading(true)
    adminAPI.categories()
      .then(res => setCategories(res.data))
      .catch(err => {
        console.error(err)
        toast.error('Failed to load document requirements')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadCategories()
  }, [])

  // ─── Document Handlers ─────────────────────────────────────────────
  const openNewDocModal = (categoryId = '') => {
    setEditingDoc(null)
    setDocForm({
      category_id: categoryId || (categories[0]?.id || ''),
      name: '',
      description: '',
      frequency: 'annual',
      accepted_formats: 'pdf,docx,xlsx',
      max_file_size_mb: 10,
      deadline: '',
      template_file: null,
    })
    setShowDocModal(true)
  }

  const openEditDocModal = (doc, categoryId) => {
    setEditingDoc(doc)
    setDocForm({
      category_id: categoryId,
      name: doc.name,
      description: doc.description || '',
      frequency: doc.frequency || 'annual',
      accepted_formats: doc.accepted_formats || 'pdf,docx,xlsx',
      max_file_size_mb: doc.max_file_size_mb || 10,
      deadline: doc.deadline ? doc.deadline.split('T')[0] : '',
      template_file: null,
    })
    setShowDocModal(true)
  }

  const handleDocSubmit = async (e) => {
    e.preventDefault()
    try {
      const formData = new FormData()
      formData.append('category_id', docForm.category_id)
      formData.append('name', docForm.name)
      formData.append('description', docForm.description)
      formData.append('frequency', docForm.frequency)
      formData.append('accepted_formats', docForm.accepted_formats)
      formData.append('max_file_size_mb', docForm.max_file_size_mb)
      if (docForm.deadline) formData.append('deadline', docForm.deadline)
      if (docForm.template_file) formData.append('template_file', docForm.template_file)

      if (editingDoc) {
        formData.append('_method', 'PUT')
        await adminAPI.updateDocument(editingDoc.id, formData)
        toast.success('Document requirement updated successfully')
      } else {
        await adminAPI.addDocument(docForm.category_id, formData)
        toast.success('New document requirement added!')
      }

      setShowDocModal(false)
      setEditingDoc(null)
      loadCategories()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed')
    }
  }

  const handleDeleteDoc = async (doc) => {
    if (!confirm(`Are you sure you want to delete requirement "${doc.name}"?`)) return
    try {
      await adminAPI.deleteDocument(doc.id)
      toast.success('Document requirement deleted')
      loadCategories()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete requirement')
    }
  }

  // ─── Category Handlers ─────────────────────────────────────────────
  const openNewCatModal = () => {
    setEditingCat(null)
    setCatForm({
      name: '',
      description: '',
      type: 'core',
      sort_order: categories.length + 1,
    })
    setShowCatModal(true)
  }

  const openEditCatModal = (cat) => {
    setEditingCat(cat)
    setCatForm({
      name: cat.name,
      description: cat.description || '',
      type: cat.type || 'core',
      sort_order: cat.sort_order || 0,
    })
    setShowCatModal(true)
  }

  const handleCatSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingCat) {
        await adminAPI.updateCategory(editingCat.id, catForm)
        toast.success('Category updated successfully')
      } else {
        await adminAPI.createCategory(catForm)
        toast.success('New SGLG category created!')
      }
      setShowCatModal(false)
      setEditingCat(null)
      loadCategories()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed')
    }
  }

  const handleDeleteCat = async (cat) => {
    if (!confirm(`Delete category "${cat.name}" and all its requirements? This action cannot be undone.`)) return
    try {
      await adminAPI.deleteCategory(cat.id)
      toast.success('Category deleted')
      loadCategories()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete category')
    }
  }

  // Filtered categories
  const filteredCategories = categories.filter(cat => {
    if (typeFilter !== 'all' && cat.type !== typeFilter) return false
    if (search) {
      const matchCat = cat.name.toLowerCase().includes(search.toLowerCase())
      const matchDoc = cat.required_documents?.some(d =>
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.description?.toLowerCase().includes(search.toLowerCase())
      )
      return matchCat || matchDoc
    }
    return true
  })

  const totalDocsCount = categories.reduce((sum, c) => sum + (c.required_documents?.length || 0), 0)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Document Requirements & Checklist</h1>
          <p className="text-base-content/60 text-base">
            Set and manage all required compliance forms, submission frequencies, guidelines, and deadlines for barangays.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            className="btn btn-outline gap-2 shadow-sm font-semibold"
            onClick={openNewCatModal}
          >
            <HiFolder className="w-5 h-5 text-accent" />
            <span>New Category</span>
          </button>

          <button
            className="btn btn-primary gap-2 shadow-sm font-semibold"
            onClick={() => openNewDocModal()}
          >
            <HiPlus className="w-5 h-5" />
            <span>+ Add Required Document</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-base-100 shadow-sm border border-base-300 p-4">
          <span className="text-xs font-semibold text-base-content/50 uppercase">Total Requirements</span>
          <p className="text-3xl font-bold text-primary mt-1">{totalDocsCount}</p>
          <span className="text-xs text-base-content/60 mt-1">Forms required from barangays</span>
        </div>
        <div className="card bg-base-100 shadow-sm border border-base-300 p-4">
          <span className="text-xs font-semibold text-base-content/50 uppercase">SGLG Categories</span>
          <p className="text-3xl font-bold text-accent mt-1">{categories.length}</p>
          <span className="text-xs text-base-content/60 mt-1">Core & Essential governance areas</span>
        </div>
        <div className="card bg-base-100 shadow-sm border border-base-300 p-4">
          <span className="text-xs font-semibold text-base-content/50 uppercase">Core Areas</span>
          <p className="text-3xl font-bold text-success mt-1">
            {categories.filter(c => c.type === 'core').length}
          </p>
          <span className="text-xs text-base-content/60 mt-1">Mandatory pass criteria</span>
        </div>
        <div className="card bg-base-100 shadow-sm border border-base-300 p-4">
          <span className="text-xs font-semibold text-base-content/50 uppercase">Essential Areas</span>
          <p className="text-3xl font-bold text-warning mt-1">
            {categories.filter(c => c.type === 'essential').length}
          </p>
          <span className="text-xs text-base-content/60 mt-1">Supporting governance criteria</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-base-100 p-4 rounded-xl border border-base-300 shadow-sm">
        <div className="relative flex-1 min-w-[240px]">
          <HiSearch className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" />
          <input
            type="text"
            className="input input-bordered w-full pl-10 h-11 text-sm"
            placeholder="Search document requirement or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-base-content/60 flex items-center gap-1">
            <HiFilter className="w-4 h-4" /> Filter:
          </span>
          {['all', 'core', 'essential'].map(type => (
            <button
              key={type}
              className={`btn btn-sm ${typeFilter === type ? 'btn-neutral' : 'btn-ghost'}`}
              onClick={() => setTypeFilter(type)}
            >
              {type === 'all' ? 'All Areas' : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Categories & Requirements List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="card bg-base-100 p-12 text-center border border-base-300">
          <HiClipboardCheck className="w-16 h-16 mx-auto text-base-content/30 mb-3" />
          <h3 className="text-lg font-bold">No categories or requirements found</h3>
          <p className="text-sm text-base-content/60 mb-4">Add your first SGLG category or document requirement.</p>
          <button className="btn btn-primary btn-sm mx-auto" onClick={() => openNewDocModal()}>
            <HiPlus className="w-4 h-4" /> Add Requirement
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredCategories.map(cat => (
            <div key={cat.id} className="card bg-base-100 shadow-sm border border-base-300 overflow-hidden">
              {/* Category Header */}
              <div className="px-6 py-4 bg-base-200/60 border-b border-base-300 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-3.5 h-3.5 rounded-full ${cat.type === 'core' ? 'bg-primary' : 'bg-accent'}`} />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-lg font-bold text-base-content">{cat.name}</h2>
                      <span className={`badge badge-sm font-bold uppercase text-xs ${cat.type === 'core' ? 'badge-primary' : 'badge-accent'}`}>
                        {cat.type} Area
                      </span>
                      <span className="badge badge-sm badge-ghost text-xs font-semibold">
                        {cat.required_documents?.length || 0} Requirements
                      </span>
                    </div>
                    {cat.description && (
                      <p className="text-xs text-base-content/60 mt-0.5">{cat.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="btn btn-primary btn-xs gap-1 font-semibold"
                    onClick={() => openNewDocModal(cat.id)}
                    title="Add new document under this category"
                  >
                    <HiPlus className="w-3.5 h-3.5" /> Add Requirement
                  </button>

                  <button
                    type="button"
                    className="btn btn-ghost btn-xs btn-square border border-base-300"
                    onClick={() => openEditCatModal(cat)}
                    title="Edit Category Details"
                  >
                    <HiPencil className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    className="btn btn-ghost btn-xs btn-square text-error hover:bg-error/10 border border-base-300"
                    onClick={() => handleDeleteCat(cat)}
                    title="Delete Category"
                  >
                    <HiTrash className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Requirements Table */}
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full text-sm">
                  <thead>
                    <tr className="bg-base-100 text-xs font-semibold uppercase tracking-wider text-base-content/70">
                      <th className="py-3 px-6">Required Form / Document</th>
                      <th>Submission Frequency</th>
                      <th>Accepted Formats</th>
                      <th>Deadline</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(!cat.required_documents || cat.required_documents.length === 0) ? (
                      <tr>
                        <td colSpan="5" className="text-center py-6 text-base-content/40 italic">
                          No document requirements added yet in this category. Click "+ Add Requirement" above.
                        </td>
                      </tr>
                    ) : (
                      cat.required_documents.map(doc => (
                        <tr key={doc.id} className="hover:bg-base-200/40">
                          <td className="px-6 py-3.5">
                            <div>
                              <p className="font-bold text-base text-base-content">{doc.name}</p>
                              {doc.description && (
                                <p className="text-xs text-base-content/60 mt-0.5 max-w-lg">
                                  {doc.description}
                                </p>
                              )}
                              {doc.template_url && (
                                <a href={doc.template_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline mt-1">
                                  <HiDownload className="w-3.5 h-3.5" /> Download Template
                                </a>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className="badge badge-outline capitalize font-medium text-xs">
                              {doc.frequency}
                            </span>
                          </td>
                          <td>
                            <div className="flex gap-1 flex-wrap">
                              {doc.accepted_formats?.split(',').map((fmt, idx) => (
                                <span key={idx} className="badge badge-xs badge-neutral font-mono uppercase text-[10px]">
                                  {fmt.trim()}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td>
                            {doc.deadline ? (
                              <div className="flex items-center gap-1.5 text-xs font-semibold text-base-content/80">
                                <HiCalendar className="w-4 h-4 text-primary" />
                                <span>{format(new Date(doc.deadline), 'MMM d, yyyy')}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-base-content/40">No strict deadline</span>
                            )}
                          </td>
                          <td>
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                className="btn btn-ghost btn-sm btn-square hover:bg-base-200"
                                onClick={() => openEditDocModal(doc, cat.id)}
                                title="Edit Requirement"
                              >
                                <HiPencil className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                className="btn btn-ghost btn-sm btn-square text-error hover:bg-error/10"
                                onClick={() => handleDeleteDoc(doc)}
                                title="Delete Requirement"
                              >
                                <HiTrash className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Modal: Add / Edit Document Requirement ──────────────────────── */}
      {showDocModal && (
        <dialog className="modal modal-open z-50">
          <div className="modal-box max-w-xl p-6 bg-base-100 shadow-2xl rounded-2xl border border-base-300">
            <h3 className="font-bold text-xl mb-1 text-base-content">
              {editingDoc ? 'Edit Document Requirement' : 'Add Required Document'}
            </h3>
            <p className="text-xs text-base-content/60 mb-5">
              Specify the form details that barangays must submit for compliance.
            </p>

            <form onSubmit={handleDocSubmit} className="space-y-4">
              {/* Category selector */}
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-bold text-sm">SGLG Category Area</span>
                </label>
                <select
                  className="select select-bordered w-full font-medium"
                  value={docForm.category_id}
                  onChange={(e) => setDocForm({ ...docForm, category_id: e.target.value })}
                  required
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>
                      [{c.type.toUpperCase()}] {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Document Name */}
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-bold text-sm">Document / Form Title</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full font-medium"
                  placeholder="e.g. Approved Annual Barangay Budget"
                  value={docForm.name}
                  onChange={(e) => setDocForm({ ...docForm, name: e.target.value })}
                  required
                />
              </div>

              {/* Description & Guidelines */}
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-bold text-sm">Instructions / Description for Barangay</span>
                </label>
                <textarea
                  className="textarea textarea-bordered h-24 text-sm"
                  placeholder="e.g. Must include Sangguniang Barangay Resolution number and Captain's signature. Upload complete pages."
                  value={docForm.description}
                  onChange={(e) => setDocForm({ ...docForm, description: e.target.value })}
                ></textarea>
              </div>

              {/* Frequency & Max Size */}
              <div className="grid grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text font-bold text-sm">Submission Frequency</span>
                  </label>
                  <select
                    className="select select-bordered w-full text-sm font-medium"
                    value={docForm.frequency}
                    onChange={(e) => setDocForm({ ...docForm, frequency: e.target.value })}
                  >
                    <option value="annual">Annual</option>
                    <option value="semi-annual">Semi-Annual</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text font-bold text-sm">Submission Deadline</span>
                  </label>
                  <input
                    type="date"
                    className="input input-bordered w-full text-sm font-medium"
                    value={docForm.deadline}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setDocForm({ ...docForm, deadline: e.target.value })}
                  />
                </div>
              </div>

              {/* Accepted Formats */}
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-bold text-sm">Accepted File Formats (comma-separated)</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full font-mono text-sm"
                  placeholder="pdf,docx,xlsx,jpg,png"
                  value={docForm.accepted_formats}
                  onChange={(e) => setDocForm({ ...docForm, accepted_formats: e.target.value })}
                />
                <span className="text-[11px] text-base-content/50 mt-1">
                  Allowed formats e.g. pdf, docx, xlsx, jpg, png
                </span>
              </div>

              {/* Template File Upload */}
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-bold text-sm">Upload Template (Optional)</span>
                </label>
                <input
                  type="file"
                  className="file-input file-input-bordered w-full text-sm"
                  onChange={(e) => setDocForm({ ...docForm, template_file: e.target.files[0] })}
                />
                <span className="text-[11px] text-base-content/50 mt-1">
                  Upload a downloadable template for barangays to use (Max 10MB)
                </span>
              </div>

              {/* Actions */}
              <div className="modal-action pt-3 flex gap-2">
                <button
                  type="button"
                  className="btn btn-ghost flex-1"
                  onClick={() => setShowDocModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1 font-bold shadow-md"
                >
                  {editingDoc ? 'Save Changes' : 'Publish Requirement'}
                </button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop bg-black/60 backdrop-blur-xs">
            <button onClick={() => setShowDocModal(false)}>close</button>
          </form>
        </dialog>
      )}

      {/* ─── Modal: Add / Edit SGLG Category ─────────────────────────────── */}
      {showCatModal && (
        <dialog className="modal modal-open z-50">
          <div className="modal-box max-w-md p-6 bg-base-100 shadow-2xl rounded-2xl border border-base-300">
            <h3 className="font-bold text-xl mb-1 text-base-content">
              {editingCat ? 'Edit SGLG Category' : 'Create New SGLG Category'}
            </h3>
            <p className="text-xs text-base-content/60 mb-5">
              Categories represent governance pillars in SGLG assessment.
            </p>

            <form onSubmit={handleCatSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-bold text-sm">Category Area Name</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full font-medium"
                  placeholder="e.g. Tourism and Cultural Heritage"
                  value={catForm.name}
                  onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-bold text-sm">Category Type</span>
                </label>
                <select
                  className="select select-bordered w-full font-medium"
                  value={catForm.type}
                  onChange={(e) => setCatForm({ ...catForm, type: e.target.value })}
                >
                  <option value="core">Core Area (Mandatory)</option>
                  <option value="essential">Essential Area (Supporting)</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-bold text-sm">Description</span>
                </label>
                <textarea
                  className="textarea textarea-bordered h-20 text-sm"
                  placeholder="Brief description of this governance category..."
                  value={catForm.description}
                  onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                ></textarea>
              </div>

              <div className="modal-action pt-3 flex gap-2">
                <button
                  type="button"
                  className="btn btn-ghost flex-1"
                  onClick={() => setShowCatModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1 font-bold shadow-md"
                >
                  {editingCat ? 'Save Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop bg-black/60 backdrop-blur-xs">
            <button onClick={() => setShowCatModal(false)}>close</button>
          </form>
        </dialog>
      )}
    </div>
  )
}
