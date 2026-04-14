import { useState } from 'react';
import { ExerciseFeedback } from './ExerciseFeedback';
import type { FillInConfig } from '../../lib/types';

interface Props {
  config: FillInConfig;
  explanation: string;
  onAnswer: (correct: boolean) => void;
}

export function FillIn({ config, explanation, onAnswer }: Props) {
  const [answers, setAnswers] = useState<string[]>(config.prompts.map(() => ''));
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);

  const handleSubmit = () => {
    const newResults = config.prompts.map((prompt, i) => {
      const userAnswer = answers[i].trim();
      return prompt.accept.some(
        (accepted) => accepted.toLowerCase() === userAnswer.toLowerCase()
      );
    });
    setResults(newResults);
    setSubmitted(true);
    onAnswer(newResults.every(Boolean));
  };

  return (
    <div>
      {config.prompts.map((prompt, i) => (
        <div key={i} style={{ marginBottom: '1rem' }}>
          <label style={{
            display: 'block',
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
            marginBottom: '0.5rem',
          }}>
            {prompt.label}
          </label>
          <input
            type="text"
            className={`exercise-input ${submitted ? (results[i] ? 'correct' : 'incorrect') : ''}`}
            value={answers[i]}
            onChange={(e) => {
              const newAnswers = [...answers];
              newAnswers[i] = e.target.value;
              setAnswers(newAnswers);
            }}
            disabled={submitted}
            placeholder="Nhập câu trả lời..."
            onKeyDown={(e) => e.key === 'Enter' && !submitted && handleSubmit()}
          />
          {submitted && !results[i] && (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Đáp án: <code style={{ color: 'var(--success)' }}>{prompt.answer}</code>
            </div>
          )}
        </div>
      ))}

      {!submitted && (
        <button className="btn btn-primary" onClick={handleSubmit}>
          Kiểm tra
        </button>
      )}

      <ExerciseFeedback
        isCorrect={results.every(Boolean)}
        explanation={explanation}
        show={submitted}
      />
    </div>
  );
}
