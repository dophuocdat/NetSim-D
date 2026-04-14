# SimNet-D — Thiết kế hệ thống

> Nền tảng mô phỏng Networking tương tác cho CCNA/CCNP, mở rộng sang Cybersecurity & System Administration.

**Ngày tạo:** 2026-04-12  
**Phiên bản:** 1.0  
**Trạng thái:** Draft

---

## 1. Tổng quan

### 1.1 Mục tiêu
SimNet-D là nền tảng học tập networking thông qua **mô phỏng trực quan** và **bài tập tương tác**. Người dùng sẽ hiểu các khái niệm networking (IPv4 Subnetting, VLAN, Routing, NAT...) thông qua animation minh họa luồng dữ liệu, sau đó thực hành ngay để kiểm chứng kiến thức.

### 1.2 Đối tượng sử dụng
- **Cá nhân**: Công cụ ôn tập, tự học
- **Cộng đồng**: Bất kỳ ai đang học Networking (sinh viên, kỹ sư mạng, người chuyển ngành)

### 1.3 Phạm vi MVP
- Tập trung **CCNA** và **CCNP** (track Networking)
- Kiến trúc mở rộng cho các chuyên ngành khác (Cybersecurity, System Admin)
- 5-10 bài mô phỏng cốt lõi mỗi certification

### 1.4 Nguyên tắc thiết kế
- **Nội dung chuẩn xác**: Hướng tới cộng đồng, mọi thông tin phải đúng theo chuẩn Cisco
- **Learn → Practice**: Mỗi bài luôn có phần mô phỏng trước, thực hành sau
- **Gamification nhẹ**: Khích lệ, không gây áp lực
- **Progressive disclosure**: Không hiển thị quá nhiều thông tin cùng lúc

---

## 2. Kiến trúc hệ thống

### 2.1 Tổng quan kiến trúc

```
┌─────────────────────────────────────────────────────┐
│              Frontend (Vite + React + TS)            │
│                                                       │
│  ┌────────────┐  ┌────────────┐  ┌────────────────┐  │
│  │  Landing   │  │  Course    │  │  Simulation    │  │
│  │  Page      │  │  Browser   │  │  Engine        │  │
│  └────────────┘  └────────────┘  └────────────────┘  │
│  ┌────────────┐  ┌────────────┐  ┌────────────────┐  │
│  │  Auth      │  │  Progress  │  │  Quiz/Review   │  │
│  │  Pages     │  │  Tracker   │  │  System        │  │
│  └────────────┘  └────────────┘  └────────────────┘  │
│  ┌────────────┐  ┌────────────┐                      │
│  │  Profile   │  │  Achieve-  │                      │
│  │  Page      │  │  ments     │                      │
│  └────────────┘  └────────────┘                      │
└──────────────────────┬──────────────────────────────┘
                       │ @supabase/supabase-js
┌──────────────────────▼──────────────────────────────┐
│                Supabase Backend                       │
│                                                       │
│  ┌────────┐  ┌────────────┐  ┌────────────────────┐  │
│  │  Auth  │  │  PostgreSQL │  │  Edge Functions   │  │
│  │  (JWT) │  │  + RLS      │  │  (Score, Review)  │  │
│  └────────┘  └────────────┘  └────────────────────┘  │
│  ┌────────┐                                          │
│  │Storage │  (images, topology assets)               │
│  └────────┘                                          │
└──────────────────────────────────────────────────────┘
```

### 2.2 Tech Stack

| Layer | Technology | Lý do chọn |
|---|---|---|
| **Frontend** | Vite + React 18 + TypeScript | Nhẹ, nhanh, phù hợp SPA tương tác |
| **Styling** | Vanilla CSS | Toàn quyền kiểm soát, dark theme custom |
| **Animation** | Framer Motion + SVG | Mượt mà, declarative, phù hợp React |
| **Routing** | React Router v6 | Standard, nested routes |
| **Remote State** | TanStack Query (React Query) | Cache, retry, loading/error states cho Supabase data |
| **UI State** | Zustand | Chỉ UI state: theme, sidebar, modal open/close |
| **Simulation State** | XState v5 | Finite State Machine cho simulation flow |
| **Backend/DB** | Supabase (PostgreSQL) | Auth + DB + RLS + Edge Functions sẵn |
| **Auth** | Supabase Auth | Email/password + OAuth (Google, GitHub) |
| **Deploy Frontend** | Vercel hoặc Netlify | Free tier, auto deploy từ Git |
| **Deploy Backend** | Supabase Cloud | Free tier đủ dùng ban đầu |

> **Phân tách State rõ ràng:**
> - **TanStack Query** = mọi data từ Supabase (courses, lessons, progress, achievements)
> - **Zustand** = UI state thuần túy (theme, sidebar toggle, modal state)
> - **XState** = simulation animation flow (play/pause/step)

---

## 3. Database Schema

### 3.1 Sơ đồ quan hệ

```
tracks
  ├── certifications
  │     ├── modules
  │     │     ├── lessons
  │     │     │     ├── simulation_steps   (nội dung mô phỏng từng bước)
  │     │     │     ├── exercises           (bài tập tương tác)
  │     │     │     └── user_progress       (tiến trình user)
  │     │     └── review_quizzes           (câu hỏi ôn tập)
  │     └── user_cert_progress             (tiến trình theo certification)
  └── ...

achievements          (huy hiệu)
user_achievements      (huy hiệu đã nhận)
user_streaks           (chuỗi ngày học liên tiếp)
```

### 3.2 Chi tiết bảng

#### `tracks` — Chuyên ngành
```sql
CREATE TABLE tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                    -- 'Networking', 'Cybersecurity', 'System Admin'
  slug TEXT NOT NULL UNIQUE,             -- 'networking', 'cybersecurity'
  description TEXT,
  icon_url TEXT,                         -- icon đại diện
  color TEXT,                            -- accent color cho track
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `certifications` — Chứng chỉ
```sql
CREATE TABLE certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                    -- 'CCNA', 'CCNP Enterprise'
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  difficulty_level INT NOT NULL,         -- 1=Beginner, 2=Intermediate, 3=Advanced
  icon_url TEXT,
  estimated_hours INT,                   -- ước tính thời gian hoàn thành
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `modules` — Nhóm bài học
```sql
CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certification_id UUID NOT NULL REFERENCES certifications(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                    -- 'IP Addressing & Subnetting'
  slug TEXT NOT NULL,
  description TEXT,
  display_order INT NOT NULL DEFAULT 0,
  lessons_before_review INT DEFAULT 3,  -- sau bao nhiêu bài thì review
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(certification_id, slug)
);
```

#### `lessons` — Bài học cụ thể
```sql
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,                   -- 'IPv4 Subnet Mask Cơ bản'
  slug TEXT NOT NULL,
  description TEXT,                      -- mô tả ngắn
  objectives TEXT[],                     -- mục tiêu bài học ["Hiểu subnet mask", "Tính CIDR"]
  difficulty INT DEFAULT 1,              -- 1-5
  xp_reward INT DEFAULT 100,            -- điểm XP khi hoàn thành
  base_topology JSONB,                   -- ⭐ Sơ đồ mạng gốc (đẩy lên từ simulation_steps)
  display_order INT NOT NULL DEFAULT 0,
  is_free BOOLEAN DEFAULT true,          -- bài miễn phí (cho guest)
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(module_id, slug)
);
```

