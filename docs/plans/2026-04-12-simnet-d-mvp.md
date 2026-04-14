# SimNet-D MVP Implementation Plan

**Goal:** Xây dựng nền tảng SimNet-D chạy được với 1 bài mô phỏng hoàn chỉnh (IPv4 Subnet Mask), bao gồm Landing Page, Simulation Engine, Exercise System, và Gamification cơ bản.

**Architecture:** Vite + React SPA kết nối Supabase. TanStack Query quản lý remote state, XState điều khiển simulation flow, Zustand cho UI state. SVG topology renderer với Framer Motion animation. Supabase Auth + PostgreSQL + RLS + Edge Functions.

**Tech Stack:** Vite, React 18, TypeScript, TanStack Query, Zustand, XState v5, Framer Motion, Zod, Vitest, Vanilla CSS, Supabase, xterm.js

**Design Spec:** `docs/designs/2026-04-12-simnet-d-design.md`

---

## Phạm vi & Chia Plan

| Plan | Phạm vi | Trạng thái |
|---|---|---|
| **Plan 1 (này)** | Foundation + Landing + CCNA Lesson 1 hoàn chỉnh | 📌 Đang viết |
| Plan 2 | Auth + User Progress + Dashboard | Chưa bắt đầu |
| Plan 3 | Gamification (XP RPC, Streak, Achievements) | Chưa bắt đầu |
| Plan 4 | Review System + Analytics | Chưa bắt đầu |
| Plan 5 | CCNA Content (thêm 5-10 bài) | Chưa bắt đầu |

> Mỗi plan tạo ra phần mềm chạy được, kiểm tra được, deploy được.

---

## File Map (Plan 1)

### Scaffold & Config
```
[NEW] package.json                     — Dependencies + scripts
[NEW] vite.config.ts                   — Vite configuration
[NEW] tsconfig.json                    — TypeScript strict config
[NEW] vitest.config.ts                 — Vitest testing config
[NEW] index.html                       — Entry HTML
[NEW] .env.example                     — Supabase env template
```

### Styles
```
[NEW] src/styles/index.css             — Global styles + CSS variables + dark theme
[NEW] src/styles/components.css        — Component styles
[NEW] src/styles/animations.css        — Keyframe animations
```

### Core App
```
[NEW] src/main.tsx                     — React entry point + QueryClientProvider
[NEW] src/App.tsx                      — Root component + Router
[NEW] src/Router.tsx                   — React Router routes definition
```

### Lib
```
[NEW] src/lib/supabase.ts              — Supabase client init
[NEW] src/lib/queryClient.ts           — TanStack Query client config
[NEW] src/lib/schemas.ts               — Zod schemas for JSONB validation
[NEW] src/lib/types.ts                 — TypeScript types
[NEW] src/lib/constants.ts             — App constants
```

### Components — Common
```
[NEW] src/components/common/Button.tsx
[NEW] src/components/common/Card.tsx
[NEW] src/components/common/LoadingSpinner.tsx
```

### Components — Layout
```
[NEW] src/components/layout/Header.tsx
[NEW] src/components/layout/Footer.tsx
```

### Components — Simulation
```
[NEW] src/components/simulation/TopologyRenderer.tsx    — SVG topology with a11y
[NEW] src/components/simulation/DeviceNode.tsx           — Individual device SVG
[NEW] src/components/simulation/ConnectionLine.tsx       — Cable/link between devices
[NEW] src/components/simulation/PacketAnimation.tsx      — Animated packet dot
[NEW] src/components/simulation/NarrationPanel.tsx       — Step explanation text
[NEW] src/components/simulation/SimulationControls.tsx   — Play/Pause/Next/Prev
[NEW] src/components/simulation/SimulationErrorBoundary.tsx
```

### Components — Exercises
```
[NEW] src/components/exercises/ExerciseContainer.tsx     — Wrapper, routes exercise type
[NEW] src/components/exercises/FillIn.tsx                — Fill-in-the-blank input
[NEW] src/components/exercises/MultipleChoice.tsx        — MCQ single/multi select
[NEW] src/components/exercises/DragDrop.tsx              — Drag items to drop zones
[NEW] src/components/exercises/ExerciseFeedback.tsx      — Correct/incorrect animation
```

### Components — Gamification
```
[NEW] src/components/gamification/Confetti.tsx           — Celebration confetti
[NEW] src/components/gamification/CompletionScreen.tsx   — Score + celebration
```

### Pages
```
[NEW] src/pages/Landing.tsx            — Hero + features + CTA
[NEW] src/pages/LessonPage.tsx         — Main lesson (Learn + Practice)
```

### Simulation Engine
```
[NEW] src/machines/simulationMachine.ts — XState state machine
[NEW] src/engines/AnimationOrchestrator.ts — Async animation runner
```

