export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="w-20 h-20 rounded-full bg-base-200 flex items-center justify-center mb-4">
          <Icon className="w-10 h-10 text-base-content/30" />
        </div>
      )}
      <h3 className="text-xl font-semibold text-base-content/70">{title}</h3>
      {description && <p className="text-base-content/50 mt-2 max-w-md">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