#### `simulation_steps` — Các bước mô phỏng trực quan
```sql
CREATE TABLE simulation_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  step_order INT NOT NULL,
  title TEXT NOT NULL,                   -- 'Gói tin rời máy tính A'
  narration TEXT NOT NULL,               -- giải thích chi tiết
  topology_deltas JSONB,                 -- ⭐ Chỉ lưu THAY ĐỔI so với base_topology
  animation_config JSONB NOT NULL,       -- cấu hình animation (packet path, highlights)
  highlight_elements TEXT[],             -- elements cần highlight trong bước này
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(lesson_id, step_order)
);
```

> **Tại sao tách `base_topology` lên `lessons`?**
> - Tránh lặp JSON topology đầy đủ ở mỗi step (CCNP 20 thiết bị × 10 steps = 10 bản sao!)
> - Khi sửa IP của 1 thiết bị, chỉ sửa 1 nơi duy nhất
> - Mỗi step chỉ lưu delta (thay đổi) so với gốc

**Ví dụ `base_topology` (trong `lessons`):**
```json
{
  "devices": [
    {"id": "pc-a", "type": "pc", "label": "PC-A", "x": 100, "y": 200, "ip": "192.168.1.10", "subnet": "255.255.255.0"},
    {"id": "router-1", "type": "router", "label": "R1", "x": 400, "y": 200},
    {"id": "pc-b", "type": "pc", "label": "PC-B", "x": 700, "y": 200, "ip": "192.168.2.10", "subnet": "255.255.255.0"}
  ],
  "connections": [
    {"from": "pc-a", "to": "router-1", "label": "Fa0/0"},
    {"from": "router-1", "to": "pc-b", "label": "Fa0/1"}
  ]
}
```

**Ví dụ `topology_deltas` (trong `simulation_steps`):**
```json
{
  "modify_devices": [
    {"id": "pc-a", "highlight": true, "status": "sending"}
  ],
  "modify_connections": [
    {"from": "pc-a", "to": "router-1", "color": "#10b981", "animated": true}
  ],
  "add_labels": [
    {"target": "pc-a", "text": "SRC: 192.168.1.10", "position": "bottom"}
  ]
}
```
*→ Step này chỉ thay đổi: highlight PC-A, đổi màu cable, thêm label. Base topology giữ nguyên.*

**Ví dụ `topology_deltas` cho step "cáp bị đứt":**
```json
{
  "modify_connections": [
    {"from": "pc-a", "to": "router-1", "status": "disconnected", "color": "#ef4444", "dashed": true}
  ],
  "modify_devices": [
    {"id": "pc-a", "status": "error", "error_message": "Destination host unreachable"}
  ]
}
```

**Frontend merge logic:**
```typescript
// Merge base topology + deltas cho mỗi step
function resolveTopology(base: TopologyConfig, deltas?: TopologyDeltas): TopologyConfig {
  if (!deltas) return base;
  return {
    devices: base.devices.map(device => {
      const delta = deltas.modify_devices?.find(d => d.id === device.id);
      return delta ? { ...device, ...delta } : device;
    }),
    connections: base.connections.map(conn => {
      const delta = deltas.modify_connections?.find(
        c => c.from === conn.from && c.to === conn.to
      );
      return delta ? { ...conn, ...delta } : conn;
    }),
    labels: [...(base.labels || []), ...(deltas.add_labels || [])],
  };
}
```

**Ví dụ `animation_config`:**
```json
{
  "type": "packet_flow",
  "packet": {"label": "ICMP Echo", "color": "#00ff88"},
  "path": ["pc-a", "router-1", "pc-b"],
  "speed": 1500,
  "pause_at": "router-1",
  "pause_narration": "Router kiểm tra bảng routing để tìm next hop..."
}
```

#### `exercises` — Bài tập tương tác
```sql
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  exercise_order INT NOT NULL,
  type TEXT NOT NULL,                    -- 'fill_in', 'multiple_choice', 'drag_drop', 'interactive_config'
  question TEXT NOT NULL,                -- câu hỏi / đề bài
  context JSONB,                         -- topology hoặc context bổ sung
  config JSONB NOT NULL,                 -- cấu hình exercise tùy theo type
  explanation TEXT NOT NULL,             -- giải thích đáp án
  xp_reward INT DEFAULT 20,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(lesson_id, exercise_order)
);
```

**Ví dụ `config` cho `fill_in`:**
```json
{
  "prompts": [
    {"label": "Subnet Mask cho /24", "answer": "255.255.255.0", "accept": ["255.255.255.0"]},
    {"label": "Số host khả dụng", "answer": "254", "accept": ["254"]}
  ]
}
```

**Ví dụ `config` cho `multiple_choice`:**
```json
{
  "options": [
    {"id": "a", "text": "255.255.255.0", "correct": true},
    {"id": "b", "text": "255.255.0.0", "correct": false},
    {"id": "c", "text": "255.0.0.0", "correct": false},
    {"id": "d", "text": "255.255.255.128", "correct": false}
  ],
  "allow_multiple": false
}
```

**Ví dụ `config` cho `drag_drop`:**
```json
{
  "items": [
    {"id": "1", "label": "192.168.1.0/24", "zone": null},
    {"id": "2", "label": "10.0.0.0/8", "zone": null}
  ],
  "drop_zones": [
    {"id": "class-a", "label": "Class A", "accepts": ["2"]},
    {"id": "class-c", "label": "Class C", "accepts": ["1"]}
  ]
}
```

**Ví dụ `config` cho `interactive_config` (⭐ Regex-based CLI validation):**
```json
{
  "terminal_config": {
    "prompt": "Router>",               
    "hostname": "R1",                  
    "initial_mode": "user"             
  },
  "expected_commands": [
    {
      "step": 1,
      "hint": "Vào chế độ privileged",
      "regex": "^(enable|en)$",
      "feedback_correct": "R1#",
      "feedback_wrong": "% Invalid input",
      "required": true
    },
    {
      "step": 2,
      "hint": "Vào chế độ cấu hình",
      "regex": "^conf(igure)?\\s*t(erminal)?$",
      "feedback_correct": "R1(config)#",
      "feedback_wrong": "% Invalid input",
      "required": true
    },
    {
      "step": 3,
      "hint": "Chọn interface Fa0/0",
      "regex": "^int(erface)?\\s*(fa(stethernet)?|f)\\s*0\\/0$",
      "feedback_correct": "R1(config-if)#",
      "feedback_wrong": "% Invalid interface",
      "required": true
    },
    {
      "step": 4,
      "hint": "Gán IP address",
      "regex": "^ip\\s+addr(ess)?\\s+192\\.168\\.1\\.1\\s+255\\.255\\.255\\.0$",
      "feedback_correct": "R1(config-if)#",
      "feedback_wrong": "% Incomplete command",
      "required": true
    },
    {
      "step": 5,
      "hint": "Bật interface lên",
      "regex": "^no\\s+shut(down)?$",
      "feedback_correct": "%LINK-5-CHANGED: Interface FastEthernet0/0, changed state to up",
      "feedback_wrong": "% Invalid input",
      "required": true
    }
  ],
  "order_matters": true,
  "case_sensitive": false
}
```

