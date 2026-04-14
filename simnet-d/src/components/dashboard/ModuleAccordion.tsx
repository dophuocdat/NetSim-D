import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LessonItem } from './LessonItem';
import type { ModuleGroup } from '../../lib/types';

interface Props {
  module: ModuleGroup;
  defaultOpen?: boolean;
}

export function ModuleAccordion({ module, defaultOpen = false }: Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const completedCount = module.lessons.filter(l => l.status === 'completed').length;

  return (
    <div style={{
      borderRadius: 'var(--border-radius-sm)',
      overflow: 'hidden',
      border: '1px solid var(--glass-border)',
    }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.9rem 1rem',
          background: 'var(--bg-tertiary)', border: 'none', cursor: 'pointer',
          color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '0.95rem', fontWeight: 500,
          borderBottom: isOpen ? '1px solid var(--glass-border)' : 'none',
          transition: 'background var(--transition-fast)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            transition: 'transform 0.2s',
            transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
            fontSize: '0.75rem',
          }}>
            ▶
          </span>
          {module.name}
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          [{completedCount}/{module.lessons.length}]
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '0.5rem' }}>
              {module.lessons.map(lesson => (
                <LessonItem key={lesson.lesson_id} lesson={lesson} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
