# Dashboard & Course Catalog Implementation Plan

**Goal:** Rebuild the Dashboard page into an All-in-one hub combining personal stats (Hero) with a lazy-loaded, server-side-computed Course Catalog (Accordion).

**Architecture:** Two-section vertical layout. Cụm 1 (Hero) uses lightweight parallel queries + `get_current_lesson()` RPC for the "Continue Learning" card. Cụm 2 (Course Explorer) uses `get_certification_progress()` RPC with `LAG()` window function to compute lesson unlock status server-side, eliminating the cross-module dependency bug. Frontend receives pre-labeled JSON and only performs a `groupBy(module_id)` transform before rendering.

**Tech Stack:** Supabase (PostgreSQL RPC), TanStack React Query, Framer Motion, React, TypeScript

**Design Spec:** `docs/designs/2026-04-14-dashboard-catalog-design.md` (v4)

---

## File Map

| Action | Path | Purpose |
|--------|------|---------|
| CREATE | `src/hooks/useDashboardStats.ts` | Query 1: tracks, certs, streak, total XP |
| CREATE | `src/hooks/useCurrentLesson.ts` | RPC: `get_current_lesson()` with cold-start fallback |
| CREATE | `src/hooks/useCertificationProgress.ts` | RPC: `get_certification_progress()` + groupBy transform |
| CREATE | `src/components/dashboard/StatsBar.tsx` | XP, Streak, Lessons count with count-up animation |
| CREATE | `src/components/dashboard/ContinueLearningCard.tsx` | Current lesson card + CTA button |
| CREATE | `src/components/dashboard/DashboardHero.tsx` | Composes StatsBar + ContinueLearningCard |
| CREATE | `src/components/dashboard/TrackTabs.tsx` | Horizontal tabs for Tracks |
| CREATE | `src/components/dashboard/CertificationBlock.tsx` | Cert header, triggers lazy RPC on mount |
| CREATE | `src/components/dashboard/ModuleAccordion.tsx` | Collapsible module with framer-motion |
| CREATE | `src/components/dashboard/LessonItem.tsx` | Single lesson row with status icon |
| CREATE | `src/components/dashboard/CourseExplorer.tsx` | Composes TrackTabs + CertBlocks |
| MODIFY | `src/pages/Dashboard.tsx` | Rewrite: compose DashboardHero + CourseExplorer |
| MODIFY | `src/lib/types.ts` | Add dashboard-related types |

---

### Task 1: Deploy Database RPCs

**Files:**
- Supabase migration via MCP

- [ ] **Step 1: Deploy `get_current_lesson()` RPC**

Apply migration via Supabase MCP:
```sql
CREATE OR REPLACE FUNCTION get_current_lesson()
RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'lesson_id', l.id, 'title', l.title, 'slug', l.slug,
    'xp_reward', l.xp_reward, 'module_name', m.name,
    'last_step_index', up.last_step_index,
    'simulation_completed', up.simulation_completed,
    'is_new_user', false
  ) INTO v_result
  FROM user_progress up
  JOIN lessons l ON l.id = up.lesson_id
  JOIN modules m ON m.id = l.module_id
  WHERE up.user_id = v_user_id AND up.status != 'completed'
  ORDER BY up.last_accessed_at DESC
  LIMIT 1;

  IF v_result IS NULL THEN
    SELECT json_build_object(
      'lesson_id', l.id, 'title', l.title, 'slug', l.slug,
      'xp_reward', l.xp_reward, 'module_name', m.name,
      'last_step_index', 0,
      'simulation_completed', false,
      'is_new_user', true
    ) INTO v_result
    FROM lessons l
    JOIN modules m ON m.id = l.module_id
    JOIN certifications c ON c.id = m.certification_id
    JOIN tracks t ON t.id = c.track_id
    WHERE l.is_active = true AND m.is_active = true
    ORDER BY t.display_order, c.display_order, m.display_order, l.display_order
    LIMIT 1;
  END IF;

  RETURN v_result;
END;
$$;
```

- [ ] **Step 2: Deploy `get_certification_progress()` RPC**

