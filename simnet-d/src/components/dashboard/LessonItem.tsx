import { Link } from 'react-router-dom';
import type { LessonProgressItem } from '../../lib/types';

const statusConfig = {
  completed:   { icon: '✅', opacity: 0.7, cursor: 'pointer'     },
  in_progress: { icon: '🔵', opacity: 1,   cursor: 'pointer'     },
  available:   { icon: '⚪', opacity: 1,   cursor: 'pointer'     },
  locked:      { icon: '🔒', opacity: 0.4, cursor: 'not-allowed' },
} as const;

interface Props {
  lesson: LessonProgressItem;
}

export function LessonItem({ lesson }: Props) {
  const cfg = statusConfig[lesson.status];
  const isClickable = lesson.status !== 'locked';

  const content = (
    <div
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.85rem 1rem',
        opacity: cfg.opacity,
        cursor: cfg.cursor,
        borderRadius: 'var(--border-radius-sm)',
        background: lesson.status === 'in_progress'
          ? 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.04))'
          : 'transparent',
        border: lesson.status === 'in_progress'
          ? '1px solid var(--accent-primary)'
          : '1px solid transparent',
        transition: 'all var(--transition-fast)',
      }}
      onMouseEnter={(e) => {
        if (isClickable) {
          (e.currentTarget as HTMLDivElement).style.background = 'rgba(99,102,241,0.06)';
          (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--glass-border)';
        }
      }}
      onMouseLeave={(e) => {
        if (isClickable && lesson.status !== 'in_progress') {
          (e.currentTarget as HTMLDivElement).style.background = 'transparent';
          (e.currentTarget as HTMLDivElement).style.borderColor = 'transparent';
        }
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontSize: '1rem', width: '1.5rem', textAlign: 'center' }}>{cfg.icon}</span>
        <span style={{ fontSize: '0.9rem' }}>{lesson.title}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {lesson.best_score != null && (
          <span style={{ fontSize: '0.75rem', color: 'var(--success)' }}>{lesson.best_score}%</span>
        )}
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>+{lesson.xp_reward} XP</span>
      </div>
    </div>
  );

  if (isClickable) {
    return (
      <Link to={`/lesson/${lesson.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        {content}
      </Link>
    );
  }
  return content;
}
