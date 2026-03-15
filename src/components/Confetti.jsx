import { useMemo } from 'react'

const COLORS = ['#00F5FF', '#FF6B6B', '#FCD34D', '#A78BFA', '#34D399', '#FB923C']

export default function Confetti() {
  const pieces = useMemo(() =>
    Array.from({ length: 80 }, (_, i) => ({
      id: i,
      color: COLORS[i % COLORS.length],
      left: `${Math.random() * 100}%`,
      width: `${6 + Math.random() * 6}px`,
      height: `${10 + Math.random() * 8}px`,
      delay: `${Math.random() * 3}s`,
      duration: `${2.5 + Math.random() * 2}s`,
    })), [])

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            top: '-20px',
            left: p.left,
            width: p.width,
            height: p.height,
            backgroundColor: p.color,
            borderRadius: '2px',
            animation: `confettiFall ${p.duration} ${p.delay} ease-in forwards`,
          }}
        />
      ))}
    </div>
  )
}