Apply migration via Supabase MCP:
```sql
CREATE OR REPLACE FUNCTION get_certification_progress(p_certification_id UUID)
RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_result JSON;
BEGIN
  WITH ordered_lessons AS (
    SELECT
      l.id, l.title, l.slug, l.xp_reward, l.display_order AS lesson_order,
      m.id AS module_id, m.name AS module_name, m.slug AS module_slug,
      m.display_order AS module_order,
      ROW_NUMBER() OVER (ORDER BY m.display_order, l.display_order) AS global_order
    FROM lessons l
    JOIN modules m ON m.id = l.module_id
    WHERE m.certification_id = p_certification_id
      AND l.is_active = true AND m.is_active = true
  ),
  with_progress AS (
    SELECT
      ol.*,
      up.status AS progress_status,
      up.last_step_index, up.best_score, up.xp_earned, up.simulation_completed,
      LAG(up.status) OVER (ORDER BY ol.global_order) AS prev_lesson_status
    FROM ordered_lessons ol
    LEFT JOIN user_progress up ON up.lesson_id = ol.id AND up.user_id = v_user_id
  ),
  with_computed_status AS (
    SELECT *,
      CASE
        WHEN progress_status = 'completed' THEN 'completed'
        WHEN progress_status IN ('learning', 'practicing') THEN 'in_progress'
        WHEN global_order = 1 THEN 'available'
        WHEN prev_lesson_status = 'completed' THEN 'available'
        ELSE 'locked'
      END AS computed_status
    FROM with_progress
  )
  SELECT json_agg(
    json_build_object(
      'module_id', module_id, 'module_name', module_name,
      'module_slug', module_slug, 'module_order', module_order,
      'lesson_id', id, 'title', title, 'slug', slug, 'xp_reward', xp_reward,
      'status', computed_status,
      'last_step_index', COALESCE(last_step_index, 0),
      'best_score', best_score,
      'xp_earned', COALESCE(xp_earned, 0),
      'simulation_completed', COALESCE(simulation_completed, false)
    ) ORDER BY global_order
  ) INTO v_result
  FROM with_computed_status;

  RETURN COALESCE(v_result, '[]'::json);
END;
$$;
```

- [ ] **Step 3: Verify RPCs work**

Run via MCP `execute_sql`:
```sql
SELECT get_current_lesson();
SELECT get_certification_progress('22222222-2222-2222-2222-222222222222');
```
Expected: JSON results (may be null/empty for current_lesson if no progress yet).

---

### Task 2: Add Dashboard Types

**Files:**
- Modify: `src/lib/types.ts`

- [ ] **Step 1: Add dashboard type definitions**

Append to `src/lib/types.ts`:
```typescript
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
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `node node_modules/typescript/bin/tsc -b`
Expected: No errors.

---

### Task 3: Create Data Hooks

**Files:**
- Create: `src/hooks/useDashboardStats.ts`
- Create: `src/hooks/useCurrentLesson.ts`
- Create: `src/hooks/useCertificationProgress.ts`

- [ ] **Step 1: Create `useDashboardStats.ts`**

```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import type { Track, Certification, DashboardStats } from '../lib/types';