> **Tại sao dùng Regex?** Cisco IOS chấp nhận lệnh viết tắt (`en` = `enable`, `conf t` = `configure terminal`). Regex cho phép match tất cả các dạng hợp lệ mà không cần enum từng biến thể.

> **Terminal UI:** Sử dụng `xterm.js` (lightweight terminal emulator) để tạo giao diện CLI giả lập với dark background, font monospace, cursor nhấp nháy — trải nghiệm gần giống terminal thật.
```

#### `review_quizzes` — Câu hỏi ôn tập nhanh
```sql
CREATE TABLE review_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,  -- liên kết bài gốc
  question TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'multiple_choice',  -- 'multiple_choice', 'true_false', 'fill_in'
  config JSONB NOT NULL,                          -- tương tự exercises.config
  explanation TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### `user_progress` — Tiến trình user
```sql
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started',  -- 'not_started', 'learning', 'practicing', 'completed'
  last_step_index INT DEFAULT 0,       -- ⭐ Resume: user đang ở step thứ mấy trong Phase Learn
  simulation_completed BOOLEAN DEFAULT false,
  exercises_score JSONB,               -- {"total": 5, "correct": 4, "answers": [...]}
  best_score INT,                       -- phần trăm cao nhất
  xp_earned INT DEFAULT 0,
  completed_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);
```

> **Resume UX:** Khi user mở lại lesson, query `last_step_index` → tự động nhảy tới step đang xem dở thay vì bắt đầu lại từ đầu. TanStack Query cache sẽ giữ giá trị này giữa các navigation.
```

#### `achievements` — Huy hiệu
```sql
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                    -- 'Subnet Master'
  description TEXT NOT NULL,             -- 'Hoàn thành tất cả bài Subnetting'
  icon_url TEXT,
  condition_type TEXT NOT NULL,          -- 'lessons_completed', 'module_completed', 'streak', 'score'
  condition_config JSONB NOT NULL,       -- {"module_slug": "subnetting", "required": "all"}
  xp_reward INT DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### `user_achievements` — Huy hiệu đã nhận
```sql
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);
```

#### `user_streaks` — Chuỗi ngày học
```sql
CREATE TABLE user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_activity_date DATE,
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 4. Simulation Engine

### 4.1 Cấu trúc mỗi Lesson

Mỗi lesson bao gồm 2 phase:

```
┌─────────────────────────────────────────────────┐
│                   LESSON                         │
│                                                   │
│  Phase 1: LEARN                                   │
│  ┌─────────────────────────────────────────────┐  │
│  │  Step 1 → Step 2 → Step 3 → ... → Step N   │  │
│  │  [Topology + Animation + Narration]          │  │
│  │  User controls: Play/Pause, Next, Previous  │  │
│  └─────────────────────────────────────────────┘  │
│                      ↓                            │
│  Phase 2: PRACTICE                                │
│  ┌─────────────────────────────────────────────┐  │
│  │  Exercise 1 → Exercise 2 → ... → Exercise M │  │
│  │  [Question + Input + Instant Feedback]       │  │
│  │  Types: fill_in, MCQ, drag_drop, config      │  │
│  └─────────────────────────────────────────────┘  │
│                      ↓                            │
│  🎉 COMPLETION                                    │
│  ┌─────────────────────────────────────────────┐  │
│  │  Score Summary + Celebration Animation       │  │
│  │  XP Earned + Badge (if applicable)           │  │
│  │  Next Lesson / Review Prompt                 │  │
│  └─────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### 4.2 Topology Renderer

Component trung tâm render sơ đồ mạng từ `topology_config`:

- **Thiết bị**: Render SVG icons cho PC, Router, Switch, Server, Firewall, Cloud
- **Kết nối**: Đường line giữa các thiết bị, có label (interface name)
- **Labels**: IP address, subnet mask, hostname hiển thị gần thiết bị
- **Responsive**: Sử dụng `viewBox` SVG attribute để tự scale theo viewport
- **Zoom/Pan**: Tích hợp `react-zoom-pan-pinch` cho mobile — sơ đồ mạng quá nhỏ trên màn hình nhỏ nếu chỉ scale down
- **Error Boundary**: Wrap trong `SimulationErrorBoundary` — khi animation/JSON lỗi, chỉ phần khung mô phỏng crash, user vẫn đọc được narration text
- **Accessibility (a11y)**: Mỗi SVG component có `<title>`, `<desc>` và `aria-label` để hỗ trợ screen reader và keyboard navigation

**Ví dụ SVG a11y:**
```tsx
// DeviceNode.tsx — Accessible SVG component
const DeviceNode = ({ device }: { device: Device }) => (
  <g
    role="img"
    aria-label={`${device.type} ${device.label}: IP ${device.ip || 'N/A'}`}
    tabIndex={0}  // cho phép focus bằng keyboard
    onKeyDown={(e) => e.key === 'Enter' && onDeviceClick(device.id)}
  >
    <title>{device.label} ({device.type})</title>
    <desc>
      {device.type === 'router' 
        ? `Router ${device.label} kết nối các mạng con` 
        : `Máy tính ${device.label} với IP ${device.ip}`}
    </desc>
    {/* SVG icon */}
    <image href={`/devices/${device.type}.svg`} ... />
    {/* Label */}
    <text aria-hidden="true">{device.label}</text>
  </g>
);

// TopologyRenderer.tsx — Accessible container
const TopologyRenderer = ({ topology }: Props) => (
  <svg
    viewBox="0 0 800 400"
    role="figure"
    aria-label="Sơ đồ mạng mô phỏng"
  >
    <title>Network Topology Diagram</title>
    <desc>
      Sơ đồ gồm {topology.devices.length} thiết bị 
      và {topology.connections.length} kết nối
    </desc>
    {/* render devices + connections */}
  </svg>
);
```

### 4.3 Animation Orchestrator

> ⚠️ **Không dùng `setTimeout` chain** — dễ gây callback hell và không kiểm soát được pause/resume.

**Giải pháp: XState + async/await Animation Pipeline**

```typescript
// Animation Orchestrator — đọc animation_config từ JSON và chạy mượt mà
class AnimationOrchestrator {
  private abortController: AbortController | null = null;

  // Delay có thể cancel được (thay vì setTimeout)
  private delay(ms: number, signal: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(resolve, ms);
      signal.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
      });
    });
  }

  // Chạy chuỗi animation từ config JSON
  async runAnimation(config: AnimationConfig, callbacks: AnimationCallbacks) {
    this.abortController = new AbortController();
    const { signal } = this.abortController;

    try {
      for (const node of config.path) {
        callbacks.onPacketMove(node);
        await this.delay(config.speed, signal);

        if (node === config.pause_at) {
          callbacks.onPause(config.pause_narration);
          // XState sẽ chờ signal RESUME từ user
          await callbacks.waitForResume();
        }

        callbacks.onHighlight(node);
        await this.delay(300, signal);  // highlight duration
      }
      callbacks.onComplete();
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') {
        callbacks.onCancel();
      }
    }
  }

  // Cancel animation (khi user skip hoặc chuyển step)
  cancel() {
    this.abortController?.abort();
  }
}
```

**Tích hợp với XState:**
```
XState Machine:
  IDLE → [START] → ANIMATING → [PAUSE_POINT] → PAUSED → [RESUME] → ANIMATING → [DONE] → STEP_COMPLETE
                                                                                  → [NEXT] → ANIMATING (step+1)
```
- XState quản lý **trạng thái logic** (play/pause/step/complete)
- AnimationOrchestrator quản lý **thực thi animation** (di chuyển packet, highlight)
- Không bao giờ dùng `setTimeout` chain trực tiếp