### Utilities
```
[NEW] src/utils/networking.ts          — IP/subnet calculation functions
[NEW] src/utils/scoring.ts             — Score calculation
[NEW] src/utils/topology.ts            — resolveTopology (base + deltas merge)
```

### Stores
```
[NEW] src/stores/uiStore.ts            — Zustand UI state
```

### Assets
```
[NEW] src/assets/devices/pc.svg
[NEW] src/assets/devices/router.svg
[NEW] src/assets/devices/switch.svg
[NEW] src/assets/devices/server.svg
```

### Data (Local Mock — Supabase tích hợp ở Plan 2)
```
[NEW] src/data/lesson1.ts              — IPv4 Subnet Mask lesson data (hardcoded mock)
```

### Tests
```
[NEW] src/__tests__/networking.test.ts
[NEW] src/__tests__/scoring.test.ts
[NEW] src/__tests__/topology.test.ts
[NEW] src/__tests__/simulationMachine.test.ts
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `vitest.config.ts`, `index.html`, `.env.example`

- [ ] **Step 1: Init Vite + React + TypeScript project**

```bash
npx -y create-vite@latest ./ --template react-ts
```

- [ ] **Step 2: Install core dependencies**

```bash
npm install @tanstack/react-query zustand xstate @xstate/react framer-motion zod react-router-dom @supabase/supabase-js react-zoom-pan-pinch
```

- [ ] **Step 3: Install dev dependencies**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] **Step 4: Configure vitest.config.ts**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
  },
});
```

```typescript
// src/test-setup.ts
import '@testing-library/jest-dom';
```

- [ ] **Step 5: Create .env.example**

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

- [ ] **Step 6: Verify scaffold**

Run: `npm run dev`
Expected: Vite dev server starts on localhost:5173

- [ ] **Step 7: Commit**

```bash
git init
git add .
git commit -m "chore: scaffold Vite + React + TS project with dependencies"
```

---

## Task 2: Design System (CSS)

**Files:**
- Create: `src/styles/index.css`, `src/styles/components.css`, `src/styles/animations.css`

- [ ] **Step 1: Create global styles with CSS variables**

```css
/* src/styles/index.css */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  /* Background */
  --bg-primary: #0a0e1a;
  --bg-secondary: #111827;
  --bg-tertiary: #1a2035;
  --bg-card: rgba(17, 24, 39, 0.7);

  /* Accent */
  --accent-primary: #6366f1;
  --accent-secondary: #8b5cf6;
  --accent-tertiary: #a78bfa;
  --accent-gradient: linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa);

  /* Status */
  --success: #10b981;
  --success-bg: rgba(16, 185, 129, 0.1);
  --warning: #f59e0b;
  --warning-bg: rgba(245, 158, 11, 0.1);
  --error: #ef4444;
  --error-bg: rgba(239, 68, 68, 0.1);
  --info: #3b82f6;

  /* Text */
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;

  /* Simulation */
  --packet-icmp: #10b981;
  --packet-tcp: #3b82f6;
  --packet-arp: #f59e0b;
  --device-active: #6366f1;
  --connection-line: #334155;
  --connection-active: #6366f1;

  /* Glass */
  --glass-bg: rgba(255, 255, 255, 0.05);
  --glass-border: rgba(255, 255, 255, 0.1);
  --glass-blur: 12px;

  /* Sizing */
  --header-height: 64px;
  --border-radius: 12px;
  --border-radius-sm: 8px;
  --border-radius-lg: 16px;

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-normal: 250ms ease;
  --transition-slow: 400ms ease;

  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.5);
  --shadow-glow: 0 0 20px rgba(99, 102, 241, 0.3);
}

html {
  font-size: 16px;
  scroll-behavior: smooth;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  line-height: 1.6;
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code, pre, .mono {
  font-family: 'JetBrains Mono', monospace;
}

a {
  color: var(--accent-primary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

a:hover {
  color: var(--accent-secondary);
}

::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg-secondary);
}

::-webkit-scrollbar-thumb {
  background: var(--glass-border);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}
```

- [ ] **Step 2: Create component styles**

