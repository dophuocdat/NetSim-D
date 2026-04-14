# Module 1 Stage 3: Supabase Database Integration Plan

**Goal:** Remove all hardcoded configurations (IPs, MACs, Ports) from the React components in Màn 1 and Màn 2. Refactor them to pull data dynamically from the `public.lessons` table via Supabase RPCs/Filters using a custom hook.

**Architecture:** Create a robust React Query hook (`useLessonData`) that fetches metadata and `base_topology` JSON objects. Seed the mock DB with actual lesson rows.

**Tech Stack:** React, `@tanstack/react-query`, Supabase-js, Postgres (Seed).

---

### Task 1: Supabase DB Seeding (Mock Data Prep)

**Files:**
- Create: `simnet-d/supabase/seed.sql` (if using local CLI) or direct Postgres Query.

- [ ] **Step 1: Write SQL Queries** 
Create a dummy `Module 1` in `public.modules`.
Create two lessons in `public.lessons` with `slug='encapsulation'` and `slug='subnetting'`.
- [ ] **Step 2: JSONB Payload**
Inject `base_topology` for `encapsulation`:
```json
{
  "source": { "name": "PC-A", "ip": "10.0.0.1", "mac": "AABB", "port": "Random" },
  "destination": { "name": "Server_B", "ip": "10.0.0.50", "mac": "CCDD", "port": "80 (HTTP)" },
  "payload": "HTTP DATA"
}
```
Inject `base_topology` for `subnetting`:
```json
{
  "devices": {
    "pcA": { "name": "PC-A", "ip": "192.168.1.10" },
    "pcB": { "name": "PC-B", "ip": "192.168.2.10" }
  },
  "defaultCidr": 24,
  "targetCidr": 22
}
```
- [ ] **Step 3: Run Seed command via MCP Execute SQL or Supabase Studio**.

---

### Task 2: Custom Hook `useLessonData`

**Files:**
- Create: `simnet-d/src/hooks/useLessonData.ts`

- [ ] **Step 1: Implement custom hook**
Leverage `@tanstack/react-query` to fetch from `supabase.from('lessons').select('*').eq('slug', slug).single()`.
- [ ] **Step 2: Add validation**
Verify that the lesson exists and that it includes `base_topology`.

---

### Task 3: Refactor FundamentalsEncapsulation 

**Files:**
- Modify: `simnet-d/src/pages/modules/FundamentalsEncapsulation.tsx`

- [ ] **Step 1: Replace hardcode** 
Call `const { data, isLoading } = useLessonData('encapsulation');`.
- [ ] **Step 2: Add Loading State**
Show a Spinner if `isLoading` is true.
- [ ] **Step 3: Update `PacketMatryoshka` and `XRayTool` props**
Use `data.base_topology.source.ip` instead of `'10.0.0.1'`.

---

### Task 4: Refactor FundamentalsSubnetting

**Files:**
- Modify: `simnet-d/src/pages/modules/FundamentalsSubnetting.tsx`

- [ ] **Step 1: Replace hardcode**
Call `const { data, isLoading } = useLessonData('subnetting');`.
- [ ] **Step 2: Add initial state sync**
Set the slider's initial state using `data.base_topology.defaultCidr`.
- [ ] **Step 3: Update `MiniTopology` props**
Use `pcA.ip` and `pcB.ip` from the database.

---
**Definition of Done:** Components render dynamically based on backend state and crash gracefully if data is missing.