- **Packet Flow**: Gói tin di chuyển dọc theo path, có màu phân biệt (ICMP=xanh lá, TCP=xanh dương, ARP=vàng)
- **Highlight**: Thiết bị/interface sáng lên khi đang xử lý gói tin
- **Pause Points**: Animation dừng tại các điểm quan trọng, hiển thị narration
- **Interactive**: User có thể click vào thiết bị để xem chi tiết (routing table, ARP table, etc.)
- **Cancellable**: Animation có thể cancel bất cứ lúc nào (user skip, chuyển step)

### 4.4 Exercise Types

| Type | Mô tả | Ví dụ |
|---|---|---|
| `fill_in` | Nhập kết quả vào ô trống | "Subnet mask cho /24 là?" → user nhập "255.255.255.0" |
| `multiple_choice` | Chọn đáp án đúng | "IP nào thuộc Class B?" → 4 options |
| `drag_drop` | Kéo thả items vào đúng vị trí | Kéo IP vào đúng subnet |
| `interactive_config` | Cấu hình thiết bị CLI (xterm.js) | Gõ lệnh cấu hình interface trên router, chấm bằng Regex |
| `true_false` | Đúng/Sai nhanh | "10.0.0.0 là private IP?" → True/False |

---

## 5. UI/UX Design

### 5.1 Design Direction

**Modern Tech / Futuristic**
- Dark mode chủ đạo
- Gradient xanh dương → tím (primary palette)
- Glassmorphism cho cards và panels
- Smooth micro-animations
- Font: Inter (UI) + JetBrains Mono (code/IP addresses)

### 5.2 Color Palette

```css
:root {
  /* Background */
  --bg-primary: #0a0e1a;          /* deep navy */
  --bg-secondary: #111827;         /* dark slate */
  --bg-card: rgba(17, 24, 39, 0.7); /* glass card */
  
  /* Accent */
  --accent-primary: #6366f1;       /* indigo */
  --accent-secondary: #8b5cf6;     /* purple */
  --accent-gradient: linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa);
  
  /* Status */
  --success: #10b981;              /* emerald */
  --warning: #f59e0b;              /* amber */
  --error: #ef4444;                /* red */
  --info: #3b82f6;                 /* blue */
  
  /* Text */
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  
  /* Simulation specific */
  --packet-icmp: #10b981;
  --packet-tcp: #3b82f6;
  --packet-arp: #f59e0b;
  --device-active: #6366f1;
  --connection-line: #334155;
  
  /* Glass effect */
  --glass-bg: rgba(255, 255, 255, 0.05);
  --glass-border: rgba(255, 255, 255, 0.1);
  --glass-blur: blur(12px);
}
```

### 5.3 Cấu trúc trang

```
/                           → Landing Page (hero + features + CTA)
/login                      → Đăng nhập
/register                   → Đăng ký
/dashboard                  → Dashboard (sau đăng nhập) — overview tiến trình
/tracks                     → Danh sách chuyên ngành
/tracks/:slug               → Chi tiết track (CCNA, CCNP...)
/tracks/:slug/:cert         → Chi tiết certification
/tracks/:slug/:cert/:module → Danh sách lessons trong module
/lesson/:id                 → Lesson page (Learn + Practice)
/lesson/:id/learn           → Phase Learn (simulation)
/lesson/:id/practice        → Phase Practice (exercises)
/review/:moduleId           → Quick Review session
/profile                    → Profile + Stats + Achievements
/achievements               → Tất cả achievements
```

### 5.4 Layout chính

**Landing Page:**
- Hero section: Animated network topology background + tagline + CTA
- Features: 3-4 card glassmorphism highlights
- Track preview: CCNA/CCNP cards với progress indicator
- Social proof: Số lượng user, bài hoàn thành

**Dashboard (logged in):**
- Welcome + streak counter
- Continue learning: Bài tiếp theo cần làm
- Progress overview: Circular progress per certification
- Recent achievements
- Quick stats: XP, lessons completed, streak

**Lesson Page:**
- Thanh progress trên cùng (step X/N)
- Khu vực simulation chính (chiếm 70% viewport)
- Panel narration/explanation bên phải hoặc bên dưới
- Controls: Previous / Play-Pause / Next
- Sau Learn → transition mượt sang Practice

---

## 6. Quick Review System

### 6.1 Trigger Logic
- Sau mỗi **N bài** (configurable per module, default = 3), hệ thống gợi ý review
- User có thể skip nhưng sẽ được reminder
- Review cũng có thể truy cập thủ công từ module page

### 6.2 Cơ chế
- Lấy ngẫu nhiên **5-10 câu** từ `review_quizzes` của module hiện tại
- Timer: **30 giây/câu** (tùy chỉnh được)
- Dạng: Multiple choice, True/False, Fill-in nhanh
- Sau review: Hiển thị kết quả + link tới bài gốc nếu sai

### 6.3 Anti-cheat cho Review & Achievements
- **Review sessions** và **bài test lấy achievement/huy hiệu** sẽ gọi **Edge Function** để chấm điểm
- Đáp án **hoàn toàn ẩn** khỏi client — server-side check duy nhất
- Phân biệt rõ: Exercise (tự học, client check) vs Review/Achievement (chính thức, server check)

### 6.4 Spaced Repetition (Phase 2)
- Trong tương lai, tích hợp thuật toán SM-2 để ưu tiên câu hỏi user hay sai
- Hiện tại MVP: random từ pool

---

## 7. Gamification

### 7.1 XP System
- Mỗi lesson hoàn thành: **100 XP** (base)
- Mỗi exercise đúng: **20 XP**
- Perfect score (100%): **Bonus 50 XP**
- Quick Review: **10 XP/câu đúng**

> ⚠️ **Anti-cheat XP:** XP **không bao giờ** được cập nhật trực tiếp từ client.
> Client chỉ gọi PostgreSQL RPC `complete_lesson(lesson_id)` → Server tự tính XP.
> Xem chi tiết tại Mục 7.5.

### 7.2 Streak System
- Đếm số ngày liên tiếp có hoạt động (hoàn thành ít nhất 1 lesson hoặc review)
- Hiển thị streak counter trên dashboard
- Milestone badges: 7 ngày, 30 ngày, 100 ngày

### 7.3 Achievements
Ví dụ:
| Badge | Điều kiện |
|---|---|
| 🌐 First Ping | Hoàn thành bài đầu tiên |
| 🎯 Subnet Master | Hoàn thành tất cả bài Subnetting |
| 🔥 Week Warrior | Streak 7 ngày |
| 💯 Perfect Score | Đạt 100% trong bất kỳ bài nào |
| 🏆 CCNA Ready | Hoàn thành toàn bộ CCNA track |
| 🧠 Quick Thinker | Hoàn thành review dưới 2 phút |

### 7.4 Celebration
- **Hoàn thành lesson**: Confetti animation + message cổ vũ ngẫu nhiên
- **Đạt achievement**: Modal đặc biệt với badge animation + sound effect (optional)
- **Perfect score**: Extra sparkle animation

### 7.5 Anti-cheat: Server-side XP via PostgreSQL RPC

