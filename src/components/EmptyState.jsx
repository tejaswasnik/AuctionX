export default function EmptyState({ icon, text }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-600">
      <span className="text-4xl">{icon}</span>
      <p className="text-sm">{text}</p>
    </div>
  )
}