export function useTracks() {
  return useQuery({
    queryKey: ['tracks'],
    queryFn: async (): Promise<Track[]> => {
      const { data, error } = await supabase
        .from('tracks')
        .select('id, name, slug, icon_url, color')
        .eq('is_active', true)
        .order('display_order');
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useCertifications() {
  return useQuery({
    queryKey: ['certifications'],
    queryFn: async (): Promise<Certification[]> => {
      const { data, error } = await supabase
        .from('certifications')
        .select('id, track_id, name, slug, difficulty_level, icon_url')
        .eq('is_active', true)
        .order('display_order');
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useDashboardStats() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['dashboardStats', user?.id],
    queryFn: async (): Promise<DashboardStats> => {
      const [progressRes, streakRes] = await Promise.all([
        supabase.from('user_progress')
          .select('xp_earned, status')
          .eq('user_id', user!.id),
        supabase.from('user_streaks')
          .select('current_streak, longest_streak')
          .eq('user_id', user!.id)
          .maybeSingle(),
      ]);
      if (progressRes.error) throw progressRes.error;
      const progress = progressRes.data ?? [];
      const streak = streakRes.data;

      return {
        total_xp: progress.reduce((sum, p) => sum + (p.xp_earned || 0), 0),
        completed_count: progress.filter(p => p.status === 'completed').length,
        current_streak: streak?.current_streak ?? 0,
        longest_streak: streak?.longest_streak ?? 0,
      };
    },
    enabled: !!user,
  });
}
```

- [ ] **Step 2: Create `useCurrentLesson.ts`**

```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import type { CurrentLessonData } from '../lib/types';

export function useCurrentLesson() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['currentLesson', user?.id],
    queryFn: async (): Promise<CurrentLessonData | null> => {
      const { data, error } = await supabase.rpc('get_current_lesson');
      if (error) throw error;
      return data as CurrentLessonData | null;
    },
    enabled: !!user,
  });
}
```

- [ ] **Step 3: Create `useCertificationProgress.ts`**

```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import type { LessonProgressItem, ModuleGroup } from '../lib/types';

export function useCertificationProgress(certId: string | null) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['certProgress', certId, user?.id],
    queryFn: async (): Promise<ModuleGroup[]> => {
      const { data, error } = await supabase.rpc('get_certification_progress', {
        p_certification_id: certId,
      });
      if (error) throw error;
      const flat: LessonProgressItem[] = data ?? [];

      const map = new Map<string, ModuleGroup>();
      for (const lesson of flat) {
        if (!map.has(lesson.module_id)) {
          map.set(lesson.module_id, {
            id: lesson.module_id,
            name: lesson.module_name,
            slug: lesson.module_slug,
            order: lesson.module_order,
            lessons: [],
          });
        }
        map.get(lesson.module_id)!.lessons.push(lesson);
      }
      return Array.from(map.values()).sort((a, b) => a.order - b.order);
    },
    enabled: !!certId && !!user,
    staleTime: 5 * 60 * 1000,
  });
}
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `node node_modules/typescript/bin/tsc -b`
Expected: No errors.

---

### Task 4: Build Dashboard Hero Components

**Files:**
- Create: `src/components/dashboard/StatsBar.tsx`
- Create: `src/components/dashboard/ContinueLearningCard.tsx`
- Create: `src/components/dashboard/DashboardHero.tsx`

- [ ] **Step 1: Create `StatsBar.tsx`**

```typescript
import { motion } from 'framer-motion';
import type { DashboardStats } from '../../lib/types';

interface Props {
  stats: DashboardStats;
}

export function StatsBar({ stats }: Props) {
  const items = [
    { label: 'Days Streak', value: stats.current_streak, emoji: '🔥', color: 'var(--warning)' },
    { label: 'Total XP', value: stats.total_xp, emoji: '⚡', color: 'var(--accent-primary)' },
    { label: 'Bài hoàn thành', value: stats.completed_count, emoji: '📚', color: 'var(--success)' },
  ];

  return (
    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="glass-card"
          style={{ flex: '1 1 150px', textAlign: 'center', padding: '1.25rem' }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{item.emoji}</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: item.color }}>
            {item.value.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {item.label}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create `ContinueLearningCard.tsx`**

```typescript
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { CurrentLessonData } from '../../lib/types';

interface Props {
  lesson: CurrentLessonData;
}