> **Vấn đề:** Nếu client có quyền `UPDATE user_progress SET xp_earned = ...`, user có thể bắn API giả để tự buff XP lên Top 1 Leaderboard.

**Giải pháp — PostgreSQL Function (RPC):**

```sql
-- Client CHỈ được gọi function này, KHÔNG được UPDATE trực tiếp
CREATE OR REPLACE FUNCTION complete_lesson(p_lesson_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER  -- chạy với quyền DB owner, không phải user
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_xp_reward INT;
  v_streak INT;
  v_bonus_multiplier NUMERIC := 1.0;
  v_total_xp INT;
  v_already_completed BOOLEAN;
BEGIN
  -- Kiểm tra lesson có tồn tại không
  SELECT xp_reward INTO v_xp_reward
  FROM lessons WHERE id = p_lesson_id AND is_active = true;
  
  IF v_xp_reward IS NULL THEN
    RAISE EXCEPTION 'Lesson not found or inactive';
  END IF;

  -- Kiểm tra đã hoàn thành chưa (không cho cộng XP lại)
  SELECT (status = 'completed') INTO v_already_completed
  FROM user_progress
  WHERE user_id = v_user_id AND lesson_id = p_lesson_id;

  IF v_already_completed THEN
    RETURN jsonb_build_object('success', false, 'reason', 'already_completed');
  END IF;

  -- Tính streak bonus
  SELECT current_streak INTO v_streak
  FROM user_streaks WHERE user_id = v_user_id;
  
  IF v_streak >= 7 THEN
    v_bonus_multiplier := 1.5;  -- 50% bonus cho streak >= 7 ngày
  ELSIF v_streak >= 3 THEN
    v_bonus_multiplier := 1.2;  -- 20% bonus cho streak >= 3 ngày
  END IF;

  v_total_xp := FLOOR(v_xp_reward * v_bonus_multiplier);

  -- Cập nhật progress
  INSERT INTO user_progress (user_id, lesson_id, status, xp_earned, completed_at)
  VALUES (v_user_id, p_lesson_id, 'completed', v_total_xp, now())
  ON CONFLICT (user_id, lesson_id) DO UPDATE SET
    status = 'completed',
    xp_earned = v_total_xp,
    completed_at = now(),
    updated_at = now();

  -- Cập nhật streak
  INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_activity_date)
  VALUES (v_user_id, 1, 1, CURRENT_DATE)
  ON CONFLICT (user_id) DO UPDATE SET
    current_streak = CASE
      WHEN user_streaks.last_activity_date = CURRENT_DATE - 1 
        THEN user_streaks.current_streak + 1
      WHEN user_streaks.last_activity_date = CURRENT_DATE 
        THEN user_streaks.current_streak  -- cùng ngày, không tăng
      ELSE 1  -- reset streak
    END,
    longest_streak = GREATEST(
      user_streaks.longest_streak, 
      CASE
        WHEN user_streaks.last_activity_date = CURRENT_DATE - 1 
          THEN user_streaks.current_streak + 1
        ELSE 1
      END
    ),
    last_activity_date = CURRENT_DATE,
    updated_at = now();

  RETURN jsonb_build_object(
    'success', true,
    'xp_earned', v_total_xp,
    'streak_bonus', v_bonus_multiplier,
    'message', CASE
      WHEN v_bonus_multiplier > 1 THEN 'Streak bonus activated! 🔥'
      ELSE 'Lesson completed! 🎉'
    END
  );
END;
$$;
```

**RLS chặn ghi trực tiếp vào XP:**
```sql
-- User chỉ được ĐỌC progress của mình + UPDATE last_step_index (resume)
-- KHÔNG được UPDATE xp_earned, status = 'completed'
CREATE POLICY "Users can read own progress"
  ON user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update resume step only"
  ON user_progress FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    -- Chỉ cho phép update last_step_index và last_accessed_at
    -- xp_earned và status = 'completed' chỉ từ RPC
    xp_earned = (SELECT xp_earned FROM user_progress WHERE user_id = auth.uid() AND lesson_id = user_progress.lesson_id)
  );

CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id AND status = 'not_started' AND xp_earned = 0);
```

**Client gọi đơn giản:**
```typescript
// Khi user hoàn thành lesson
const { data } = await supabase.rpc('complete_lesson', { p_lesson_id: lessonId });
// data = { success: true, xp_earned: 150, streak_bonus: 1.5, message: 'Streak bonus! 🔥' }
```

---

## 8. Authentication & Authorization

### 8.1 Auth Flow
- **Guest**: Xem Landing, browse tracks/modules, làm thử 2-3 bài đầu mỗi module
- **Registered User**: Truy cập toàn bộ, lưu tiến trình, achievements, streak
- **Admin** (future): Quản lý nội dung bài học

### 8.2 Supabase Auth
- Email + Password
- OAuth: Google, GitHub
- JWT token, auto refresh

### 8.3 RLS Policies
- `user_progress`: User chỉ đọc/ghi data của chính mình
- `user_achievements`, `user_streaks`: Tương tự
- Content tables (`tracks`, `certifications`, `lessons`...): Public read, admin write
- `exercises.config`: Client-side check cho learn/practice (xem 9.2)
- `review_quizzes.config`: **Ẩn đáp án** qua PostgreSQL View hoặc Edge Function (xem 6.3)

---

## 9. Chiến lược bảo mật đáp án (Answer Security Strategy)

### 9.1 Phân tích

| Ngữ cảnh | Mức bảo mật | Lý do |
|---|---|---|
| **Exercises (Learn/Practice)** | 🟢 Thấp | Nền tảng tự học, user gian lận = tự hại mình |
| **Review Sessions** | 🟡 Trung bình | Ảnh hưởng tiến trình, cần chính xác |
| **Achievement Tests** | 🔴 Cao | Badge công khai, cần đảm bảo công bằng |

### 9.2 Giải pháp theo tầng (Layered Approach)

**Tầng 1 — Exercises (Client-side check):**
- Đáp án gửi kèm trong `exercises.config` về client
- Client check ngay lập tức → instant feedback, UX mượt mà
- Chỉ ẩn đáp án khỏi giao diện (không hiển thị cho user), không cần mã hóa
- **Lý do không hash:** MCQ chỉ có 4 options, True/False có 2 → brute-force trivially easy dù có salt
- Chấp nhận lộ đáp án ở DevTools — đây là nền tảng tự học, không phải thi

**Tầng 2 — Review & Achievements (Server-side check):**
- Edge Function `check-review` kiểm tra đáp án
- `review_quizzes.config` **KHÔNG bao gồm đáp án** khi gửi về client
- Sử dụng PostgreSQL View để loại bỏ trường `correct` trước khi expose:

```sql
-- View an toàn cho client (không chứa đáp án)
CREATE VIEW review_quizzes_safe AS
SELECT 
  id, module_id, lesson_id, question, type,
  config - 'correct_answer' - 'correct' as config_safe,
  created_at
FROM review_quizzes;
```

**Tầng 3 — Edge Function scoring:**
- Chỉ gọi khi: hoàn thành review session, claim achievement
- Giảm API calls xuống tối thiểu (~1 call/review, không phải mỗi câu hỏi)

> ⚠️ **Quyết định:** Bỏ giải pháp SHA-256 hash cho exercises vì không hiệu quả với tập mẫu nhỏ (MCQ/True-False). Đơn giản hóa MVP, đẩy anti-cheat sang Review System.

