# Module 1 Stage 2: Subnetting Implementation Plan

**Goal:** Implement the 32-bit (4x8 Octet) LED visualizer and CIDR slider to demonstrate Network/Host logical separation and solve "The Broken Bridge" connectivity challenge.

**Architecture:** Use pure React state (`useState`/`useMemo`) to manage the current IPv4 integer value, CIDR value, and auto-calculate Subnet limits based on binary math. Sync this state across to the `BinaryLEDPanel` and `MiniTopology` to color code or un-break a connection bridge.

**Tech Stack:** React, TypeScript, Vitest, Vanilla CSS.

---

### Task 1: Subnetting Math Utilities

**Files:**
- Create: `simnet-d/src/utils/subnetEngine.ts`
- Create: `simnet-d/tests/utils/subnetEngine.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
import { expect, test } from 'vitest';
import { calculateSubnetBoundaries, getBitsFromIP } from '../../src/utils/subnetEngine';

test('calculate Subnet Boundaries for /24', () => {
    const limits = calculateSubnetBoundaries('192.168.1.10', 24);
    expect(limits.networkId).toBe('192.168.1.0');
    expect(limits.broadcastId).toBe('192.168.1.255');
});

test('get binary array from IP', () => {
    const bits = getBitsFromIP('192.168.1.10');
    expect(bits.length).toBe(32);
    // 192 = 11000000
    expect(bits.slice(0, 8).join('')).toBe('11000000');
});
```

- [ ] **Step 2: Run test & verify fail**
- [ ] **Step 3: Implement bitwise IP functions**
- [ ] **Step 4: Run test & verify pass**
- [ ] **Step 5: Commit**

---

### Task 2: CIDR Slider & Binary LED Panel Components

**Files:**
- Create: `simnet-d/src/components/module1/BinaryLEDPanel.tsx`
- Create: `simnet-d/src/components/module1/CIDRSlider.tsx`
- Create: `simnet-d/tests/components/BinaryLEDPanel.test.tsx`

- [ ] **Step 1: Write test to verify 32 LEDs render with proper network/host classes based on CIDR**
- [ ] **Step 2: Implement `BinaryLEDPanel`** ensuring it groups 32 DOM boxes into 4 `<div className="octet">` horizontal flex rows. Colors red for index < CIDR, blue for index >= CIDR.
- [ ] **Step 3: Implement `CIDRSlider`** as an `<input type="range" min="8" max="30">`.
- [ ] **Step 4: Run tests & Commit**

---

### Task 3: Mini-Topology & The Broken Bridge Challenge

**Files:**
- Create: `simnet-d/src/components/module1/MiniTopology.tsx`
- Create: `simnet-d/tests/components/MiniTopology.test.tsx`

- [ ] **Step 1: Write test**
Check if a bridge line is red when `192.168.1.10` and `192.168.2.10` are under `/24`, but turns green under `/22`.
- [ ] **Step 2: Implement Component**. 
Draw a left PC-A (`192.168.1.10`) and right PC-B (`192.168.2.10`). Re-use the `calculateSubnetBoundaries` from Task 1. If `networkId` matches for both under the chosen CIDR, `bridgeClass = 'bridge-success'`, else `bridgeClass = 'bridge-broken'`.
- [ ] **Step 3: Commit**

---

### Task 4: Layout Integration (Subnetting Page) & CSS

**Files:**
- Modify: `simnet-d/src/styles/module1.css` (add `.octet`, `.led`, `.bridge-success` styles)
- Create: `simnet-d/src/pages/modules/FundamentalsSubnetting.tsx`
- Modify: `simnet-d/src/Router.tsx`

- [ ] **Step 1: Wire the CIDR state up in the page container**.
- [ ] **Step 2: Add Route `/modules/1/subnetting`**.
- [ ] **Step 3: Apply the high-fidelity CSS styling to make it look like a physical Control Board**.
- [ ] **Step 4: Commit overall module completion**.
