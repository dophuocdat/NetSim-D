import { motion } from 'framer-motion';
import type { DashboardStats } from '../../lib/types';

interface Props {
  stats: DashboardStats;
}

export function StatsBar({ stats }: Props) {
  const items = [
    { label: 'Days Streak', value: stats.current_streak, emoji: '🔥', color: 'var(--warning)' },
    { label: 'Total XP', value: stats.total_xp, emoji: '⚡', color: 'var(--accent-primary)' },
    { label: 'Bài hoàn thành', value: stats.completed_count, emoji: '📚', color: 'var(--success)' },
  ];

  return (
    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="glass-card"
          style={{ flex: '1 1 150px', textAlign: 'center', padding: '1.25rem' }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{item.emoji}</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: item.color }}>
            {item.value.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {item.label}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
