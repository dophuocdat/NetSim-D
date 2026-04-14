import { motion } from 'framer-motion';
import { Confetti } from './Confetti';
import { calculateScore, calculateXP } from '../../utils/scoring';

interface Props {
  results: { total: number; correct: number };
  xpReward: number;
  lessonTitle: string;
  onNext?: () => void;
  onRestart?: () => void;
}

export function CompletionScreen({ results, xpReward, lessonTitle, onNext, onRestart }: Props) {
  const score = calculateScore(results.correct, results.total);
  const xp = calculateXP(xpReward, score);
  const isPerfect = score === 100;

  return (
    <>
      <Confetti active={true} />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{ textAlign: 'center', padding: '3rem 1.5rem' }}
      >
        {/* Trophy */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          style={{ fontSize: '4rem', marginBottom: '1rem' }}
        >
          {isPerfect ? '🏆' : score >= 80 ? '🎉' : score >= 60 ? '👍' : '📚'}
        </motion.div>

        <h2 style={{
          fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem',
          background: 'var(--accent-gradient)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          {isPerfect ? 'Hoàn hảo!' : score >= 80 ? 'Xuất sắc!' : score >= 60 ? 'Tốt lắm!' : 'Tiếp tục cố gắng!'}
        </h2>

        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          {lessonTitle}
        </p>

        {/* Score card */}
        <div className="glass-card" style={{
          maxWidth: '400px', margin: '0 auto 2rem',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem',
        }}>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
              Điểm số
            </div>
            <div style={{
              fontSize: '2rem', fontWeight: 700,
              color: score >= 80 ? 'var(--success)' : score >= 60 ? 'var(--warning)' : 'var(--error)',
            }}>
              {score}%
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {results.correct}/{results.total} câu đúng
            </div>
          </div>

          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
              XP nhận được
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-primary)' }}
            >
              +{xp}
            </motion.div>
            {isPerfect && (
              <div style={{ color: 'var(--success)', fontSize: '0.85rem' }}>
                🌟 Bonus hoàn hảo!
              </div>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ maxWidth: '400px', margin: '0 auto 2rem' }}>
          <div className="progress-bar" style={{ height: '10px' }}>
            <motion.div
              className="progress-bar__fill"
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
              style={{ height: '100%' }}
            />
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          {onRestart && (
            <button className="btn btn-secondary" onClick={onRestart}>
              ↻ Làm lại
            </button>
          )}
          {onNext && (
            <button className="btn btn-primary btn-lg" onClick={onNext}>
              Bài tiếp theo →
            </button>
          )}
        </div>
      </motion.div>
    </>
  );
}
