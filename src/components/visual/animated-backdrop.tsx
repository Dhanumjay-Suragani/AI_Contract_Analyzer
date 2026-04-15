import { motion } from 'framer-motion'

export function AnimatedBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-hero-radial opacity-90 dark:opacity-100" />
      <div className="absolute inset-0 [background:radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.15),transparent_55%)]" />

      <motion.div
        className="absolute -left-24 top-24 h-[420px] w-[420px] rounded-full bg-indigo-500/25 blur-3xl dark:bg-indigo-500/20"
        animate={{ y: [0, -18, 0], x: [0, 14, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -right-24 top-40 h-[480px] w-[480px] rounded-full bg-sky-400/20 blur-3xl dark:bg-sky-400/15"
        animate={{ y: [0, 14, 0], x: [0, -16, 0], scale: [1, 1.07, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute left-1/3 top-[65%] h-[520px] w-[520px] rounded-full bg-fuchsia-400/15 blur-3xl dark:bg-fuchsia-400/10"
        animate={{ y: [0, 16, 0], x: [0, 10, 0], scale: [1, 1.06, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="absolute inset-0 opacity-[0.035] [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.9)_1px,transparent_0)] [background-size:26px_26px]" />
    </div>
  )
}

