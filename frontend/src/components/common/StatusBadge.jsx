import { HiClock, HiEye, HiCheckCircle, HiExclamationCircle, HiXCircle } from 'react-icons/hi'

const statusConfig = {
  pending: { label: 'Pending', icon: HiClock, class: 'badge-warning' },
  under_review: { label: 'Under Review', icon: HiEye, class: 'badge-info' },
  verified: { label: 'Verified', icon: HiCheckCircle, class: 'badge-success' },
  returned: { label: 'Returned', icon: HiExclamationCircle, class: 'badge-error' },
  overdue: { label: 'Overdue', icon: HiXCircle, class: 'badge-error' },
  not_submitted: { label: 'Not Submitted', icon: HiXCircle, class: 'badge-ghost' },
}

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.pending
  const Icon = config.icon

  return (
    <span className={`badge ${config.class} gap-1 text-sm`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  )
}
