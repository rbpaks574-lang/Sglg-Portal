import { useState, useEffect } from 'react'
import { adminAPI } from '../services/api'
import toast from 'react-hot-toast'
import { HiSearch, HiPencil, HiOfficeBuilding } from 'react-icons/hi'

export default function AdminBarangays() {
  const [barangays, setBarangays] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({})

  useEffect(() => {
    adminAPI.barangays()
      .then(res => setBarangays(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleEdit = (b) => {
    setEditing(b)
    setForm({
      name: b.name,
      captain_name: b.captain_name || '',
      secretary_name: b.secretary_name || '',
      contact_number: b.contact_number || '',
      email: b.email || '',
      population: b.population || '',
    })
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      await adminAPI.updateBarangay(editing.id, form)
      toast.success('Barangay updated')
      setEditing(null)
      const res = await adminAPI.barangays()
      setBarangays(res.data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    }
  }

  const filtered = barangays.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Barangay Management</h1>
        <p className="text-base-content/60">Manage 64 component barangays of Silang, Cavite</p>
      </div>

      <div className="relative max-w-md">
        <input
          type="text"
          placeholder="Search barangays..."
          className="input input-bordered w-full pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><span className="loading loading-spinner loading-lg"></span></div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(b => (
            <div key={b.id} className="card bg-base-100 shadow-sm border border-base-300 card-hover">
              <div className="card-body p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <HiOfficeBuilding className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold">{b.name}</h3>
                      <p className="text-sm text-base-content/50">{b.submissions_count || 0} verified</p>
                    </div>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(b)}>
                    <HiPencil className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Compliance Score</span>
                    <span className="font-bold">{b.compliance_score || 0}%</span>
                  </div>
                  <progress
                    className={`progress w-full ${
                      b.compliance_score >= 80 ? 'progress-success' :
                      b.compliance_score >= 50 ? 'progress-warning' : 'progress-error'
                    }`}
                    value={b.compliance_score || 0}
                    max="100"
                  ></progress>
                </div>

                {b.captain_name && (
                  <p className="text-sm text-base-content/60 mt-2">
                    Captain: {b.captain_name}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-lg">
            <h3 className="font-bold text-xl mb-4">Edit Barangay — {editing.name}</h3>
            <form onSubmit={handleUpdate}>
              <div className="space-y-3">
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Barangay Name</span></label>
                  <input type="text" className="input input-bordered" value={form.name}
                    onChange={(e) => setForm({...form, name: e.target.value})} required />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Barangay Captain</span></label>
                  <input type="text" className="input input-bordered" value={form.captain_name}
                    onChange={(e) => setForm({...form, captain_name: e.target.value})} />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Barangay Secretary</span></label>
                  <input type="text" className="input input-bordered" value={form.secretary_name}
                    onChange={(e) => setForm({...form, secretary_name: e.target.value})} />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Contact Number</span></label>
                  <input type="text" className="input input-bordered" value={form.contact_number}
                    onChange={(e) => setForm({...form, contact_number: e.target.value})} />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Email</span></label>
                  <input type="email" className="input input-bordered" value={form.email}
                    onChange={(e) => setForm({...form, email: e.target.value})} />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Population</span></label>
                  <input type="number" className="input input-bordered" value={form.population}
                    onChange={(e) => setForm({...form, population: e.target.value})} />
                </div>
              </div>
              <div className="modal-action mt-4">
                <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setEditing(null)}>close</button>
          </form>
        </dialog>
      )}
    </div>
  )
}
