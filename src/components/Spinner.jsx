export default function Spinner({ label }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: '3px solid rgba(0,245,255,0.15)',
          borderTop: '3px solid #00F5FF',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      {label && <p className="text-sm text-slate-400">{label}</p>}
    </div>
  )
}