```css
/* src/styles/components.css */

/* === Glass Card === */
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: var(--border-radius);
  padding: 1.5rem;
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
}

.glass-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-glow);
}

/* === Button === */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius-sm);
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all var(--transition-fast);
}

.btn-primary {
  background: var(--accent-gradient);
  color: white;
  box-shadow: var(--shadow-sm);
}

.btn-primary:hover {
  box-shadow: var(--shadow-glow);
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--glass-bg);
  color: var(--text-primary);
  border: 1px solid var(--glass-border);
}

.btn-secondary:hover {
  border-color: var(--accent-primary);
  background: rgba(99, 102, 241, 0.1);
}

.btn-icon {
  width: 40px;
  height: 40px;
  padding: 0;
  border-radius: 50%;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

/* === Progress Bar === */
.progress-bar {
  width: 100%;
  height: 6px;
  background: var(--bg-tertiary);
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar__fill {
  height: 100%;
  background: var(--accent-gradient);
  border-radius: 3px;
  transition: width var(--transition-slow);
}

/* === Loading Spinner === */
.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--glass-border);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.spinner-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

/* === Badge === */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge-success {
  background: var(--success-bg);
  color: var(--success);
}

.badge-warning {
  background: var(--warning-bg);
  color: var(--warning);
}

.badge-error {
  background: var(--error-bg);
  color: var(--error);
}

/* === Tooltip === */
.tooltip {
  position: relative;
}

.tooltip::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.4rem 0.8rem;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-size: 0.75rem;
  border-radius: var(--border-radius-sm);
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--transition-fast);
}

.tooltip:hover::after {
  opacity: 1;
}
```

- [ ] **Step 3: Create animations**

```css
/* src/styles/animations.css */

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideInRight {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes glow {
  0%, 100% { box-shadow: 0 0 5px rgba(99, 102, 241, 0.3); }
  50% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.6); }
}

@keyframes packetMove {
  0% { offset-distance: 0%; }
  100% { offset-distance: 100%; }
}

@keyframes confettiDrop {
  0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
  100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
}

@keyframes highlightDevice {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.5) drop-shadow(0 0 8px var(--device-active)); }
}

@keyframes typewriter {
  from { width: 0; }
  to { width: 100%; }
}

.animate-fade-in {
  animation: fadeIn 0.4s ease forwards;
}

.animate-fade-in-up {
  animation: fadeInUp 0.6s ease forwards;
}

.animate-slide-in-right {
  animation: slideInRight 0.4s ease forwards;
}

.animate-pulse {
  animation: pulse 2s ease-in-out infinite;
}

.animate-glow {
  animation: glow 2s ease-in-out infinite;
}
```

- [ ] **Step 4: Import styles in main.tsx**

- [ ] **Step 5: Verify styles load correctly**

