import { motion } from 'framer-motion'

const CAT_COLORS = {
  'AI API':            '#00F5FF',
  'Framework':         '#A78BFA',
  'Database':          '#34D399',
  'Problem Statement': '#FB923C',
  'API':               '#F472B6',
  'Tool':              '#FCD34D',
}

export default function ItemCard({ item, cost, isNew = false }) {
  const tagColor = CAT_COLORS[item.category] ?? '#94A3B8'

  const card = (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-slate-100 text-sm truncate">{item.item_name}</span>
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0"
          style={{ background: `${tagColor}22`, color: tagColor }}
        >
          {item.category}
        </span>
      </div>
      <p className="text-xs text-slate-400">
        Cost: <span className="text-amber-300 font-semibold">₹{cost.toLocaleString()}</span>
      </p>
    </div>
  )

  if (isNew) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {card}
      </motion.div>
    )
  }

  return card
}
