export default function StatCard({ title, value, icon: Icon, color = 'primary', subtitle, onClick }) {
  const colorMap = {
    primary: 'bg-primary text-primary-content',
    secondary: 'bg-secondary text-secondary-content',
    accent: 'bg-accent text-accent-content',
    success: 'bg-success text-success-content',
    warning: 'bg-warning text-warning-content',
    error: 'bg-error text-error-content',
    info: 'bg-info text-info-content',
  }

  return (
    <div 
      className={`card bg-base-100 shadow-sm border border-base-300 card-hover ${onClick ? 'cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all' : ''}`}
      onClick={onClick}
    >
      <div className="card-body p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-base-content/60 font-medium">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            {subtitle && <p className="text-xs text-base-content/50 mt-1">{subtitle}</p>}
          </div>
          {Icon && (
            <div className={`w-12 h-12 rounded-xl ${colorMap[color]} flex items-center justify-center`}>
              <Icon className="w-6 h-6" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
