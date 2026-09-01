import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-base-content/20">404</h1>
        <p className="text-2xl font-semibold mt-4">Page Not Found</p>
        <p className="text-base-content/60 mt-2">The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn btn-primary mt-6">Go Home</Link>
      </div>
    </div>
  )
}
