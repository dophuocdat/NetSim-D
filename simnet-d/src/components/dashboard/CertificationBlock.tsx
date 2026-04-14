import { ModuleAccordion } from './ModuleAccordion';
import { useCertificationProgress } from '../../hooks/useCertificationProgress';
import type { Certification } from '../../lib/types';

interface Props {
  certification: Certification;
}

export function CertificationBlock({ certification }: Props) {
  const { data: modules, isLoading } = useCertificationProgress(certification.id);

  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '1rem', padding: '0.5rem 0',
        borderBottom: '1px solid var(--glass-border)',
      }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{certification.name}</h3>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          {'⭐'.repeat(certification.difficulty_level)}
        </span>
      </div>

      {isLoading ? (
        <div className="spinner-container"><div className="spinner" /></div>
      ) : modules && modules.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {modules.map((mod, i) => (
            <ModuleAccordion
              key={mod.id}
              module={mod}
              defaultOpen={i === 0 && mod.lessons.some(l => l.status === 'in_progress' || l.status === 'available')}
            />
          ))}
        </div>
      ) : (
        <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', padding: '1rem' }}>
          Chưa có nội dung cho chứng chỉ này.
        </p>
      )}
    </div>
  );
}
