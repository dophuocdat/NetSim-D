import { useState, useMemo, useEffect } from 'react';
import { useActor } from '@xstate/react';
import { motion, AnimatePresence } from 'framer-motion';
import { simulationMachine } from '../machines/simulationMachine';
import { resolveTopology } from '../utils/topology';
import { TopologyRenderer } from '../components/simulation/TopologyRenderer';
import { NarrationPanel } from '../components/simulation/NarrationPanel';
import { SimulationControls } from '../components/simulation/SimulationControls';
import { SimulationErrorBoundary } from '../components/simulation/SimulationErrorBoundary';
import { ExerciseContainer } from '../components/exercises/ExerciseContainer';
import { CompletionScreen } from '../components/gamification/CompletionScreen';
import { lesson1 } from '../data/lesson1';
import type { LessonPhase } from '../lib/types';
import { supabase } from '../lib/supabase';

export function LessonPage() {
  const lesson = lesson1;
  const [phase, setPhase] = useState<LessonPhase>('learn');
  const [exerciseResults, setExerciseResults] = useState<{ total: number; correct: number } | null>(null);

  const [snapshot, send] = useActor(simulationMachine, {
    input: { totalSteps: lesson.simulation_steps.length },
  });

  const currentStep = lesson.simulation_steps[snapshot.context.currentStep];

  const resolvedTopology = useMemo(() => {
    if (!currentStep) return { ...lesson.base_topology, labels: [] };
    return resolveTopology(lesson.base_topology, currentStep.topology_deltas);
  }, [currentStep, lesson.base_topology]);

  const simState = snapshot.value as string;
  const isPlaying = simState === 'playing';

  const handleSimulationComplete = () => {
    setPhase('practice');
  };

  const handleExerciseComplete = async (results: { total: number; correct: number }) => {
    setExerciseResults(results);
    setPhase('complete');
    
    // Lưu kết quả lên Supabase
    try {
      const score = Math.round((results.correct / results.total) * 100);
      const { error } = await supabase.rpc('complete_lesson', {
        p_lesson_id: lesson.id,
        p_score: score,
        p_xp: lesson.xp_reward
      });
      if (error) console.error('Lỗi khi lưu tiến trình:', error.message);
    } catch (err) {
      console.error('Không thể lưu tiến trình', err);
    }
  };

  const handleRestart = () => {
    send({ type: 'RESET' });
    setPhase('learn');
    setExerciseResults(null);
  };

  // Auto-play effect
  useEffect(() => {
    let timer: number;
    if (simState === 'playing') {
      const animationSpeed = currentStep?.animation_config?.speed || 2000;
      // Thêm 2 giây (2000ms) buffer để user đọc text narration
      const totalDelay = animationSpeed + 2000; 

      timer = window.setTimeout(() => {
        send({ type: 'NEXT_STEP' });
      }, totalDelay);
    }

    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [simState, currentStep, send]);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.5rem' }}>
      {/* Lesson Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <span className="badge badge-success">CCNA</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Difficulty: {'⭐'.repeat(lesson.difficulty)}
          </span>
        </div>
        <h1 style={{
          fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.5rem',
          background: 'var(--accent-gradient)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          {lesson.title}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          {lesson.description}
        </p>
      </div>

      {/* Phase tabs */}
      <div style={{
        display: 'flex', gap: '0.5rem', marginBottom: '1.5rem',
        borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem',
      }}>
        {[
          { key: 'learn' as const, label: '📖 Học', icon: '1' },
          { key: 'practice' as const, label: '✏️ Luyện tập', icon: '2' },
          { key: 'complete' as const, label: '🏆 Kết quả', icon: '3' },
        ].map(tab => (
          <div
            key={tab.key}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.9rem',
              fontWeight: phase === tab.key ? 600 : 400,
              color: phase === tab.key ? 'var(--accent-primary)' : 'var(--text-muted)',
              borderBottom: phase === tab.key ? '2px solid var(--accent-primary)' : '2px solid transparent',
              transition: 'all var(--transition-fast)',
              cursor: 'pointer',
            }}
            onClick={() => setPhase(tab.key)}
          >
            {tab.label}
          </div>
        ))}
      </div>

      {/* Phase content */}
      <AnimatePresence mode="wait">
        {phase === 'learn' && (
          <motion.div
            key="learn"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lesson-layout"
          >
            {/* Left Column: Info & Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Objectives */}
              <div className="glass-card">
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                  🎯 Mục tiêu bài học
                </h3>
                <ul style={{
                  listStyle: 'none', padding: 0,
                  display: 'grid', gap: '0.5rem',
                }}>
                  {lesson.objectives.map((obj, i) => (
                    <li key={i} style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      color: 'var(--text-secondary)', fontSize: '0.9rem',
                    }}>
                      <span style={{ color: 'var(--accent-primary)' }}>▸</span>
                      {obj}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Narration & Controls */}
              <div style={{ position: 'sticky', top: 'calc(var(--header-height) + 1.5rem)' }}>
                {currentStep && (
                  <NarrationPanel
                    title={currentStep.title}
                    narration={currentStep.narration}
                    stepIndex={snapshot.context.currentStep}
                    totalSteps={lesson.simulation_steps.length}
                  />
                )}

                <SimulationControls
                  state={simState}
                  currentStep={snapshot.context.currentStep}
                  totalSteps={lesson.simulation_steps.length}
                  onStart={() => send({ type: 'START' })}
                  onPause={() => send({ type: 'PAUSE' })}
                  onResume={() => send({ type: 'RESUME' })}
                  onNext={() => {
                    if (simState === 'completed') {
                      handleSimulationComplete();
                    } else {
                      send({ type: 'NEXT_STEP' });
                    }
                  }}
                  onPrev={() => send({ type: 'PREV_STEP' })}
                  onReset={() => send({ type: 'RESET' })}
                />
              </div>
            </div>

            {/* Right Column: Simulation (Topology) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <SimulationErrorBoundary>
                <div className="glass-card" style={{ padding: '0.5rem' }}>
                  <TopologyRenderer
                    topology={resolvedTopology}
                    animationConfig={currentStep?.animation_config}
                    isPlaying={isPlaying}
                  />
                </div>
              </SimulationErrorBoundary>
            
              {/* Skip to practice */}
              {simState === 'completed' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ textAlign: 'center' }}
                >
                  <button className="btn btn-primary btn-lg" onClick={handleSimulationComplete}>
                    Bắt đầu luyện tập →
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {phase === 'practice' && (
          <motion.div
            key="practice"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <ExerciseContainer
              exercises={lesson.exercises}
              onComplete={handleExerciseComplete}
            />
          </motion.div>
        )}

        {phase === 'complete' && exerciseResults && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <CompletionScreen
              results={exerciseResults}
              xpReward={lesson.xp_reward}
              lessonTitle={lesson.title}
              onRestart={handleRestart}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
