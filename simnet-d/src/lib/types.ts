// === Device Types ===
export type DeviceType = 'pc' | 'router' | 'switch' | 'server' | 'firewall' | 'cloud';

export interface Device {
  id: string;
  type: DeviceType;
  label: string;
  x: number;
  y: number;
  ip?: string;
  subnet?: string;
  highlight?: boolean;
  status?: string;
  error_message?: string;
}

export interface Connection {
  from: string;
  to: string;
  label?: string;
  color?: string;
  animated?: boolean;
  status?: string;
  dashed?: boolean;
}

export interface TopologyLabel {
  target: string;
  text: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

export interface TopologyConfig {
  devices: Device[];
  connections: Connection[];
  labels?: TopologyLabel[];
}

export interface TopologyDeltas {
  modify_devices?: (Partial<Device> & { id: string })[];
  modify_connections?: (Partial<Connection> & { from: string; to: string })[];
  add_labels?: TopologyLabel[];
}

// === Animation ===
export interface AnimationConfig {
  type: 'packet_flow' | 'highlight' | 'transform';
  packet?: { label: string; color: string };
  path?: string[];
  speed: number;
  pause_at?: string;
  pause_narration?: string;
}

// === Simulation Step ===
export interface SimulationStep {
  id: string;
  step_order: number;
  title: string;
  narration: string;
  topology_deltas?: TopologyDeltas;
  animation_config: AnimationConfig;
  highlight_elements?: string[];
}

// === Exercise ===
export type ExerciseType = 'fill_in' | 'multiple_choice' | 'drag_drop' | 'interactive_config' | 'true_false';

export interface Exercise {
  id: string;
  exercise_order: number;
  type: ExerciseType;
  question: string;
  context?: string;
  config: FillInConfig | MultipleChoiceConfig | DragDropConfig | Record<string, unknown>;
  explanation: string;
  xp_reward: number;
}

export interface FillInConfig {
  prompts: {
    label: string;
    answer: string;
    accept: string[];
  }[];
}

export interface MultipleChoiceConfig {
  options: {
    id: string;
    text: string;
    correct: boolean;
  }[];
  allow_multiple: boolean;
}

export interface DragDropConfig {
  items: { id: string; label: string; zone: string | null }[];
  drop_zones: { id: string; label: string; accepts: string[] }[];
}

// === Lesson ===
export interface Lesson {
  id: string;
  title: string;
  slug: string;
  description: string;
  objectives: string[];
  difficulty: number;
  xp_reward: number;
  base_topology: TopologyConfig;
  simulation_steps: SimulationStep[];
  exercises: Exercise[];
}

// === User Progress ===
export interface UserProgress {
  lesson_id: string;
  status: 'not_started' | 'learning' | 'practicing' | 'completed';
  last_step_index: number;
  simulation_completed: boolean;
  exercises_score?: {
    total: number;
    correct: number;
    answers: { exercise_id: string; correct: boolean }[];
  };
  best_score?: number;
  xp_earned: number;
}

// === Lesson Phase ===
export type LessonPhase = 'learn' | 'practice' | 'complete';

// === Dashboard Types ===
export type LessonStatus = 'completed' | 'in_progress' | 'available' | 'locked';

export interface CurrentLessonData {
  lesson_id: string;
  title: string;
  slug: string;
  xp_reward: number;
  module_name: string;
  last_step_index: number;
  simulation_completed: boolean;
  is_new_user: boolean;
}

export interface LessonProgressItem {
  module_id: string;
  module_name: string;
  module_slug: string;
  module_order: number;
  lesson_id: string;
  title: string;
  slug: string;
  xp_reward: number;
  status: LessonStatus;
  last_step_index: number;
  best_score: number | null;
  xp_earned: number;
  simulation_completed: boolean;
}

export interface ModuleGroup {
  id: string;
  name: string;
  slug: string;
  order: number;
  lessons: LessonProgressItem[];
}

export interface Track {
  id: string;
  name: string;
  slug: string;
  icon_url: string | null;
  color: string | null;
}

export interface Certification {
  id: string;
  track_id: string;
  name: string;
  slug: string;
  difficulty_level: number;
  icon_url: string | null;
}

export interface DashboardStats {
  total_xp: number;
  completed_count: number;
  current_streak: number;
  longest_streak: number;
}
