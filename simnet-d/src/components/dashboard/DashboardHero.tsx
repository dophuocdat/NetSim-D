import { StatsBar } from './StatsBar';
import { ContinueLearningCard } from './ContinueLearningCard';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { useCurrentLesson } from '../../hooks/useCurrentLesson';

export function DashboardHero() {
  const { data: stats } = useDashboardStats();
  const { data: currentLesson } = useCurrentLesson();

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.25rem' }}>
          Chào mừng trở lại! 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Tiếp tục hành trình chinh phục chứng chỉ Cisco.
        </p>
      </div>

      {stats && <StatsBar stats={stats} />}
      {currentLesson && <ContinueLearningCard lesson={currentLesson} />}
    </section>
  );
}
