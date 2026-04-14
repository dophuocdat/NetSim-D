import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FillIn } from './FillIn';
import { MultipleChoice } from './MultipleChoice';
import { DragDrop } from './DragDrop';
import type { Exercise, FillInConfig, MultipleChoiceConfig, DragDropConfig } from '../../lib/types';

interface Props {
  exercises: Exercise[];
  onComplete: (results: { total: number; correct: number }) => void;
}

export function ExerciseContainer({ exercises, onComplete }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [answered, setAnswered] = useState(false);

  const currentExercise = exercises[currentIndex];
  const isLast = currentIndex === exercises.length - 1;

  const handleAnswer = (correct: boolean) => {
    setResults(prev => [...prev, correct]);
    setAnswered(true);
  };

  const handleNext = () => {
    if (isLast) {
      const correctCount = [...results].filter(Boolean).length;
      onComplete({ total: exercises.length, correct: correctCount });
    } else {
      setCurrentIndex(prev => prev + 1);
      setAnswered(false);
    }
  };

  if (!currentExercise) return null;

  return (
    <div>
      {/* Progress */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '1.5rem',
      }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Bài tập {currentIndex + 1} / {exercises.length}
        </span>
        <div className="progress-bar" style={{ width: '60%' }}>
          <div
            className="progress-bar__fill"
            style={{ width: `${((currentIndex + (answered ? 1 : 0)) / exercises.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Exercise */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="exercise-card">
            <div className="exercise-question">{currentExercise.question}</div>

            {currentExercise.type === 'fill_in' && (
              <FillIn
                config={currentExercise.config as FillInConfig}
                explanation={currentExercise.explanation}
                onAnswer={handleAnswer}
              />
            )}

            {currentExercise.type === 'multiple_choice' && (
              <MultipleChoice
                config={currentExercise.config as MultipleChoiceConfig}
                explanation={currentExercise.explanation}
                onAnswer={handleAnswer}
              />
            )}

            {currentExercise.type === 'drag_drop' && (
              <DragDrop
                config={currentExercise.config as DragDropConfig}
                explanation={currentExercise.explanation}
                onAnswer={handleAnswer}
              />
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Next button */}
      {answered && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginTop: '1rem', textAlign: 'right' }}
        >
          <button className="btn btn-primary" onClick={handleNext}>
            {isLast ? '🎉 Xem kết quả' : 'Câu tiếp theo →'}
          </button>
        </motion.div>
      )}
    </div>
  );
}
