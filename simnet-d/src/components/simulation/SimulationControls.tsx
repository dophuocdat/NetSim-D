interface Props {
  state: string; // 'idle' | 'playing' | 'paused' | 'completed'
  currentStep: number;
  totalSteps: number;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onNext: () => void;
  onPrev: () => void;
  onReset: () => void;
}

export function SimulationControls({
  state, currentStep, totalSteps,
  onStart, onPause, onResume, onNext, onPrev, onReset,
}: Props) {
  const isFirst = currentStep === 0;
  const isLast = currentStep >= totalSteps - 1;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.75rem',
      padding: '1rem',
      background: 'var(--bg-tertiary)',
      borderRadius: 'var(--border-radius)',
      marginTop: '0.75rem',
    }}>
      {state === 'idle' ? (
        <button className="btn btn-primary btn-lg" onClick={onStart}>
          ▶ Bắt đầu mô phỏng
        </button>
      ) : state === 'completed' ? (
        <button className="btn btn-secondary" onClick={onReset}>
          ↻ Xem lại từ đầu
        </button>
      ) : (
        <>
          <button
            className="btn btn-ghost btn-icon"
            onClick={onPrev}
            disabled={isFirst}
            title="Bước trước"
          >
            ⏮
          </button>

          {state === 'playing' ? (
            <button
              className="btn btn-secondary btn-icon"
              onClick={onPause}
              title="Tạm dừng"
            >
              ⏸
            </button>
          ) : (
            <button
              className="btn btn-primary btn-icon"
              onClick={onResume}
              title="Tiếp tục"
            >
              ▶
            </button>
          )}

          <button
            className="btn btn-ghost btn-icon"
            onClick={onNext}
            disabled={false}
            title={isLast ? 'Hoàn thành' : 'Bước tiếp'}
          >
            ⏭
          </button>

          <div style={{
            marginLeft: '1rem',
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
            fontFamily: 'JetBrains Mono, monospace',
          }}>
            {currentStep + 1} / {totalSteps}
          </div>

          {/* Progress dots */}
          <div style={{ display: 'flex', gap: '4px', marginLeft: '0.5rem' }}>
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: i <= currentStep ? 'var(--accent-primary)' : 'var(--glass-border)',
                  transition: 'background var(--transition-fast)',
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