---

## 10. Cấu trúc thư mục Frontend

```
src/
├── assets/                    # SVG icons thiết bị, images
│   ├── devices/               # router.svg, switch.svg, pc.svg...
│   └── icons/
├── components/
│   ├── common/                # Button, Card, Modal, Toast, LoadingSpinner
│   ├── layout/                # Header, Sidebar, Footer
│   ├── simulation/            # TopologyRenderer, PacketAnimation, DeviceNode
│   │   └── SimulationErrorBoundary.tsx  # Catch simulation crashes gracefully
│   ├── exercises/             # FillIn, MultipleChoice, DragDrop, InteractiveConfig
│   ├── gamification/          # XPBar, StreakCounter, AchievementBadge, Confetti
│   └── review/                # ReviewSession, QuizCard, Timer
├── pages/
│   ├── Landing.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Dashboard.tsx
│   ├── TrackList.tsx
│   ├── TrackDetail.tsx
│   ├── ModuleDetail.tsx
│   ├── LessonPage.tsx         # Main lesson container (Learn + Practice)
│   ├── ReviewPage.tsx
│   ├── Profile.tsx
│   └── Achievements.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useSimulation.ts
│   ├── useExercise.ts
│   └── useAnalytics.ts        # Event tracking hook
├── queries/                   # ⭐ TanStack Query hooks (Remote State)
│   ├── useTracks.ts           # useQuery: fetch tracks/certifications
│   ├── useLessons.ts          # useQuery: fetch lessons by module
│   ├── useSimulationData.ts   # useQuery: fetch simulation steps + base topology
│   ├── useProgress.ts         # useQuery + useMutation: user progress
│   └── useAchievements.ts     # useQuery: user achievements
├── stores/                    # ⭐ Zustand: UI state ONLY
│   └── uiStore.ts             # theme, sidebar, modal state
├── lib/
│   ├── supabase.ts            # Supabase client init
│   ├── queryClient.ts         # TanStack Query client config
│   ├── types.ts               # TypeScript types (from Supabase gen)
│   ├── schemas.ts             # Zod schemas cho JSONB validation
│   ├── analytics.ts           # Telemetry event tracking
│   └── constants.ts
├── styles/
│   ├── index.css              # Global styles + CSS variables
│   ├── components.css         # Component-specific styles
│   └── animations.css         # Keyframe animations
├── utils/
│   ├── networking.ts          # IP calculation, subnet utils
│   └── scoring.ts             # Score calculation helpers
├── __tests__/                 # Unit tests (Vitest)
│   ├── networking.test.ts     # Test IP/subnet calculations
│   ├── scoring.test.ts        # Test scoring logic
│   └── simulation.test.ts     # Test XState simulation flow
├── App.tsx
├── main.tsx
└── Router.tsx
```

---

## 11. Nội dung CCNA MVP (Bài mô phỏng đầu tiên)

### Module: IP Addressing & Subnetting

#### Lesson 1: IPv4 Subnet Mask Cơ bản

**Learn Phase (6 steps):**
1. Giới thiệu IPv4 address — hiển thị 4 octet, animation chia từng phần
2. Subnet Mask là gì — overlay mask lên IP, highlight network vs host portion
3. CIDR Notation — animation chuyển đổi subnet mask ↔ /prefix
4. Tính Network Address — AND operation animation (IP & Mask)
5. Tính Broadcast Address — animation đảo host bits
6. Tính số Host khả dụng — công thức 2^n - 2 với animation

**Practice Phase (5 exercises):**
1. Fill-in: Cho IP + mask, tính network address
2. Multiple Choice: Chọn subnet mask cho /24
3. Fill-in: Tính số host cho /26
4. Drag-Drop: Kéo IPs vào đúng subnet
5. Interactive: Cho topology, cấu hình IP cho các thiết bị

---

## 12. Kế hoạch mở rộng (Future)

- [ ] Thêm tracks: Cybersecurity, System Admin
- [ ] Admin dashboard: CRUD bài học, theo dõi user
- [ ] Spaced Repetition Algorithm (SM-2) cho review
- [ ] Leaderboard cộng đồng
- [ ] Lab thực hành với terminal giả lập (Cisco IOS CLI)
- [ ] Mobile responsive (PWA)
- [ ] Multi-language support
- [ ] Export certificate PDF khi hoàn thành track

---

## 13. Rủi ro tiềm ẩn & Giải pháp (Risks & Mitigations)

### 13.1 Nút thắt nhập liệu (Content Authoring Bottleneck)

> **Vấn đề:** Các trường JSONB như `topology_config` và `animation_config` rất mạnh, nhưng nếu phải gõ tay từng dòng JSON tọa độ (`x`, `y`) của PC, Router hay viết kịch bản animation, đó sẽ là một "ác mộng" bảo trì và rất dễ sinh lỗi (typo).

**Giải pháp:**
- **MVP:** Tạo một bộ template topology chuẩn (3-5 mẫu phổ biến) để reuse, giảm bớt việc viết JSON từ đầu.
- **Phase 2:** Xây công cụ **Visual Builder** nội bộ — giao diện kéo thả thiết bị, tự động sinh `topology_config` và `animation_config` dưới dạng JSON. Đây là ưu tiên cao ngay sau MVP.

**Cấu trúc thư mục bổ sung (Phase 2):**
```
src/
└── tools/
    └── topology-builder/     # Visual Builder cho admin/author
        ├── BuilderCanvas.tsx  # Kéo thả thiết bị
        ├── DevicePalette.tsx  # Bảng thiết bị có sẵn
        ├── ConnectionTool.tsx # Vẽ kết nối
        └── JsonExporter.tsx   # Export ra topology_config JSON
```

---

### 13.2 Quản lý trạng thái mô phỏng (Simulation State Management)

> **Vấn đề:** Zustand rất nhẹ và tốt cho Global State (Auth, User Progress). Tuy nhiên, Simulation Engine (với các trạng thái: `Idle → Playing → Paused → StepComplete → AllComplete`) mang tính chất của một **Finite State Machine** (Máy trạng thái hữu hạn). Dùng Zustand thuần cho việc này có thể dẫn đến spaghetti code khi logic phức tạp lên.

**Giải pháp:**
- Sử dụng **XState** riêng cho Simulation Engine để quản lý luồng animation và các bước step-by-step.
- Zustand vẫn dùng cho global state (Auth, Progress, UI).
- Phân tách rõ: **XState = simulation flow**, **Zustand = app state**.

**State Machine diagram:**
```
                    ┌──────────┐
                    │   IDLE   │
                    └────┬─────┘
                         │ START
                    ┌────▼─────┐
              ┌─────│ PLAYING  │─────┐
              │     └────┬─────┘     │
              │ PAUSE    │ STEP_END  │ COMPLETE
         ┌────▼─────┐    │     ┌─────▼──────┐
         │  PAUSED  │    │     │ COMPLETED  │
         └────┬─────┘    │     └────────────┘
              │ RESUME   │
              └──────────┘
```

**Tech Stack cập nhật:**
| Thêm | XState v5 | State machine cho Simulation Engine |

---

### 13.3 Chi phí API & Chiến lược Answer Check

> **Vấn đề gốc:** Nếu mỗi thao tác chọn đáp án đều gọi Edge Function, sẽ đốt request rất nhanh + tạo latency.

