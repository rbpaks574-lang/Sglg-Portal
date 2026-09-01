import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'
import {
  HiUser,
  HiMail,
  HiPhone,
  HiBriefcase,
  HiOfficeBuilding,
  HiLockClosed,
  HiShieldCheck,
  HiKey,
  HiCheckCircle,
  HiBadgeCheck
} from 'react-icons/hi'

export default function Profile() {
  const { user, setUser } = useAuth()
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  // Profile Form
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    position: user?.position || '',
  })

  // Password Form
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  })

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        phone: user.phone || '',
        position: user.position || '',
      })
    }
  }, [user])

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setProfileLoading(true)

    try {
      const res = await authAPI.updateProfile(form)
      const updatedUser = { ...user, ...res.data.user }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      toast.success('Profile details updated successfully!')
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Failed to update profile.')
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()

    if (passwordForm.password.length < 8) {
      toast.error('New password must be at least 8 characters long.')
      return
    }

    if (passwordForm.password !== passwordForm.password_confirmation) {
      toast.error('New password and confirmation do not match.')
      return
    }

    setPasswordLoading(true)

    try {
      await authAPI.updateProfile({
        current_password: passwordForm.current_password,
        password: passwordForm.password,
        password_confirmation: passwordForm.password_confirmation,
      })

      toast.success('Password changed successfully!')
      setPasswordForm({
        current_password: '',
        password: '',
        password_confirmation: '',
      })
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Failed to change password.')
    } finally {
      setPasswordLoading(false)
    }
  }

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return { label: 'DILG Administrator', class: 'badge-primary' }
      case 'checker':
        return { label: 'Document Reviewer / Checker', class: 'badge-secondary' }
      case 'barangay':
        return { label: 'Barangay Submitter', class: 'badge-accent' }
      default:
        return { label: role, class: 'badge-ghost' }
    }
  }

  const roleInfo = getRoleBadge(user?.role)

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Top Banner & Header Card */}
      <div className="card bg-base-100 shadow-sm border border-base-300 overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-primary via-primary/80 to-accent relative" />
        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-12 mb-4 text-center sm:text-left">
            <div className="avatar placeholder">
              <div className="bg-base-100 text-primary p-1 rounded-2xl ring-4 ring-base-100 shadow-lg">
                <div className="bg-primary text-primary-content rounded-xl w-24 h-24 flex items-center justify-center text-3xl font-bold">
                  {user?.name?.charAt(0) || 'U'}
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-base-content">{user?.name}</h1>
                <span className={`badge ${roleInfo.class} font-bold text-xs px-3 py-3`}>
                  <HiBadgeCheck className="w-4 h-4 mr-1" /> {roleInfo.label}
                </span>
              </div>
              <p className="text-sm text-base-content/60 mt-0.5">
                {user?.email} • {user?.position || 'Official User'}
                {user?.barangay?.name && ` • Barangay ${user.barangay.name}`}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-base-300/60">
            <div className="p-3 bg-base-200/60 rounded-xl border border-base-300/40">
              <span className="text-xs text-base-content/50 block font-medium">Account Role</span>
              <span className="font-bold text-sm capitalize">{user?.role || 'User'}</span>
            </div>
            <div className="p-3 bg-base-200/60 rounded-xl border border-base-300/40">
              <span className="text-xs text-base-content/50 block font-medium">Position</span>
              <span className="font-bold text-sm truncate block">{user?.position || 'Secretary / Officer'}</span>
            </div>
            <div className="p-3 bg-base-200/60 rounded-xl border border-base-300/40">
              <span className="text-xs text-base-content/50 block font-medium">Barangay</span>
              <span className="font-bold text-sm truncate block">{user?.barangay?.name || 'Municipal Level'}</span>
            </div>
            <div className="p-3 bg-base-200/60 rounded-xl border border-base-300/40">
              <span className="text-xs text-base-content/50 block font-medium">Status</span>
              <span className="font-bold text-sm text-success flex items-center gap-1">
                <HiCheckCircle className="w-4 h-4" /> Active
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Profile Information Form */}
        <div className="card bg-base-100 shadow-sm border border-base-300">
          <div className="card-body p-6">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-base-300">
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <HiUser className="w-5 h-5" />
              </div>
              <div>
                <h3 className="card-title text-lg">Personal Information</h3>
                <p className="text-xs text-base-content/60">Update your name, designation, and contact details</p>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-bold text-sm flex items-center gap-1">
                    <HiUser className="w-4 h-4 text-base-content/50" /> Full Name
                  </span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full font-medium"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-bold text-sm flex items-center gap-1">
                    <HiMail className="w-4 h-4 text-base-content/50" /> Email Address
                  </span>
                </label>
                <input
                  type="email"
                  className="input input-bordered w-full bg-base-200 text-base-content/70 cursor-not-allowed"
                  value={user?.email || ''}
                  disabled
                />
                <span className="text-[11px] text-base-content/50 mt-1">
                  Email is managed by the DILG administrator.
                </span>
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-bold text-sm flex items-center gap-1">
                    <HiBriefcase className="w-4 h-4 text-base-content/50" /> Position / Designation
                  </span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full font-medium"
                  placeholder="e.g. Barangay Secretary / DILG Officer"
                  value={form.position}
                  onChange={(e) => setForm({ ...form, position: e.target.value })}
                />
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-bold text-sm flex items-center gap-1">
                    <HiPhone className="w-4 h-4 text-base-content/50" /> Contact Number
                  </span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full font-medium"
                  placeholder="e.g. 0917 123 4567"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              {user?.barangay?.name && (
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text font-bold text-sm flex items-center gap-1">
                      <HiOfficeBuilding className="w-4 h-4 text-base-content/50" /> Barangay Assigned
                    </span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full bg-base-200 font-semibold text-primary cursor-not-allowed"
                    value={user.barangay.name}
                    disabled
                  />
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  className={`btn btn-primary w-full shadow-md font-bold ${profileLoading ? 'loading' : ''}`}
                  disabled={profileLoading}
                >
                  {profileLoading ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Change Password / Security Card */}
        <div className="card bg-base-100 shadow-sm border border-base-300">
          <div className="card-body p-6">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-base-300">
              <div className="p-2 bg-accent/10 text-accent rounded-lg">
                <HiLockClosed className="w-5 h-5" />
              </div>
              <div>
                <h3 className="card-title text-lg">Change Password</h3>
                <p className="text-xs text-base-content/60">Update your account login password</p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-bold text-sm flex items-center gap-1">
                    <HiKey className="w-4 h-4 text-base-content/50" /> Current Password
                  </span>
                </label>
                <input
                  type="password"
                  className="input input-bordered w-full font-medium"
                  placeholder="Enter current password"
                  value={passwordForm.current_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-bold text-sm flex items-center gap-1">
                    <HiLockClosed className="w-4 h-4 text-base-content/50" /> New Password
                  </span>
                </label>
                <input
                  type="password"
                  className="input input-bordered w-full font-medium"
                  placeholder="Min. 8 characters"
                  value={passwordForm.password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-bold text-sm flex items-center gap-1">
                    <HiShieldCheck className="w-4 h-4 text-base-content/50" /> Confirm New Password
                  </span>
                </label>
                <input
                  type="password"
                  className="input input-bordered w-full font-medium"
                  placeholder="Re-enter new password"
                  value={passwordForm.password_confirmation}
                  onChange={(e) => setPasswordForm({ ...passwordForm, password_confirmation: e.target.value })}
                  required
                />
              </div>

              <div className="alert alert-info py-2.5 px-3.5 text-xs">
                <span>Use at least 8 characters with a mix of letters and numbers for strong security.</span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className={`btn btn-accent w-full shadow-md font-bold text-white ${passwordLoading ? 'loading' : ''}`}
                  disabled={passwordLoading}
                >
                  {passwordLoading ? 'Updating Password...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
