import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { CurrentLessonData } from '../../lib/types';

interface Props {
  lesson: CurrentLessonData;
}

export function ContinueLearningCard({ lesson }: Props) {
  const phaseLabel = lesson.simulation_completed
    ? 'Luyện tập'
    : `Step ${lesson.last_step_index + 1} (Mô phỏng)`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card"
      style={{
        border: '1px solid var(--accent-primary)',
        background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.05))',
      }}
    >
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '1rem',
      }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            {lesson.is_new_user ? '✨ Gợi ý cho bạn' : '📖 Đang học'}
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.35rem' }}>
            {lesson.title}
          </h3>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {lesson.module_name} · {lesson.is_new_user ? `+${lesson.xp_reward} XP` : phaseLabel}
          </div>
        </div>
        <Link to={`/lesson/${lesson.slug}`} className="btn btn-primary btn-lg">
          {lesson.is_new_user ? '🚀 Bắt đầu hành trình' : '▶ Tiếp tục học'}
        </Link>
      </div>
    </motion.div>
  );
}