> **Vấn đề với giải pháp hash (đã loại bỏ):** SHA-256 + salt không hiệu quả cho MCQ (4 options) và True/False (2 options) — brute-force trivially easy. Đây là over-engineering cho MVP.

**Giải pháp đã chọn (Layered Approach — xem chi tiết tại Mục 9):**

| Ngữ cảnh | Check tại | API calls |
|---|---|---|
| Exercises (Learn/Practice) | Client-side | **0 calls** |
| Review Sessions | Edge Function | **1 call/review** |
| Achievement Claims | Edge Function | **1 call/claim** |

- **Exercises**: Đáp án gửi kèm config, client check ngay lập tức, 0 API call
- **Review/Achievement**: Edge Function `check-review` chấm điểm, đáp án hoàn toàn ẩn
- **Estimated API usage**: ~1-2 Edge Function calls mỗi 3-5 bài học → rất thấp, dư Free Tier

> ✅ Bỏ `answer_hash` và `answer_salt` khỏi schema. Không cần các cột này nữa.

---

### 13.4 Hiệu năng Render Topology

> **Vấn đề:** SVG + Framer Motion rất đẹp cho lab nhỏ (CCNA, ~5-10 thiết bị). Nhưng CCNP với topology phức tạp (nhiều luồng OSPF/BGP chạy chéo nhau), DOM nodes sinh từ SVG sẽ làm trình duyệt giật lag trên máy yếu.

**Giải pháp — Abstracted Renderer Interface:**

```typescript
// Interface trừu tượng — dễ swap implementation sau này
interface ITopologyRenderer {
  renderDevices(devices: Device[]): void;
  renderConnections(connections: Connection[]): void;
  animatePacket(packet: PacketConfig): void;
  highlightDevice(deviceId: string): void;
  clear(): void;
}

// MVP: SVG Renderer
class SvgTopologyRenderer implements ITopologyRenderer { ... }

// Future: Canvas Renderer (React Flow / PixiJS)
class CanvasTopologyRenderer implements ITopologyRenderer { ... }
```

**Ngưỡng chuyển đổi:**
| Thiết bị | Renderer khuyến nghị |
|---|---|
| ≤ 15 thiết bị | SVG (đẹp, dễ style) |
| 16-50 thiết bị | Canvas (React Flow) |
| > 50 thiết bị | WebGL (PixiJS) |

- **MVP:** Dùng SVG cho tất cả (CCNA/CCNP cơ bản đủ dùng)
- **Phase 2:** Khi thêm CCNP nâng cao, implement `CanvasTopologyRenderer`
- **Quan trọng:** Code từ đầu theo interface, không coupling trực tiếp vào SVG

---

### 13.5 JSONB Validation (Zod)

> **Vấn đề:** JSONB rất linh hoạt nhưng là "kẻ thù" của Type Safety. Thiếu một trường `x` hoặc `y` trong `topology_config` sẽ gây white screen crash.

**Giải pháp — Zod schemas cho mọi JSONB field:**

```typescript
// lib/schemas.ts
import { z } from 'zod';

export const DeviceSchema = z.object({
  id: z.string(),
  type: z.enum(['pc', 'router', 'switch', 'server', 'firewall', 'cloud']),
  label: z.string(),
  x: z.number(),
  y: z.number(),
  ip: z.string().optional(),
  subnet: z.string().optional(),
});

export const TopologyConfigSchema = z.object({
  devices: z.array(DeviceSchema),
  connections: z.array(z.object({
    from: z.string(),
    to: z.string(),
    label: z.string().optional(),
  })),
});

export const AnimationConfigSchema = z.object({
  type: z.enum(['packet_flow', 'highlight', 'transform']),
  packet: z.object({ label: z.string(), color: z.string() }).optional(),
  path: z.array(z.string()).optional(),
  speed: z.number().default(1500),
  pause_at: z.string().optional(),
  pause_narration: z.string().optional(),
});
```

**Sử dụng:**
```typescript
// Validate trước khi render — tránh white screen crash
const result = TopologyConfigSchema.safeParse(rawData);
if (!result.success) {
  // Hiển thị error boundary thay vì crash
  console.error('Invalid topology config:', result.error);
  return <SimulationErrorBoundary error={result.error} />;
}
```

---

### 13.6 Database Indexing

> **Vấn đề:** Foreign Keys không tự tạo index trong PostgreSQL. Khi dữ liệu lớn, query `lessons WHERE module_id = ?` sẽ chậm.

**Indexes cần thiết:**
```sql
-- Content hierarchy
CREATE INDEX idx_certifications_track_id ON certifications(track_id);
CREATE INDEX idx_modules_certification_id ON modules(certification_id);
CREATE INDEX idx_lessons_module_id ON lessons(module_id);
CREATE INDEX idx_simulation_steps_lesson_id ON simulation_steps(lesson_id);
CREATE INDEX idx_exercises_lesson_id ON exercises(lesson_id);
CREATE INDEX idx_review_quizzes_module_id ON review_quizzes(module_id);

-- User data (hot paths)
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_lesson_id ON user_progress(lesson_id);
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);

-- Display ordering
CREATE INDEX idx_lessons_display_order ON lessons(module_id, display_order);
CREATE INDEX idx_modules_display_order ON modules(certification_id, display_order);
```

---

### 13.7 Telemetry & Analytics

> **Vấn đề:** Không biết user "kẹt" ở bài nào, bỏ cuộc ở đâu → không có data để cải thiện nội dung.

**Giải pháp — Event tracking cơ bản:**

```typescript
// lib/analytics.ts
type AnalyticsEvent =
  | { type: 'simulation_started'; lesson_id: string }
  | { type: 'simulation_step_viewed'; lesson_id: string; step: number }
  | { type: 'simulation_completed'; lesson_id: string; duration_ms: number }
  | { type: 'exercise_attempted'; exercise_id: string; correct: boolean }
  | { type: 'exercise_failed'; exercise_id: string; user_answer: string }
  | { type: 'step_skipped'; lesson_id: string; step: number }
  | { type: 'review_started'; module_id: string }
  | { type: 'review_completed'; module_id: string; score: number }
  | { type: 'lesson_abandoned'; lesson_id: string; phase: 'learn' | 'practice'; at_step: number };
```

**Database table:**
```sql
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- nullable cho guest
  event_type TEXT NOT NULL,
  event_data JSONB,
  session_id TEXT,          -- group events per session
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_created_at ON analytics_events(created_at);
```

**MVP queries hữu ích:**
```sql
-- Bài nào có tỷ lệ bỏ cuộc cao nhất?
SELECT event_data->>'lesson_id', COUNT(*) 
FROM analytics_events 
WHERE event_type = 'lesson_abandoned' 
GROUP BY 1 ORDER BY 2 DESC;

-- Exercise nào bị sai nhiều nhất?
SELECT event_data->>'exercise_id', COUNT(*) 
FROM analytics_events 
WHERE event_type = 'exercise_failed' 
GROUP BY 1 ORDER BY 2 DESC;
```

---

### 13.8 Testing Strategy

> **Vấn đề:** Với logic tính toán Subnet, scoring, và XState flow — nếu không có test, hệ thống cấp IP/Subnet sai sẽ mất uy tín với cộng đồng.

**Framework:** Vitest (tích hợp sẵn với Vite, nhanh hơn Jest)

