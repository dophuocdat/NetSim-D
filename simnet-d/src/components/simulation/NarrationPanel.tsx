import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  title: string;
  narration: string;
  stepIndex: number;
  totalSteps: number;
}

export function NarrationPanel({ title, narration, stepIndex, totalSteps }: Props) {
  return (
    <div className="sim-panel" style={{ marginTop: '1rem' }}>
      <div className="sim-panel__header">
        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{title}</span>
        <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
          Step {stepIndex + 1}/{totalSteps}
        </span>
      </div>
      <div className="sim-panel__body">
        <AnimatePresence mode="wait">
          <motion.div
            key={stepIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="narration"
          >
            {narration}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
