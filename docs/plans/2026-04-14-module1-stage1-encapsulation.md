# Module 1 Stage 1: Encapsulation Implementation Plan

**Goal:** Implement the interactive Matryoshka-style network encapsulation visualizer with 5-state logic, step-by-step navigation, and the "MAC Mismatch" gamification test.

**Architecture:** We use an XState machine (`xstate`, `@xstate/react`) to manage the progression of encapsulation (`IDLE` -> `L4` -> `L3` -> `L2` -> `WIRE` -> `ERROR` or `SUCCESS`). The UI relies on conditional rendering and `framer-motion` to wrap the `PacketMatryoshka` layers. React Testing Library and Vitest are used for test-driven development.

**Tech Stack:** React, TypeScript, XState v5, Framer Motion, Vitest.

---

### Task 1: Setup Encapsulation State Machine

**Files:**
- Create: `simnet-d/src/machines/encapsulationMachine.ts`
- Create: `simnet-d/tests/machines/encapsulationMachine.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
import { createActor } from 'xstate';
import { encapsulationMachine } from '../../src/machines/encapsulationMachine';
import { expect, test } from 'vitest';

test('machine steps through encapsulation phases', () => {
  const actor = createActor(encapsulationMachine).start();
  expect(actor.getSnapshot().value).toBe('idle');
  
  actor.send({ type: 'NEXT_STEP' });
  expect(actor.getSnapshot().value).toBe('l4_packing');
  
  actor.send({ type: 'NEXT_STEP' });
  expect(actor.getSnapshot().value).toBe('l3_packing');
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npm test -- simnet-d/tests/machines/encapsulationMachine.test.ts`
Expected: FAIL with "encapsulationMachine is not defined"

- [ ] **Step 3: Write minimal implementation**
```typescript
import { setup, createMachine } from 'xstate';

export const encapsulationMachine = setup({
  types: {
    events: {} as { type: 'NEXT_STEP' } | { type: 'PREV_STEP' },
  },
}).createMachine({
  id: 'encapsulation',
  initial: 'idle',
  states: {
    idle: {
      on: { NEXT_STEP: 'l4_packing' }
    },
    l4_packing: {
      on: { NEXT_STEP: 'l3_packing', PREV_STEP: 'idle' }
    },
    l3_packing: {
      on: { NEXT_STEP: 'l2_packing', PREV_STEP: 'l4_packing' }
    },
    l2_packing: {
      on: { NEXT_STEP: 'on_wire', PREV_STEP: 'l3_packing' }
    },
    on_wire: {
      on: { NEXT_STEP: 'decapsulating', PREV_STEP: 'l2_packing' }
    },
    decapsulating: {
      on: { NEXT_STEP: 'delivered', PREV_STEP: 'on_wire' }
    },
    delivered: {
      type: 'final'
    }
  }
});
```

- [ ] **Step 4: Run test to verify it passes**
Run: `npm test -- simnet-d/tests/machines/encapsulationMachine.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add simnet-d/tests/machines/encapsulationMachine.test.ts simnet-d/src/machines/encapsulationMachine.ts
git commit -m "feat(module1): create encapsulation state machine"
```

---

### Task 2: Component - Packet Matryoshka

**Files:**
- Create: `simnet-d/src/components/module1/PacketMatryoshka.tsx`
- Create: `simnet-d/tests/components/PacketMatryoshka.test.tsx`

- [ ] **Step 1: Write the failing test**

```typescript
import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import PacketMatryoshka from '../../src/components/module1/PacketMatryoshka';

test('renders L3 layer inside L2 layer', () => {
    render(<PacketMatryoshka currentState="l2_packing" />);
    // Check if MAC text is outer, and IP is inner
    expect(screen.getByText('MAC: AABB')).toBeDefined();
    expect(screen.getByText('IP: 10.0.0.1')).toBeDefined();
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npm test -- simnet-d/tests/components/PacketMatryoshka.test.tsx`
Expected: FAIL because component doesn't exist.

- [ ] **Step 3: Write minimal implementation**
```tsx
import React from 'react';
import { motion } from 'framer-motion';
import './matryoshka.css';

export default function PacketMatryoshka({ currentState }: { currentState: string }) {
  const showL4 = ['l4_packing', 'l3_packing', 'l2_packing', 'on_wire'].includes(currentState);
  const showL3 = ['l3_packing', 'l2_packing', 'on_wire'].includes(currentState);
  const showL2 = ['l2_packing', 'on_wire'].includes(currentState);

  const payload = <div className="p-4 bg-gray-200">DATA</div>;

  const l4Wrap = showL4 ? <motion.div layout className="border-4 border-orange-500 p-2">Port: 80 {payload}</motion.div> : payload;
  const l3Wrap = showL3 ? <motion.div layout className="border-4 border-blue-500 p-2">IP: 10.0.0.1 {l4Wrap}</motion.div> : l4Wrap;
  const l2Wrap = showL2 ? <motion.div layout className="border-4 border-purple-500 p-2">MAC: AABB {l3Wrap}</motion.div> : l3Wrap;

  return <div>{l2Wrap}</div>;
}
```

- [ ] **Step 4: Run test to verify it passes**
Run: `npm test -- simnet-d/tests/components/PacketMatryoshka.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add simnet-d/tests/components/PacketMatryoshka.test.tsx simnet-d/src/components/module1/PacketMatryoshka.tsx
git commit -m "feat(module1): create matryoshka visualization component"
```

---

### Task 3: Step Controls and X-Ray Logic

**Files:**
- Create: `simnet-d/src/components/module1/StepControls.tsx`
- Create: `simnet-d/src/components/module1/XRayTool.tsx`
- Create: `simnet-d/tests/components/StepControls.test.tsx`

- [ ] **Step 1: Write test & run**
- [ ] **Step 2: Implement simple Prev/Next buttons linking to state dispatcher**
- [ ] **Step 3: Commit**

---

### Task 4: Layout Integration

**Files:**
- Create: `simnet-d/src/pages/modules/FundamentalsEncapsulation.tsx`

Integrate machine hook and components to wire up the final page logic.
