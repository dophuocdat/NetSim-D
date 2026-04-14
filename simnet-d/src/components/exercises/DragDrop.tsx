import { useState } from 'react';
import { ExerciseFeedback } from './ExerciseFeedback';
import type { DragDropConfig } from '../../lib/types';

interface Props {
  config: DragDropConfig;
  explanation: string;
  onAnswer: (correct: boolean) => void;
}

export function DragDrop({ config, explanation, onAnswer }: Props) {
  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const unplacedItems = config.items.filter(item => !placements[item.id]);

  const handleDrop = (zoneId: string) => {
    if (!draggedItem || submitted) return;
    setPlacements(prev => ({ ...prev, [draggedItem]: zoneId }));
    setDraggedItem(null);
  };

  const handleRemove = (itemId: string) => {
    if (submitted) return;
    setPlacements(prev => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const allCorrect = config.items.every(item => {
      const placedZone = placements[item.id];
      const correctZone = config.drop_zones.find(z => z.accepts.includes(item.id));
      return placedZone === correctZone?.id;
    });
    onAnswer(allCorrect);
  };

  const isItemCorrect = (itemId: string) => {
    const placedZone = placements[itemId];
    const correctZone = config.drop_zones.find(z => z.accepts.includes(itemId));
    return placedZone === correctZone?.id;
  };

  return (
    <div>
      {/* Drag source */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '0.5rem',
        padding: '1rem', background: 'var(--bg-tertiary)',
        borderRadius: 'var(--border-radius-sm)', marginBottom: '1rem',
        minHeight: '50px',
      }}>
        {unplacedItems.length === 0 && !submitted && (
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Tất cả items đã được đặt
          </span>
        )}
        {unplacedItems.map(item => (
          <div
            key={item.id}
            draggable
            onDragStart={() => setDraggedItem(item.id)}
            style={{
              padding: '0.5rem 1rem',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--border-radius-sm)',
              cursor: 'grab',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.9rem',
              userSelect: 'none',
            }}
          >
            {item.label}
          </div>
        ))}
      </div>

      {/* Drop zones */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${config.drop_zones.length}, 1fr)`, gap: '1rem' }}>
        {config.drop_zones.map(zone => {
          const zoneItems = config.items.filter(item => placements[item.id] === zone.id);
          return (
            <div
              key={zone.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(zone.id)}
              style={{
                padding: '1rem',
                background: draggedItem ? 'rgba(99,102,241,0.05)' : 'var(--bg-tertiary)',
                border: `2px dashed ${draggedItem ? 'var(--accent-primary)' : 'var(--glass-border)'}`,
                borderRadius: 'var(--border-radius-sm)',
                minHeight: '100px',
                transition: 'all var(--transition-fast)',
              }}
            >
              <div style={{
                fontSize: '0.8rem', fontWeight: 600,
                color: 'var(--text-muted)', marginBottom: '0.5rem',
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                {zone.label}
              </div>
              {zoneItems.map(item => (
                <div
                  key={item.id}
                  onClick={() => handleRemove(item.id)}
                  style={{
                    padding: '0.4rem 0.8rem',
                    background: submitted
                      ? (isItemCorrect(item.id) ? 'var(--success-bg)' : 'var(--error-bg)')
                      : 'var(--bg-secondary)',
                    border: '1px solid',
                    borderColor: submitted
                      ? (isItemCorrect(item.id) ? 'var(--success)' : 'var(--error)')
                      : 'var(--glass-border)',
                    borderRadius: 'var(--border-radius-sm)',
                    marginBottom: '0.25rem',
                    cursor: submitted ? 'default' : 'pointer',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>{item.label}</span>
                  {submitted && (
                    <span>{isItemCorrect(item.id) ? '✓' : '✗'}</span>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {!submitted && (
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={Object.keys(placements).length !== config.items.length}
          style={{ marginTop: '1rem' }}
        >
          Kiểm tra
        </button>
      )}

      <ExerciseFeedback
        isCorrect={submitted && config.items.every(item => isItemCorrect(item.id))}
        explanation={explanation}
        show={submitted}
      />
    </div>
  );
}
