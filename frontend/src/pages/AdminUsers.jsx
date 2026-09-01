import { useState, useEffect } from 'react'
import { adminAPI } from '../services/api'
import toast from 'react-hot-toast'
import { HiPlus, HiPencil, HiTrash, HiSearch, HiUser, HiEye, HiEyeOff } from 'react-icons/hi'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [barangays, setBarangays] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'barangay',
    barangay_id: '', phone: '', position: ''
  })

  useEffect(() => {
    loadUsers()
    adminAPI.barangays().then(res => setBarangays(res.data)).catch(console.error)
  }, [roleFilter])

  const loadUsers = () => {
    setLoading(true)
    const params = {}
    if (roleFilter) params.role = roleFilter
    if (search) params.search = search
    adminAPI.users(params)
      .then(res => setUsers(res.data.data || res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        const data = { ...form }
        if (!data.password) delete data.password
        await adminAPI.updateUser(editing.id, data)
        toast.success('User updated')
      } else {
        await adminAPI.createUser(form)
        toast.success('User created')
      }
      setShowModal(false)
      setEditing(null)
      resetForm()
      loadUsers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed')
    }
  }

  const handleEdit = (user) => {
    setEditing(user)
    setForm({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      barangay_id: user.barangay_id || '',
      phone: user.phone || '',
      position: user.position || '',
    })
    setShowPassword(false)
    setShowModal(true)
  }

  const handleDelete = async (user) => {
    if (!confirm(`Delete user "${user.name}"?`)) return
    try {
      await adminAPI.deleteUser(user.id)
      toast.success('User deleted')
      loadUsers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed')
    }
  }

  const resetForm = () => {
    setForm({ name: '', email: '', password: '', role: 'barangay', barangay_id: '', phone: '', position: '' })
  }

  const roleBadge = (role) => {
    const map = {
      admin: 'badge-primary',
      checker: 'badge-secondary',
      barangay: 'badge-accent',
    }
    return `badge ${map[role] || 'badge-ghost'}`
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-base-content/60">Manage system users and roles</p>
        </div>
        <button className="btn btn-primary gap-2" onClick={() => { resetForm(); setEditing(null); setShowPassword(false); setShowModal(true) }}>
          <HiPlus className="w-5 h-5" /> Add User
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search users..."
            className="input input-bordered w-full pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadUsers()}
          />
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
        </div>
        <select
          className="select select-bordered"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="checker">Checker</option>
          <option value="barangay">Barangay</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="card bg-base-100 shadow-sm border border-base-300">
        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Barangay</th>
                <th>Position</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8"><span className="loading loading-spinner"></span></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-base-content/50">No users found</td></tr>
              ) : (
                users.map(user => (
                  <tr key={user.id} className="hover">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar placeholder">
                          <div className="bg-primary text-primary-content rounded-full w-10">
                            <span>{user.name?.charAt(0)}</span>
                          </div>
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-base-content/50">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td><span className={roleBadge(user.role)}>{user.role}</span></td>
                    <td className="text-sm">{user.barangay?.name || '—'}</td>
                    <td className="text-sm">{user.position || '—'}</td>
                    <td>
                      <span className={`badge ${user.is_active ? 'badge-success' : 'badge-error'} badge-sm`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(user)}>
                          <HiPencil className="w-4 h-4" />
                        </button>
                        <button className="btn btn-ghost btn-sm text-error" onClick={() => handleDelete(user)}>
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

      {/* Create/Edit Modal */}
      {showModal && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-lg">
            <h3 className="font-bold text-xl mb-4">{editing ? 'Edit User' : 'Create New User'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-3">
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Full Name</span></label>
                  <input type="text" className="input input-bordered" value={form.name}
                    onChange={(e) => setForm({...form, name: e.target.value})} required />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Email</span></label>
                  <input type="email" className="input input-bordered" value={form.email}
                    onChange={(e) => setForm({...form, email: e.target.value})} required />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Password {editing && '(leave blank to keep)'}</span></label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} className="input input-bordered w-full pr-10" value={form.password}
                      onChange={(e) => setForm({...form, password: e.target.value})}
                      required={!editing} minLength={8} />
                    <button 
                      type="button" 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Role</span></label>
                  <select className="select select-bordered" value={form.role}
                    onChange={(e) => setForm({...form, role: e.target.value})}>
                    <option value="barangay">Barangay</option>
                    <option value="checker">Checker</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                {form.role === 'barangay' && (
                  <div className="form-control">
                    <label className="label"><span className="label-text font-medium">Barangay</span></label>
                    <select className="select select-bordered" value={form.barangay_id}
                      onChange={(e) => setForm({...form, barangay_id: e.target.value})} required>
                      <option value="">Select Barangay</option>
                      {barangays.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Position</span></label>
                  <input type="text" className="input input-bordered" value={form.position}
                    onChange={(e) => setForm({...form, position: e.target.value})}
                    placeholder="e.g. Barangay Secretary" />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Phone</span></label>
                  <input type="text" className="input input-bordered" value={form.phone}
                    onChange={(e) => setForm({...form, phone: e.target.value})} />
                </div>
              </div>
              <div className="modal-action mt-4">
                <button type="button" className="btn btn-ghost" onClick={() => { setShowModal(false); setEditing(null) }}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => { setShowModal(false); setEditing(null) }}>close</button>
          </form>
        </dialog>
      )}
    </div>
  )
}
