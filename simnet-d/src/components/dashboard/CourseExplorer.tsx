import { useState } from 'react';
import { TrackTabs } from './TrackTabs';
import { CertificationBlock } from './CertificationBlock';
import { useTracks, useCertifications } from '../../hooks/useDashboardStats';

export function CourseExplorer() {
  const { data: tracks } = useTracks();
  const { data: certifications } = useCertifications();
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);

  const resolvedTrackId = activeTrackId || tracks?.[0]?.id || null;
  const filteredCerts = certifications?.filter(c => c.track_id === resolvedTrackId) ?? [];

  return (
    <section>
      <h2 style={{
        fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem',
        background: 'var(--accent-gradient)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>
        📚 Lộ trình học tập
      </h2>

      {tracks && tracks.length > 0 && (
        <TrackTabs
          tracks={tracks}
          activeTrackId={resolvedTrackId}
          onSelect={setActiveTrackId}
        />
      )}

      {filteredCerts.map(cert => (
        <CertificationBlock key={cert.id} certification={cert} />
      ))}
    </section>
  );
}