Run: `npm run dev`
Expected: Dark background (#0a0e1a), Inter font loaded

- [ ] **Step 6: Commit**

```bash
git add src/styles/
git commit -m "feat: add design system with CSS variables, components, animations"
```

---

## Task 3: Core Utilities + Tests (TDD)

**Files:**
- Create: `src/utils/networking.ts`, `src/utils/scoring.ts`, `src/utils/topology.ts`
- Test: `src/__tests__/networking.test.ts`, `src/__tests__/scoring.test.ts`, `src/__tests__/topology.test.ts`

- [ ] **Step 1: Write networking tests**

```typescript
// src/__tests__/networking.test.ts
import { describe, it, expect } from 'vitest';
import {
  ipToInt, intToIp,
  calculateNetworkAddress, calculateBroadcast,
  countHosts, cidrToMask, maskToCidr,
  isPrivateIp, getIpClass
} from '../utils/networking';

describe('IP Conversion', () => {
  it('converts IP string to integer', () => {
    expect(ipToInt('192.168.1.1')).toBe(3232235777);
  });
  it('converts integer to IP string', () => {
    expect(intToIp(3232235777)).toBe('192.168.1.1');
  });
});

describe('Subnet Calculations', () => {
  it('calculates network address for /24', () => {
    expect(calculateNetworkAddress('192.168.1.130', '255.255.255.0')).toBe('192.168.1.0');
  });
  it('calculates network address for /26', () => {
    expect(calculateNetworkAddress('192.168.1.130', '255.255.255.192')).toBe('192.168.1.128');
  });
  it('calculates broadcast for /24', () => {
    expect(calculateBroadcast('192.168.1.0', '255.255.255.0')).toBe('192.168.1.255');
  });
  it('calculates broadcast for /26', () => {
    expect(calculateBroadcast('192.168.1.128', '255.255.255.192')).toBe('192.168.1.191');
  });
  it('counts hosts for /24', () => {
    expect(countHosts(24)).toBe(254);
  });
  it('counts hosts for /26', () => {
    expect(countHosts(26)).toBe(62);
  });
  it('counts 0 hosts for /32', () => {
    expect(countHosts(32)).toBe(0);
  });
  it('counts 1 host for /31', () => {
    expect(countHosts(31)).toBe(0);
  });
});

describe('CIDR/Mask Conversion', () => {
  it('converts /24 to mask', () => {
    expect(cidrToMask(24)).toBe('255.255.255.0');
  });
  it('converts /26 to mask', () => {
    expect(cidrToMask(26)).toBe('255.255.255.192');
  });
  it('converts mask to /24', () => {
    expect(maskToCidr('255.255.255.0')).toBe(24);
  });
});

describe('IP Classification', () => {
  it('identifies Class A', () => {
    expect(getIpClass('10.0.0.1')).toBe('A');
  });
  it('identifies Class B', () => {
    expect(getIpClass('172.16.0.1')).toBe('B');
  });
  it('identifies Class C', () => {
    expect(getIpClass('192.168.1.1')).toBe('C');
  });
  it('identifies private IP', () => {
    expect(isPrivateIp('192.168.1.1')).toBe(true);
    expect(isPrivateIp('8.8.8.8')).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests — verify FAIL**

Run: `npx vitest run src/__tests__/networking.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement networking.ts**

```typescript
// src/utils/networking.ts

export function ipToInt(ip: string): number {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

export function intToIp(int: number): string {
  return [
    (int >>> 24) & 255,
    (int >>> 16) & 255,
    (int >>> 8) & 255,
    int & 255,
  ].join('.');
}

export function calculateNetworkAddress(ip: string, mask: string): string {
  return intToIp(ipToInt(ip) & ipToInt(mask));
}

export function calculateBroadcast(networkAddress: string, mask: string): string {
  const invertedMask = ~ipToInt(mask) >>> 0;
  return intToIp((ipToInt(networkAddress) | invertedMask) >>> 0);
}

export function countHosts(cidr: number): number {
  if (cidr >= 31) return 0;
  return Math.pow(2, 32 - cidr) - 2;
}

export function cidrToMask(cidr: number): string {
  const mask = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
  return intToIp(mask);
}

export function maskToCidr(mask: string): number {
  const bits = ipToInt(mask).toString(2);
  return (bits.match(/1/g) || []).length;
}

export function getIpClass(ip: string): string {
  const firstOctet = parseInt(ip.split('.')[0], 10);
  if (firstOctet < 128) return 'A';
  if (firstOctet < 192) return 'B';
  if (firstOctet < 224) return 'C';
  if (firstOctet < 240) return 'D';
  return 'E';
}

export function isPrivateIp(ip: string): boolean {
  const int = ipToInt(ip);
  return (
    (int >= ipToInt('10.0.0.0') && int <= ipToInt('10.255.255.255')) ||
    (int >= ipToInt('172.16.0.0') && int <= ipToInt('172.31.255.255')) ||
    (int >= ipToInt('192.168.0.0') && int <= ipToInt('192.168.255.255'))
  );
}
```

- [ ] **Step 4: Run networking tests — verify PASS**

Run: `npx vitest run src/__tests__/networking.test.ts`
Expected: ALL PASS

- [ ] **Step 5: Write scoring tests**

```typescript
// src/__tests__/scoring.test.ts
import { describe, it, expect } from 'vitest';
import { calculateScore, calculateXP } from '../utils/scoring';

describe('Score Calculation', () => {
  it('returns 100% for all correct', () => {
    expect(calculateScore(5, 5)).toBe(100);
  });
  it('returns 80% for 4/5', () => {
    expect(calculateScore(4, 5)).toBe(80);
  });
  it('returns 0% for none correct', () => {
    expect(calculateScore(0, 5)).toBe(0);
  });
});

describe('XP Calculation', () => {
  it('gives base XP for lesson', () => {
    expect(calculateXP(100, 80, 1.0)).toBe(100);
  });
  it('gives bonus for perfect score', () => {
    expect(calculateXP(100, 100, 1.0)).toBe(150); // 100 + 50 bonus
  });
  it('applies streak multiplier', () => {
    expect(calculateXP(100, 80, 1.5)).toBe(150); // 100 * 1.5
  });
  it('applies streak + perfect bonus', () => {
    expect(calculateXP(100, 100, 1.5)).toBe(225); // (100 + 50) * 1.5
  });
});
```

- [ ] **Step 6: Implement scoring.ts**

```typescript
// src/utils/scoring.ts

export function calculateScore(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

export function calculateXP(
  baseXP: number,
  scorePercent: number,
  streakMultiplier: number = 1.0
): number {
  const perfectBonus = scorePercent === 100 ? 50 : 0;
  return Math.floor((baseXP + perfectBonus) * streakMultiplier);
}
```

- [ ] **Step 7: Run scoring tests — verify PASS**

Run: `npx vitest run src/__tests__/scoring.test.ts`
Expected: ALL PASS

- [ ] **Step 8: Write topology merge tests**

```typescript
// src/__tests__/topology.test.ts
import { describe, it, expect } from 'vitest';
import { resolveTopology } from '../utils/topology';

const baseTopology = {
  devices: [
    { id: 'pc-a', type: 'pc' as const, label: 'PC-A', x: 100, y: 200, ip: '192.168.1.10' },
    { id: 'router-1', type: 'router' as const, label: 'R1', x: 400, y: 200 },
  ],
  connections: [
    { from: 'pc-a', to: 'router-1', label: 'Fa0/0' },
  ],
};

describe('resolveTopology', () => {
  it('returns base when no deltas', () => {
    const result = resolveTopology(baseTopology);
    expect(result).toEqual({ ...baseTopology, labels: [] });
  });

  it('applies device modifications', () => {
    const deltas = {
      modify_devices: [{ id: 'pc-a', highlight: true }],
    };
    const result = resolveTopology(baseTopology, deltas);
    expect(result.devices[0]).toEqual({ ...baseTopology.devices[0], highlight: true });
    expect(result.devices[1]).toEqual(baseTopology.devices[1]); // unchanged
  });

  it('applies connection modifications', () => {
    const deltas = {
      modify_connections: [{ from: 'pc-a', to: 'router-1', color: '#10b981' }],
    };
    const result = resolveTopology(baseTopology, deltas);
    expect(result.connections[0].color).toBe('#10b981');
  });

  it('adds labels', () => {
    const deltas = {
      add_labels: [{ target: 'pc-a', text: 'SRC', position: 'bottom' as const }],
    };
    const result = resolveTopology(baseTopology, deltas);
    expect(result.labels).toHaveLength(1);
    expect(result.labels![0].text).toBe('SRC');
  });
});
```

- [ ] **Step 9: Implement topology.ts**

```typescript
// src/utils/topology.ts
import type { TopologyConfig, TopologyDeltas, TopologyLabel } from '../lib/types';

export function resolveTopology(
  base: TopologyConfig,
  deltas?: TopologyDeltas
): TopologyConfig & { labels: TopologyLabel[] } {
  if (!deltas) return { ...base, labels: base.labels || [] };

  return {
    devices: base.devices.map((device) => {
      const delta = deltas.modify_devices?.find((d) => d.id === device.id);
      return delta ? { ...device, ...delta } : device;
    }),
    connections: base.connections.map((conn) => {
      const delta = deltas.modify_connections?.find(
        (c) => c.from === conn.from && c.to === conn.to
      );
      return delta ? { ...conn, ...delta } : conn;
    }),
    labels: [...(base.labels || []), ...(deltas.add_labels || [])],
  };
}
```

- [ ] **Step 10: Run all tests — verify PASS**

Run: `npx vitest run`
Expected: ALL PASS

- [ ] **Step 11: Commit**

```bash
git add src/utils/ src/__tests__/
git commit -m "feat: add core utilities (networking, scoring, topology) with TDD"
```

---

## Task 4: TypeScript Types + Zod Schemas

**Files:**
- Create: `src/lib/types.ts`, `src/lib/schemas.ts`

- [ ] **Step 1: Define TypeScript types**

```typescript
// src/lib/types.ts

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
  modify_devices?: Partial<Device & { id: string }>[];
  modify_connections?: Partial<Connection & { from: string; to: string }>[];
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
  context?: any;
  config: any;
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
    answers: any[];
  };
  best_score?: number;
  xp_earned: number;
}
```

- [ ] **Step 2: Define Zod schemas**

```typescript
// src/lib/schemas.ts
import { z } from 'zod';

export const DeviceSchema = z.object({
  id: z.string(),
  type: z.enum(['pc', 'router', 'switch', 'server', 'firewall', 'cloud']),
  label: z.string(),
  x: z.number(),
  y: z.number(),
  ip: z.string().optional(),
  subnet: z.string().optional(),
  highlight: z.boolean().optional(),
  status: z.string().optional(),
  error_message: z.string().optional(),
});

export const ConnectionSchema = z.object({
  from: z.string(),
  to: z.string(),
  label: z.string().optional(),
  color: z.string().optional(),
  animated: z.boolean().optional(),
  status: z.string().optional(),
  dashed: z.boolean().optional(),
});

export const TopologyConfigSchema = z.object({
  devices: z.array(DeviceSchema),
  connections: z.array(ConnectionSchema),
  labels: z.array(z.object({
    target: z.string(),
    text: z.string(),
    position: z.enum(['top', 'bottom', 'left', 'right']),
  })).optional(),
});

export const AnimationConfigSchema = z.object({
  type: z.enum(['packet_flow', 'highlight', 'transform']),
  packet: z.object({ label: z.string(), color: z.string() }).optional(),
  path: z.array(z.string()).optional(),
  speed: z.number().default(1500),
  pause_at: z.string().optional(),
  pause_narration: z.string().optional(),
});

export const TopologyDeltasSchema = z.object({
  modify_devices: z.array(DeviceSchema.partial().extend({ id: z.string() })).optional(),
  modify_connections: z.array(ConnectionSchema.partial().extend({
    from: z.string(),
    to: z.string(),
  })).optional(),
  add_labels: z.array(z.object({
    target: z.string(),
    text: z.string(),
    position: z.enum(['top', 'bottom', 'left', 'right']),
  })).optional(),
});
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/types.ts src/lib/schemas.ts
git commit -m "feat: add TypeScript types and Zod validation schemas"
```

---

## Task 5: XState Simulation Machine + Tests

**Files:**
- Create: `src/machines/simulationMachine.ts`
- Test: `src/__tests__/simulationMachine.test.ts`

- [ ] **Step 1: Write simulation machine tests**

```typescript
// src/__tests__/simulationMachine.test.ts
import { describe, it, expect } from 'vitest';
import { createActor } from 'xstate';
import { simulationMachine } from '../machines/simulationMachine';

describe('SimulationMachine', () => {
  it('starts in idle state', () => {
    const actor = createActor(simulationMachine);
    actor.start();
    expect(actor.getSnapshot().value).toBe('idle');
    actor.stop();
  });

  it('transitions to playing on START', () => {
    const actor = createActor(simulationMachine, {
      input: { totalSteps: 3 },
    });
    actor.start();
    actor.send({ type: 'START' });
    expect(actor.getSnapshot().value).toBe('playing');
    expect(actor.getSnapshot().context.currentStep).toBe(0);
    actor.stop();
  });

  it('pauses and resumes', () => {
    const actor = createActor(simulationMachine, {
      input: { totalSteps: 3 },
    });
    actor.start();
    actor.send({ type: 'START' });
    actor.send({ type: 'PAUSE' });
    expect(actor.getSnapshot().value).toBe('paused');
    actor.send({ type: 'RESUME' });
    expect(actor.getSnapshot().value).toBe('playing');
    actor.stop();
  });

  it('advances to next step', () => {
    const actor = createActor(simulationMachine, {
      input: { totalSteps: 3 },
    });
    actor.start();
    actor.send({ type: 'START' });
    actor.send({ type: 'NEXT_STEP' });
    expect(actor.getSnapshot().context.currentStep).toBe(1);
    actor.stop();
  });

  it('goes to previous step', () => {
    const actor = createActor(simulationMachine, {
      input: { totalSteps: 3 },
    });
    actor.start();
    actor.send({ type: 'START' });
    actor.send({ type: 'NEXT_STEP' });
    actor.send({ type: 'PREV_STEP' });
    expect(actor.getSnapshot().context.currentStep).toBe(0);
    actor.stop();
  });

  it('completes when reaching last step', () => {
    const actor = createActor(simulationMachine, {
      input: { totalSteps: 2 },
    });
    actor.start();
    actor.send({ type: 'START' });
    actor.send({ type: 'NEXT_STEP' });
    actor.send({ type: 'NEXT_STEP' });
    expect(actor.getSnapshot().value).toBe('completed');
    actor.stop();
  });
});
```

- [ ] **Step 2: Run tests — verify FAIL**

Run: `npx vitest run src/__tests__/simulationMachine.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement simulationMachine.ts**

```typescript
// src/machines/simulationMachine.ts
import { setup, assign } from 'xstate';

interface SimulationContext {
  currentStep: number;
  totalSteps: number;
}

type SimulationEvent =
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'RESET' };