export function ContinueLearningCard({ lesson }: Props) {
  const phaseLabel = lesson.simulation_completed ? 'Luyện tập' : `Step ${lesson.last_step_index + 1} (Mô phỏng)`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card"
      style={{
        border: '1px solid var(--accent-primary)',
        background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.05))',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            {lesson.is_new_user ? '✨ Gợi ý cho bạn' : '📖 Đang học'}
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.35rem' }}>
            {lesson.title}
          </h3>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {lesson.module_name} · {lesson.is_new_user ? `+${lesson.xp_reward} XP` : phaseLabel}
          </div>
        </div>
        <Link
          to={`/lesson/${lesson.slug}`}
          className="btn btn-primary"
          style={{ animation: 'pulse 2s infinite' }}
        >
          {lesson.is_new_user ? '🚀 Bắt đầu hành trình' : '▶ Tiếp tục học'}
        </Link>
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 3: Create `DashboardHero.tsx`**

```typescript
import { StatsBar } from './StatsBar';
import { ContinueLearningCard } from './ContinueLearningCard';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { useCurrentLesson } from '../../hooks/useCurrentLesson';

export function DashboardHero() {
  const { data: stats } = useDashboardStats();
  const { data: currentLesson } = useCurrentLesson();

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.25rem' }}>
          Chào mừng trở lại! 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Tiếp tục hành trình chinh phục chứng chỉ Cisco.
        </p>
      </div>

      {stats && <StatsBar stats={stats} />}
      {currentLesson && <ContinueLearningCard lesson={currentLesson} />}
    </section>
  );
}
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `node node_modules/typescript/bin/tsc -b`
Expected: No errors.

---

### Task 5: Build Course Explorer Components

**Files:**
- Create: `src/components/dashboard/LessonItem.tsx`
- Create: `src/components/dashboard/ModuleAccordion.tsx`
- Create: `src/components/dashboard/TrackTabs.tsx`
- Create: `src/components/dashboard/CertificationBlock.tsx`
- Create: `src/components/dashboard/CourseExplorer.tsx`

- [ ] **Step 1: Create `LessonItem.tsx`**

```typescript
import { Link } from 'react-router-dom';
import type { LessonProgressItem } from '../../lib/types';

const statusConfig = {
  completed:   { icon: '✅', opacity: 0.7, cursor: 'pointer'     },
  in_progress: { icon: '🔵', opacity: 1,   cursor: 'pointer'     },
  available:   { icon: '⚪', opacity: 1,   cursor: 'pointer'     },
  locked:      { icon: '🔒', opacity: 0.4, cursor: 'not-allowed' },
} as const;

interface Props {
  lesson: LessonProgressItem;
}

export function LessonItem({ lesson }: Props) {
  const cfg = statusConfig[lesson.status];
  const isClickable = lesson.status !== 'locked';

  const content = (
    <div
      className={isClickable ? 'glass-card' : ''}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.85rem 1rem',
        opacity: cfg.opacity,
        cursor: cfg.cursor,
        borderRadius: 'var(--border-radius-sm)',
        background: lesson.status === 'in_progress'
          ? 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.04))'
          : undefined,
        border: lesson.status === 'in_progress' ? '1px solid var(--accent-primary)' : undefined,
        transition: 'all var(--transition-fast)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontSize: '1rem' }}>{cfg.icon}</span>
        <span style={{ fontSize: '0.9rem' }}>{lesson.title}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {lesson.best_score != null && (
          <span style={{ fontSize: '0.75rem', color: 'var(--success)' }}>{lesson.best_score}%</span>
        )}
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>+{lesson.xp_reward} XP</span>
      </div>
    </div>
  );

  if (isClickable) {
    return <Link to={`/lesson/${lesson.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>{content}</Link>;
  }
  return content;
}
```

- [ ] **Step 2: Create `ModuleAccordion.tsx`**

```typescript
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
    <div style={{ borderRadius: 'var(--border-radius-sm)', overflow: 'hidden' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.9rem 1rem',
          background: 'var(--bg-tertiary)', border: 'none', cursor: 'pointer',
          color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '0.95rem', fontWeight: 500,
          borderBottom: isOpen ? '1px solid var(--glass-border)' : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.75rem' }}>
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
```

- [ ] **Step 3: Create `TrackTabs.tsx`**

```typescript
import type { Track } from '../../lib/types';

interface Props {
  tracks: Track[];
  activeTrackId: string | null;
  onSelect: (trackId: string) => void;
}

const trackIcons: Record<string, string> = {
  networking: '🌐',
  security: '🔒',
  cloud: '☁️',
};

export function TrackTabs({ tracks, activeTrackId, onSelect }: Props) {
  return (
    <div style={{
      display: 'flex', gap: '0.5rem', overflowX: 'auto',
      borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem',
      marginBottom: '1.5rem',
    }}>
      {tracks.map(track => {
        const isActive = track.id === activeTrackId;
        return (
          <button
            key={track.id}
            onClick={() => onSelect(track.id)}
            style={{
              padding: '0.6rem 1.25rem', borderRadius: 'var(--border-radius-sm)',
              border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
              fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: isActive ? 600 : 400,
              background: isActive ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
              color: isActive ? 'white' : 'var(--text-secondary)',
              transition: 'all var(--transition-fast)',
            }}
          >
            {trackIcons[track.slug] || '📁'} {track.name}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Create `CertificationBlock.tsx`**

```typescript
import { ModuleAccordion } from './ModuleAccordion';
import { useCertificationProgress } from '../../hooks/useCertificationProgress';
import type { Certification } from '../../lib/types';

interface Props {
  certification: Certification;
}

export function CertificationBlock({ certification }: Props) {
  const { data: modules, isLoading } = useCertificationProgress(certification.id);

  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '1rem', padding: '0.5rem 0',
        borderBottom: '1px solid var(--glass-border)',
      }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{certification.name}</h3>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          {'⭐'.repeat(certification.difficulty_level)}
        </span>
      </div>

      {isLoading ? (
        <div className="spinner-container"><div className="spinner" /></div>
      ) : modules && modules.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {modules.map((mod, i) => (
            <ModuleAccordion
              key={mod.id}
              module={mod}
              defaultOpen={i === 0 && mod.lessons.some(l => l.status === 'in_progress' || l.status === 'available')}
            />
          ))}
        </div>
      ) : (
        <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', padding: '1rem' }}>
          Chưa có nội dung cho chứng chỉ này.
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Create `CourseExplorer.tsx`**

```typescript
import { useState } from 'react';
import { TrackTabs } from './TrackTabs';
import { CertificationBlock } from './CertificationBlock';
import { useTracks, useCertifications } from '../../hooks/useDashboardStats';

export function CourseExplorer() {
  const { data: tracks } = useTracks();
  const { data: certifications } = useCertifications();
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);

  const resolvedTrackId = activeTrackId || tracks?.[0]?.id || null;
  const filteredCerts = certifications?.filter(c => c.track_id === resolvedTrackId) ?? [];

  return (
    <section>
      <h2 style={{
        fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem',
        background: 'var(--accent-gradient)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>
        📚 Lộ trình học tập
      </h2>

      {tracks && tracks.length > 0 && (
        <TrackTabs
          tracks={tracks}
          activeTrackId={resolvedTrackId}
          onSelect={setActiveTrackId}
        />
      )}

      {filteredCerts.map(cert => (
        <CertificationBlock key={cert.id} certification={cert} />
      ))}
    </section>
  );
}
```

- [ ] **Step 6: Verify TypeScript compiles**

Run: `node node_modules/typescript/bin/tsc -b`
Expected: No errors.

---

### Task 6: Rewrite Dashboard Page

**Files:**
- Modify: `src/pages/Dashboard.tsx`

- [ ] **Step 1: Rewrite `Dashboard.tsx`**

Replace entire file content with:
```typescript
import { DashboardHero } from '../components/dashboard/DashboardHero';
import { CourseExplorer } from '../components/dashboard/CourseExplorer';

export function Dashboard() {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem' }}>
      <DashboardHero />
      <CourseExplorer />
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `node node_modules/typescript/bin/tsc -b`
Expected: No errors.

- [ ] **Step 3: Run test suite**

Run: `node node_modules/vitest/vitest.mjs run`
Expected: All 42 existing tests pass (no regressions).

---

### Task 7: Browser Audit

- [ ] **Step 1: Open `http://localhost:5173/dashboard` in browser**

Verify:
1. Hero Section: Stats cards render (XP, Streak, Lessons).
2. ContinueLearningCard: Shows first lesson for new user with "🚀 Bắt đầu hành trình".
3. Track Tabs: "Networking" tab active by default.
4. CCNA block: Expands with Module 1 accordion showing "IPv4 Subnet Mask" lesson.
5. Lesson status icons render correctly (available for first lesson).
6. No console errors.

- [ ] **Step 2: Test navigation**

Click on the lesson item → should navigate to `/lesson/ipv4-subnet-mask`.
Click "Đăng xuất" → should redirect to `/login`.
