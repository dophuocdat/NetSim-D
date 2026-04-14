import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  isCorrect: boolean;
  explanation: string;
  show: boolean;
}

export function ExerciseFeedback({ isCorrect, explanation, show }: Props) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -10, height: 0 }}
          transition={{ duration: 0.3 }}
          className={`feedback ${isCorrect ? 'feedback-correct' : 'feedback-incorrect'}`}
        >
          <span className="feedback-icon">{isCorrect ? '✅' : '❌'}</span>
          <div>
            <strong>{isCorrect ? 'Chính xác!' : 'Chưa đúng!'}</strong>
            <p style={{ marginTop: '0.25rem', opacity: 0.9 }}>{explanation}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
