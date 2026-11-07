export function WashiTape({ color = 'yellow', className = '', rotate = '-2deg', label = '' }) {
  const colorStyles = {
    yellow: 'bg-amber-200/80 border-amber-300 text-amber-900',
    pink: 'bg-pink-200/80 border-pink-300 text-pink-900',
    blue: 'bg-sky-200/80 border-sky-300 text-sky-900',
    mint: 'bg-emerald-200/80 border-emerald-300 text-emerald-900',
    purple: 'bg-purple-200/80 border-purple-300 text-purple-900',
    orange: 'bg-orange-200/80 border-orange-300 text-orange-900'
  }

  const selectedColor = colorStyles[color] || colorStyles.yellow

  return (
    <div
      style={{ transform: `rotate(${rotate})` }}
      className={`h-7 px-4 flex items-center justify-center text-xs font-bold uppercase tracking-wider shadow-xs backdrop-blur-[1px] border-l-2 border-r-2 border-dashed select-none pointer-events-none transition-transform z-10 ${selectedColor} ${className}`}
    >
      {label && <span>{label}</span>}
    </div>
  )
}
