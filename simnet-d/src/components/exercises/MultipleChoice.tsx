import { useState } from 'react';
import { ExerciseFeedback } from './ExerciseFeedback';
import type { MultipleChoiceConfig } from '../../lib/types';

interface Props {
  config: MultipleChoiceConfig;
  explanation: string;
  onAnswer: (correct: boolean) => void;
}

export function MultipleChoice({ config, explanation, onAnswer }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (optionId: string) => {
    if (submitted) return;
    setSelected(optionId);
  };

  const handleSubmit = () => {
    if (!selected) return;
    setSubmitted(true);
    const selectedOption = config.options.find(o => o.id === selected);
    onAnswer(selectedOption?.correct ?? false);
  };

  const getOptionClass = (option: typeof config.options[0]) => {
    let cls = 'exercise-option';
    if (selected === option.id) cls += ' selected';
    if (submitted) {
      if (option.correct) cls += ' correct';
      else if (selected === option.id && !option.correct) cls += ' incorrect';
    }
    return cls;
  };

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {config.options.map((option) => (
          <div
            key={option.id}
            className={getOptionClass(option)}
            onClick={() => handleSelect(option.id)}
            role="radio"
            aria-checked={selected === option.id}
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleSelect(option.id)}
          >
            <div style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              border: '2px solid',
              borderColor: selected === option.id ? 'var(--accent-primary)' : 'var(--glass-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              {selected === option.id && (
                <div style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: 'var(--accent-primary)',
                }} />
              )}
            </div>
            <span>{option.text}</span>
            {submitted && option.correct && (
              <span style={{ marginLeft: 'auto', color: 'var(--success)' }}>✓</span>
            )}
          </div>
        ))}
      </div>

      {!submitted && (
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={!selected}
          style={{ marginTop: '1rem' }}
        >
          Kiểm tra
        </button>
      )}

      <ExerciseFeedback
        isCorrect={config.options.find(o => o.id === selected)?.correct ?? false}
        explanation={explanation}
        show={submitted}
      />
    </div>
  );
}
