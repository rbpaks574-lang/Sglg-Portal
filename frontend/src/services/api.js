import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, '')}/api` : '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Request interceptor — attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

// ─── Auth ─────────────────────────────────────────────────────────────
export const authAPI = {
  login: (data) => api.post('/login', data),
  logout: () => api.post('/logout'),
  me: () => api.get('/me'),
  updateProfile: (data) => api.put('/profile', data),
}

// ─── Barangay Dashboard ───────────────────────────────────────────────
export const barangayAPI = {
  dashboard: () => api.get('/barangay/dashboard'),
  requiredDocuments: () => api.get('/barangay/required-documents'),
  submit: (formData) => api.post('/barangay/submissions', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  resubmit: (id, formData) => api.post(`/barangay/submissions/${id}/resubmit`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
}

// ─── Shared Data ──────────────────────────────────────────────────────
export const sharedAPI = {
  barangays: () => api.get('/barangays/list'),
}

// ─── Checker ──────────────────────────────────────────────────────────
export const checkerAPI = {
  dashboard: () => api.get('/checker/dashboard'),
  pending: (params) => api.get('/checker/pending', { params }),
  review: (id, data) => api.post(`/checker/submissions/${id}/review`, data),
}

// ─── Submissions ──────────────────────────────────────────────────────
export const submissionAPI = {
  list: (params) => api.get('/submissions', { params }),
  get: (id) => api.get(`/submissions/${id}`),
  download: (id) => api.get(`/submissions/${id}/download`, { responseType: 'blob' }),
  preview: (id) => api.get(`/submissions/${id}/preview`, { responseType: 'blob' }),
}

// ─── Admin ────────────────────────────────────────────────────────────
export const adminAPI = {
  dashboard: () => api.get('/admin/dashboard'),
  analytics: () => api.get('/admin/analytics'),

  // Users
  users: (params) => api.get('/admin/users', { params }),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),

  // Barangays
  barangays: () => api.get('/admin/barangays'),
  barangayDetails: (id) => api.get(`/admin/barangays/${id}`),
  updateBarangay: (id, data) => api.put(`/admin/barangays/${id}`, data),

  // Categories & Documents Management ("Ano ang ipapasa")
  categories: () => api.get('/categories'),
  createCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
  addDocument: (catId, data) => api.post(`/admin/categories/${catId}/documents`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateDocument: (docId, data) => api.post(`/admin/documents/${docId}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteDocument: (docId) => api.delete(`/admin/documents/${docId}`),

  // Announcements
  announcements: (params) => api.get('/announcements', { params }),
  createAnnouncement: (data) => api.post('/admin/announcements', data),
  updateAnnouncement: (id, data) => api.put(`/admin/announcements/${id}`, data),
  deleteAnnouncement: (id) => api.delete(`/admin/announcements/${id}`),

  // Audit logs
  auditLogs: (params) => api.get('/admin/audit-logs', { params }),
}