**Phạm vi test bắt buộc:**

| Module | Loại test | Ưu tiên |
|---|---|---|
| `utils/networking.ts` | Unit test | 🔴 Bắt buộc |
| `utils/scoring.ts` | Unit test | 🔴 Bắt buộc |
| XState simulation machine | Unit test | 🔴 Bắt buộc |
| Zod schemas | Unit test | 🟡 Nên có |
| Exercise components | Integration test | 🟢 Nice-to-have (MVP) |

**Ví dụ test networking.ts:**
```typescript
// __tests__/networking.test.ts
import { describe, it, expect } from 'vitest';
import { calculateNetworkAddress, calculateBroadcast, countHosts } from '../utils/networking';

describe('IPv4 Subnet Calculations', () => {
  it('should calculate network address correctly', () => {
    expect(calculateNetworkAddress('192.168.1.130', '255.255.255.192')).toBe('192.168.1.128');
  });

  it('should calculate broadcast address correctly', () => {
    expect(calculateBroadcast('192.168.1.128', '255.255.255.192')).toBe('192.168.1.191');
  });

  it('should count usable hosts for /26', () => {
    expect(countHosts(26)).toBe(62);
  });

  it('should count usable hosts for /24', () => {
    expect(countHosts(24)).toBe(254);
  });

  it('should return 0 hosts for /32', () => {
    expect(countHosts(32)).toBe(0);
  });
});
```

**Config:**
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
```

**Tech Stack bổ sung:**
| Thêm | Vitest | Unit testing framework, tích hợp Vite |
| Thêm | Zod | Runtime JSONB validation |
| Thêm | react-zoom-pan-pinch | Zoom/Pan cho topology trên mobile |
| Thêm | xterm.js | Terminal emulator cho interactive_config exercises |

---

### 13.9 Offline Resilience (Xử lý gián đoạn kết nối)

> **Vấn đề:** User làm xong bài quiz dài, bấm "Hoàn thành" thì rớt mạng. API `complete_lesson` fail → mất điểm XP, user bực mình.

**Giải pháp — TanStack Query Mutation Retry + Offline Queue:**

```typescript
// queries/useCompleteLesson.ts
import { useMutation, useQueryClient, onlineManager } from '@tanstack/react-query';

export function useCompleteLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lessonId: string) => {
      const { data, error } = await supabase.rpc('complete_lesson', { 
        p_lesson_id: lessonId 
      });
      if (error) throw error;
      return data;
    },
    
    // ⭐ Retry tự động khi rớt mạng
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    
    // ⭐ Optimistic update: hiển thị XP ngay lập tức trước khi API trả về
    onMutate: async (lessonId) => {
      await queryClient.cancelQueries({ queryKey: ['progress'] });
      const previous = queryClient.getQueryData(['progress']);
      
      // Optimistic: đánh dấu hoàn thành ngay
      queryClient.setQueryData(['progress'], (old: any) => ({
        ...old,
        [lessonId]: { status: 'completed', xp_earned: '...' }
      }));
      
      return { previous };
    },
    
    // Rollback nếu API fail vĩnh viễn
    onError: (err, lessonId, context) => {
      queryClient.setQueryData(['progress'], context?.previous);
      // Lưu vào localStorage để retry sau
      savePendingCompletion(lessonId);
    },
    
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
    },
  });
}

// Offline queue bằng localStorage
function savePendingCompletion(lessonId: string) {
  const pending = JSON.parse(localStorage.getItem('pending_completions') || '[]');
  if (!pending.includes(lessonId)) {
    pending.push(lessonId);
    localStorage.setItem('pending_completions', JSON.stringify(pending));
  }
}

// Khi có mạng trở lại → sync
async function syncPendingCompletions() {
  const pending = JSON.parse(localStorage.getItem('pending_completions') || '[]');
  for (const lessonId of pending) {
    try {
      await supabase.rpc('complete_lesson', { p_lesson_id: lessonId });
    } catch (e) {
      continue; // retry lần sau
    }
  }
  localStorage.removeItem('pending_completions');
}

// Đăng ký listener
window.addEventListener('online', syncPendingCompletions);
```

**UX khi offline:**
- User hoàn thành bài → hiện confetti + XP animation **ngay lập tức** (optimistic)
- Background sync gửi kết quả lên server
- Nếu rớt mạng: lưu vào queue, auto-sync khi có mạng
- User không bao giờ biết API fail → UX mượt mà 100%

---

### 13.10 Tổng hợp quyết định kỹ thuật

| Rủi ro | Mức độ | Giải pháp MVP | Giải pháp dài hạn |
|---|---|---|---|
| Content authoring | 🟡 Trung bình | Template topology reuse | Visual Builder kéo thả |
| Simulation state | 🔴 Cao | XState ngay từ đầu | — (đã giải quyết) |
| Answer security | 🟢 Thấp (MVP) | Client-side check cho exercises | Edge Function cho review/achievements |
| SVG performance | 🟢 Thấp (MVP) | SVG + viewBox + zoom/pan | Canvas/WebGL renderer |
| JSONB crash | 🔴 Cao | Zod validation + ErrorBoundary | — (đã giải quyết) |
| Missing indexes | 🟡 Trung bình | Indexes từ migration đầu tiên | — (đã giải quyết) |
| No analytics data | 🟡 Trung bình | Basic event tracking table | Dashboard analytics (Phase 2) |
| Logic bugs | 🔴 Cao | Vitest unit tests bắt buộc | CI/CD integration |
| CLI exercise check | 🟡 Trung bình | Regex matching + xterm.js | — (đã giải quyết) |
| setTimeout hell | 🔴 Cao | AnimationOrchestrator + AbortController | — (đã giải quyết) |
| Offline data loss | 🟡 Trung bình | Optimistic update + localStorage queue | Service Worker sync |
| SVG accessibility | 🟢 Thấp | title/desc/aria-label từ MVP | Full WCAG compliance |

---

## 14. Verification Plan

### Automated
- TypeScript strict mode — no type errors
- Build thành công: `npm run build`
- Supabase migration chạy không lỗi
- **`npm run test`** — Vitest unit tests pass:
  - `networking.ts`: Tất cả phép tính IP/Subnet chính xác
  - `scoring.ts`: Logic chấm điểm đúng
  - XState machine: Transitions đúng flow
  - Zod schemas: Validate/reject đúng cấu trúc JSONB

### Manual
- Landing page load < 2s
- Simulation animation mượt 60fps
- Exercise check đáp án chính xác (client-side instant feedback)
- Interactive config (CLI): regex match các dạng viết tắt lệnh Cisco
- Review session check đáp án qua Edge Function (server-side)
- Auth flow hoạt động (register → login → logout)
- Progress lưu đúng sau refresh + resume đúng step
- Responsive trên mobile viewport + zoom/pan topology hoạt động
- XState simulation flow: Idle → Playing → Paused → Complete hoạt động đúng
- AnimationOrchestrator: cancel animation khi skip/chuyển step
- SimulationErrorBoundary catch được JSON lỗi mà không crash toàn trang
- Offline test: tắt mạng → hoàn thành bài → bật mạng → XP sync thành công
- SVG a11y: keyboard navigation tab qua các device, screen reader đọc được topology

---

*Tài liệu thiết kế bởi SimNet-D Team — 2026-04-12*
