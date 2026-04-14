import type { Track } from '../../lib/types';

interface Props {
  tracks: Track[];
  activeTrackId: string | null;
  onSelect: (trackId: string) => void;
}

const trackIcons: Record<string, string> = {
  networking: '🌐',
  security: '🔒',
  cloud: '☁️',
};

export function TrackTabs({ tracks, activeTrackId, onSelect }: Props) {
  return (
    <div style={{
      display: 'flex', gap: '0.5rem', overflowX: 'auto',
      borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem',
      marginBottom: '1.5rem',
    }}>
      {tracks.map(track => {
        const isActive = track.id === activeTrackId;
        return (
          <button
            key={track.id}
            onClick={() => onSelect(track.id)}
            style={{
              padding: '0.6rem 1.25rem', borderRadius: 'var(--border-radius-sm)',
              border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
              fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: isActive ? 600 : 400,
              background: isActive ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
              color: isActive ? 'white' : 'var(--text-secondary)',
              transition: 'all var(--transition-fast)',
            }}
          >
            {trackIcons[track.slug] || '📁'} {track.name}
          </button>
        );
      })}
    </div>
  );
}