export const simulationMachine = setup({
  types: {
    context: {} as SimulationContext,
    events: {} as SimulationEvent,
    input: {} as { totalSteps: number },
  },
}).createMachine({
  id: 'simulation',
  initial: 'idle',
  context: ({ input }) => ({
    currentStep: 0,
    totalSteps: input?.totalSteps ?? 0,
  }),
  states: {
    idle: {
      on: {
        START: {
          target: 'playing',
          actions: assign({ currentStep: 0 }),
        },
      },
    },
    playing: {
      on: {
        PAUSE: 'paused',
        NEXT_STEP: [
          {
            guard: ({ context }) => context.currentStep >= context.totalSteps - 1,
            target: 'completed',
          },
          {
            actions: assign({
              currentStep: ({ context }) => context.currentStep + 1,
            }),
          },
        ],
        PREV_STEP: {
          actions: assign({
            currentStep: ({ context }) => Math.max(0, context.currentStep - 1),
          }),
        },
        RESET: {
          target: 'idle',
          actions: assign({ currentStep: 0 }),
        },
      },
    },
    paused: {
      on: {
        RESUME: 'playing',
        NEXT_STEP: [
          {
            guard: ({ context }) => context.currentStep >= context.totalSteps - 1,
            target: 'completed',
          },
          {
            target: 'playing',
            actions: assign({
              currentStep: ({ context }) => context.currentStep + 1,
            }),
          },
        ],
        PREV_STEP: {
          target: 'playing',
          actions: assign({
            currentStep: ({ context }) => Math.max(0, context.currentStep - 1),
          }),
        },
        RESET: {
          target: 'idle',
          actions: assign({ currentStep: 0 }),
        },
      },
    },
    completed: {
      on: {
        RESET: {
          target: 'idle',
          actions: assign({ currentStep: 0 }),
        },
      },
    },
  },
});
```

- [ ] **Step 4: Run tests — verify PASS**

Run: `npx vitest run src/__tests__/simulationMachine.test.ts`
Expected: ALL PASS

- [ ] **Step 5: Commit**

```bash
git add src/machines/ src/__tests__/simulationMachine.test.ts
git commit -m "feat: add XState simulation state machine with TDD"
```

---

## Task 6: SVG Device Assets

**Files:**
- Create: `src/assets/devices/pc.svg`, `router.svg`, `switch.svg`, `server.svg`

- [ ] **Step 1: Create SVG device icons**

Tạo các SVG icons tối giản, futuristic style, phù hợp dark theme.
Mỗi icon khoảng 64x64, dùng stroke style với accent colors.

- [ ] **Step 2: Commit**

```bash
git add src/assets/
git commit -m "feat: add SVG device icons (pc, router, switch, server)"
```

---

## Task 7: Lesson 1 Mock Data

**Files:**
- Create: `src/data/lesson1.ts`

- [ ] **Step 1: Create IPv4 Subnet Mask lesson data**

Tạo dữ liệu hoàn chỉnh cho bài học đầu tiên bao gồm:
- `base_topology`: 3 thiết bị (PC-A, Router, PC-B)
- 6 `simulation_steps` với topology_deltas + animation_config
- 5 `exercises` (fill_in, multiple_choice, drag_drop)

Dữ liệu tuân theo TypeScript types đã định nghĩa ở Task 4.

- [ ] **Step 2: Commit**

```bash
git add src/data/
git commit -m "feat: add CCNA Lesson 1 (IPv4 Subnet Mask) mock data"
```

---

## Task 8: Simulation Components (SVG Topology)

**Files:**
- Create: Tất cả files trong `src/components/simulation/`

- [ ] **Step 1: Create DeviceNode.tsx** — SVG component render 1 thiết bị với a11y (title, desc, aria-label, tabIndex)

- [ ] **Step 2: Create ConnectionLine.tsx** — SVG line giữa 2 devices, hỗ trợ animated/dashed/color

- [ ] **Step 3: Create PacketAnimation.tsx** — Framer Motion animated dot di chuyển dọc connection path

- [ ] **Step 4: Create TopologyRenderer.tsx** — Container SVG với viewBox, render devices + connections + labels + zoom/pan

- [ ] **Step 5: Create NarrationPanel.tsx** — Text panel hiển thị narration cho step hiện tại

- [ ] **Step 6: Create SimulationControls.tsx** — Play/Pause/Next/Prev buttons kết nối XState

- [ ] **Step 7: Create SimulationErrorBoundary.tsx** — React Error Boundary catch simulation crashes

- [ ] **Step 8: Verify topology renders** — Tạo test page render base_topology từ lesson1 mock data

- [ ] **Step 9: Commit**

```bash
git add src/components/simulation/
git commit -m "feat: add simulation components (topology, animation, controls)"
```

---

## Task 9: Exercise Components

**Files:**
- Create: Tất cả files trong `src/components/exercises/`

- [ ] **Step 1: Create FillIn.tsx** — Input field, validate answer, instant feedback

- [ ] **Step 2: Create MultipleChoice.tsx** — 4 options grid, click to select, highlight correct/incorrect

- [ ] **Step 3: Create DragDrop.tsx** — Draggable items + drop zones (dùng HTML5 drag API hoặc framer-motion drag)

- [ ] **Step 4: Create ExerciseFeedback.tsx** — ✅/❌ animation + explanation text display

- [ ] **Step 5: Create ExerciseContainer.tsx** — Switch exercise type, track answers, next/submit

- [ ] **Step 6: Verify exercises work** — Test với lesson1 mock data

- [ ] **Step 7: Commit**

```bash
git add src/components/exercises/
git commit -m "feat: add exercise components (fill-in, MCQ, drag-drop)"
```

---

## Task 10: Gamification Components

**Files:**
- Create: `src/components/gamification/Confetti.tsx`, `CompletionScreen.tsx`

- [ ] **Step 1: Create Confetti.tsx** — CSS-only confetti animation (30 particles, random colors, drop animation)

- [ ] **Step 2: Create CompletionScreen.tsx** — Score summary card + Confetti trigger + "Next Lesson" button

- [ ] **Step 3: Commit**

```bash
git add src/components/gamification/
git commit -m "feat: add gamification components (confetti, completion screen)"
```

---

## Task 11: LessonPage (Main Page)

**Files:**
- Create: `src/pages/LessonPage.tsx`

- [ ] **Step 1: Create LessonPage.tsx** — Container page quản lý 3 phases:
  1. **Learn**: TopologyRenderer + NarrationPanel + SimulationControls (XState)
  2. **Practice**: ExerciseContainer
  3. **Complete**: CompletionScreen

- [ ] **Step 2: Integrate XState** — useActor(simulationMachine) điều khiển Learn phase

- [ ] **Step 3: Implement phase transitions** — Learn → Practice → Complete với smooth CSS transition

- [ ] **Step 4: Add progress bar** — Hiển thị step X/N hoặc exercise X/M

- [ ] **Step 5: Verify full lesson flow** — Từ landing → learn → practice → complete

- [ ] **Step 6: Commit**

```bash
git add src/pages/LessonPage.tsx
git commit -m "feat: add LessonPage with learn/practice/complete flow"
```

---

## Task 12: Landing Page

**Files:**
- Create: `src/pages/Landing.tsx`

- [ ] **Step 1: Create Landing.tsx** với:
  - **Hero section**: Animated topology SVG background + tagline + CTA button
  - **Features section**: 4 glassmorphism cards (Mô phỏng trực quan, Bài tập tương tác, Kiểm tra kiến thức, Chứng chỉ)
  - **Track preview**: CCNA card với link tới lesson

- [ ] **Step 2: Add responsive layout** — Mobile-first, breakpoints 768px/1024px

- [ ] **Step 3: Add micro-animations** — Framer Motion fade-in-up cho sections khi scroll

- [ ] **Step 4: Commit**

```bash
git add src/pages/Landing.tsx
git commit -m "feat: add Landing Page with hero, features, track preview"
```

---

## Task 13: Layout + Routing

**Files:**
- Create: `src/components/layout/Header.tsx`, `Footer.tsx`
- Create: `src/Router.tsx`
- Modify: `src/App.tsx`, `src/main.tsx`

- [ ] **Step 1: Create Header.tsx** — Logo + nav links + glassmorphism bar

- [ ] **Step 2: Create Footer.tsx** — Copyright + links

- [ ] **Step 3: Create Router.tsx** — Routes: `/` → Landing, `/lesson/1` → LessonPage

- [ ] **Step 4: Update App.tsx** — Wrap Router + layout

- [ ] **Step 5: Update main.tsx** — Add QueryClientProvider, import styles

- [ ] **Step 6: Verify routing works**

Run: `npm run dev`
Expected: Landing page at `/`, Lesson page at `/lesson/1`

- [ ] **Step 7: Commit**

```bash
git add src/
git commit -m "feat: add layout, routing, and app entry point"
```

---

## Task 14: Build Verification + Polish

- [ ] **Step 1: Run all tests**

Run: `npx vitest run`
Expected: ALL PASS

- [ ] **Step 2: Build production bundle**

Run: `npm run build`
Expected: Build succeeds, no TS errors

- [ ] **Step 3: Preview production build**

Run: `npm run preview`
Expected: App works correctly at preview URL

- [ ] **Step 4: Visual QA**
- Landing page: Hero renders, cards animate
- Lesson page: Topology renders SVGs, animation plays
- Exercises: Fill-in, MCQ, Drag-drop all functional
- Completion: Confetti fires, score displays
- Mobile: Responsive at 375px width

- [ ] **Step 5: Final commit**

```bash
git add .
git commit -m "feat: SimNet-D MVP — Landing Page + CCNA Lesson 1 complete"
```

---

## Tóm tắt Plan 1

| Task | Nội dung | Estimate |
|---|---|---|
| 1 | Project scaffold | 5 min |
| 2 | Design system (CSS) | 15 min |
| 3 | Core utilities + TDD | 20 min |
| 4 | Types + Zod schemas | 10 min |
| 5 | XState machine + TDD | 15 min |
| 6 | SVG device assets | 10 min |
| 7 | Lesson 1 mock data | 15 min |
| 8 | Simulation components | 45 min |
| 9 | Exercise components | 40 min |
| 10 | Gamification components | 15 min |
| 11 | LessonPage | 30 min |
| 12 | Landing page | 30 min |
| 13 | Layout + routing | 15 min |
| 14 | Build verification | 10 min |
| **Total** | | **~4.5 hours** |

> **Sau Plan 1:** Có một ứng dụng chạy được với Landing Page đẹp + 1 bài mô phỏng IPv4 Subnetting hoàn chỉnh (Learn → Practice → Complete). Chưa có auth, chưa lưu progress (sẽ ở Plan 2).
