import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { HiEye, HiEyeOff, HiLockClosed, HiMail } from 'react-icons/hi'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const user = await login(email, password)
      toast.success(`Welcome, ${user.name}!`)

      if (user.role === 'admin') navigate('/admin')
      else if (user.role === 'checker') navigate('/checker')
      else navigate('/barangay')
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-primary-content text-3xl font-bold">S</span>
          </div>
          <h1 className="text-3xl font-bold text-base-content">SGLG Portal</h1>
          <p className="text-base-content/60 mt-2 text-lg">
            Seal of Good Local Governance
          </p>
          <p className="text-base-content/40 text-sm">
            Document Submission Portal — Silang, Cavite
          </p>
        </div>

        {/* Login Card */}
        <div className="card bg-base-100 shadow-xl border border-base-300">
          <div className="card-body p-8">
            <h2 className="card-title text-2xl mb-6">Sign In</h2>

            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text text-base font-medium">Email Address</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="input input-bordered w-full pl-12 text-lg"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                  <HiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
                </div>
              </div>

              {/* Password */}
              <div className="form-control mb-6">
                <label className="label">
                  <span className="label-text text-base font-medium">Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className="input input-bordered w-full pl-12 pr-12 text-lg"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className={`btn btn-primary w-full text-lg ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-base-content/40 text-sm mt-6">
          Department of the Interior and Local Government — Silang, Cavite
        </p>
      </div>
    </div>
  )
}
