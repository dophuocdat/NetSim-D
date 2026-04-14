# Design Specification: All-in-one Dashboard & Course Catalog (v2)

## 1. Overview

Thiết kế lại màn hình Dashboard (`/dashboard`) theo cấu trúc **All-in-one** kết hợp Accordion List. Trang này vừa là trung tâm thống kê cá nhân, vừa là cổng vào toàn bộ hệ thống khóa học.

---

## 2. Data Fetching Strategy (Lazy Loading + Server-side Status)

> **Nguyên tắc cốt lõi:** Database tính trạng thái, Frontend chỉ render.
>
> Client-side calculation bị phá vỡ bởi nghịch lý cross-module: khi lazy load Module 2,
> Frontend không có data Module 1 để kiểm tra bài cuối đã `completed` chưa → không thể
> tính unlock cho bài đầu Module 2. Giải pháp: đẩy toàn bộ logic về Supabase RPC.

### Query 1: Khởi tạo Dashboard (chạy ngay khi mount)

Fetch metadata nhẹ cho Cụm 1 (Hero) và Track Tabs:
```sql
-- Parallel queries (TanStack Query chạy song song)
SELECT id, name, slug, icon_url, color FROM tracks WHERE is_active = true;
SELECT id, track_id, name, slug, difficulty_level, icon_url FROM certifications WHERE is_active = true;
SELECT current_streak, longest_streak FROM user_streaks WHERE user_id = auth.uid();

-- Tổng hợp stats cho Hero Section
SELECT
  COALESCE(SUM(xp_earned), 0) as total_xp,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_count
FROM user_progress WHERE user_id = auth.uid();
```

Kèm theo 1 RPC để lấy bài đang học gần nhất (cho nút "Tiếp tục học").
**Có cơ chế Cold Start Fallback** cho user mới tinh (bảng `user_progress` trống):
```sql
-- RPC: get_current_lesson()
CREATE OR REPLACE FUNCTION get_current_lesson()
RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_result JSON;
BEGIN
  -- Bước 1: Tìm bài đang học dở (ưu tiên recent nhất)
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

  -- Bước 2 (Fallback): User mới → gợi ý bài đầu tiên của cert đầu tiên
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

> **Flag `is_new_user`:** Frontend dùng cờ này để thay đổi CTA text:
> - `false` → "▶ Tiếp tục học"
> - `true` → "🚀 Bắt đầu hành trình"

### Query 2: Lazy Load Certification (RPC — Server-side Status Calculation)

Khi user bấm mở 1 Certification, Frontend gọi **DUY NHẤT** 1 hàm RPC:
```
POST /rpc/get_certification_progress
Body: { "p_certification_id": "uuid-here" }
```

Hàm RPC trả về danh sách Modules + Lessons **đã gắn nhãn trạng thái sẵn**:
```sql
CREATE OR REPLACE FUNCTION get_certification_progress(p_certification_id UUID)
RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_result JSON;
BEGIN
  WITH ordered_lessons AS (
    -- Xếp tất cả lessons trong certification theo thứ tự tuyệt đối
    SELECT
      l.id, l.title, l.slug, l.xp_reward, l.display_order AS lesson_order,
      m.id AS module_id, m.name AS module_name, m.slug AS module_slug,
      m.display_order AS module_order,
      ROW_NUMBER() OVER (
        ORDER BY m.display_order, l.display_order
      ) AS global_order
    FROM lessons l
    JOIN modules m ON m.id = l.module_id
    WHERE m.certification_id = p_certification_id
      AND l.is_active = true AND m.is_active = true
  ),
  with_progress AS (
    SELECT
      ol.*,
      up.status AS progress_status,
      up.last_step_index,
      up.best_score,
      up.xp_earned,
      up.simulation_completed,
      -- Dùng LAG() để lấy trạng thái bài liền trước (kể cả khác Module)
      LAG(up.status) OVER (ORDER BY ol.global_order) AS prev_lesson_status
    FROM ordered_lessons ol
    LEFT JOIN user_progress up
      ON up.lesson_id = ol.id AND up.user_id = v_user_id
  ),
  with_computed_status AS (
    SELECT *,
      CASE
        WHEN progress_status = 'completed' THEN 'completed'
        -- Dùng cột status thay vì last_step_index (tránh lỗi step=0 bị hiểu sai)
        WHEN progress_status IN ('learning', 'practicing') THEN 'in_progress'
        WHEN global_order = 1 THEN 'available'  -- Bài đầu tiên luôn available
        WHEN prev_lesson_status = 'completed' THEN 'available'
        ELSE 'locked'
      END AS computed_status
    FROM with_progress
  )
  SELECT json_agg(
    json_build_object(
      'module_id', module_id,
      'module_name', module_name,
      'module_slug', module_slug,
      'module_order', module_order,
      'lesson_id', id,
      'title', title,
      'slug', slug,
      'xp_reward', xp_reward,
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

**Tại sao cách này vượt trội:**
- Database **luôn có toàn bộ cây dữ liệu** → `LAG()` lấy chính xác trạng thái bài liền trước dù khác Module.
- Frontend nhận JSON "nấu chín" → chỉ cần `groupBy(module_id)` rồi render. Zero logic tính toán.
- TanStack Query cache kết quả → chuyển tab quay lại không cần gọi lại API.
- `staleTime: 5 * 60 * 1000` (5 phút)

### Frontend Hook (với groupBy transform)
```typescript
// hooks/useCertificationProgress.ts
interface LessonProgressItem {
  module_id: string;
  module_name: string;
  module_slug: string;
  module_order: number;
  lesson_id: string;
  title: string;
  slug: string;
  xp_reward: number;
  status: 'completed' | 'in_progress' | 'available' | 'locked';
  last_step_index: number;
  best_score: number | null;
  xp_earned: number;
  simulation_completed: boolean;
}

interface ModuleGroup {
  id: string;
  name: string;
  slug: string;
  order: number;
  lessons: LessonProgressItem[];
}

export function useCertificationProgress(certId: string | null) {
  return useQuery({
    queryKey: ['certProgress', certId],
    queryFn: async (): Promise<ModuleGroup[]> => {
      const { data, error } = await supabase.rpc('get_certification_progress', {
        p_certification_id: certId
      });
      if (error) throw error;
      const flat: LessonProgressItem[] = data ?? [];

      // Group flat array → Module tree (dưới 1ms, rất nhẹ)
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
    enabled: !!certId,
    staleTime: 5 * 60 * 1000,
  });
}
```

---

## 3. Lesson States (4 trạng thái)

| Trạng thái | Điều kiện | Icon | Style |
|---|---|---|---|
| `completed` | `status === 'completed'` | ✅ Tích xanh | Text mờ nhẹ, viền xanh nhạt |
| `in_progress` | `status !== 'completed'` && `last_step_index > 0` | 🔵 Vòng tròn nháy | Viền accent nháy nhẹ (pulse) |
| `available` | Bài trước đã `completed` hoặc là bài đầu tiên | ⚪ Hình tròn trống | Text sáng, clickable |
| `locked` | Bài trước chưa `completed` | 🔒 Khóa | Text rất mờ, cursor not-allowed |

---

## 4. UI Layout Structure

### Cụm 1: Hero Section (Thống kê & Tiếp tục học)

```
┌──────────────────────────────────────────────────┐
│  👋 Chào mừng trở lại!                          │
│                                                  │
│  🔥 12 Days Streak    ⚡ 1,450 XP    📚 8 Lessons│
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │  📖 Đang học: VLSM & Phân chia Subnet     │  │
│  │  Module: IP Addressing & Subnetting        │  │
│  │  Tiến trình: Step 3/6 (Learn Phase)        │  │
│  │  ┌──────────────────────────────┐          │  │
│  │  │   ▶ TIẾP TỤC HỌC            │          │  │
│  │  └──────────────────────────────┘          │  │
│  └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

**Logic "Tiếp tục học":**
- Card này hiển thị `current_lesson` = bài có `status !== 'completed'` với `last_accessed_at` gần nhất.
- Nếu chưa có progress nào → hiện gợi ý bài học đầu tiên.

### Cụm 2: Cây Lộ Trình (Accordion View — Thư viện)

```
┌──────────────────────────────────────────────────┐
│  [🌐 Networking]  [🔒 Security]  [☁️ Cloud]     │ ← Track Tabs
│                                                  │
│  ── CCNA (200-301) ─────────────────── ⭐ Cơ bản │ ← Certification Block
│                                                  │
│  ▶ Module 1: Network Fundamentals          [4/5] │ ← Accordion Header
│  ▼ Module 2: Network Access (LAN & Switching)    │ ← Đang mở
│    ├─ ✅ MAC Table Learning         +100 XP      │
│    ├─ 🔵 VLAN & Trunking           +150 XP      │ ← Đang học
│    ├─ ⚪ Spanning Tree Protocol     +150 XP      │ ← Sẵn sàng
│    └─ 🔒 EtherChannel              +200 XP      │ ← Khóa
│  ▶ Module 3: IP Connectivity               [0/4] │
│                                                  │
│  ── CCNP (350-401) ──────────────── ⭐⭐ Nâng cao│
│  ▶ Module 1: Architecture                  [0/3] │
│  ...                                             │
└──────────────────────────────────────────────────┘
```

---

## 5. Deep Linking — Nút "Tiếp tục học"

Khi user bấm CTA "Tiếp tục học", hệ thống đọc `user_progress` của `current_lesson`:

| Trường hợp | Hành vi |
|---|---|
| `last_step_index < totalSteps` && `simulation_completed === false` | Navigate tới `/lesson/:slug`, auto-seek simulation tới `step = last_step_index` |
| `simulation_completed === true` | Navigate tới `/lesson/:slug` và tự động chuyển sang Phase `practice` |
| Không có progress | Navigate tới `/lesson/:slug` bình thường từ đầu |

---

## 6. Component Architecture

```
Dashboard.tsx
├── DashboardHero.tsx          (Cụm 1: Stats + Continue Card)
│   ├── StatsBar.tsx           (XP, Streak, Lessons count)
│   └── ContinueLearningCard.tsx
├── CourseExplorer.tsx          (Cụm 2: Tabs + Accordion)
│   ├── TrackTabs.tsx          (Networking | Security | Cloud)
│   ├── CertificationBlock.tsx (CCNA, CCNP header — triggers lazy RPC)
│   ├── ModuleAccordion.tsx    (Collapsible module — renders pre-computed status)
│   └── LessonItem.tsx         (Individual lesson row — zero computation)
└── hooks/
    ├── useDashboardStats.ts   (Query 1: tracks, certs, streak, total XP)
    ├── useCurrentLesson.ts    (RPC: get_current_lesson — cho nút "Tiếp tục học")
    └── useCertificationProgress.ts (RPC: get_certification_progress — lazy load + server-side status)
```

---

## 7. Responsive Behavior

| Breakpoint | Behavior |
|---|---|
| `≥ 1024px` | Full layout, Track Tabs nằm ngang |
| `768–1023px` | Tabs co lại nhỏ hơn, Stats xếp 2 hàng |
| `< 768px` | Track Tabs thành horizontal scroll, Stats xếp dọc, Accordion full width |

---

## 8. Animation & Micro-interactions

- **Accordion open/close:** `framer-motion` AnimatePresence với `height: auto` transition.
- **Lesson hover:** Glassmorphism glow effect nhẹ.
- **Stats counters:** Count-up animation khi mount lần đầu.
- **CTA pulse:** Nút "Tiếp tục học" có hiệu ứng pulse nhẹ để thu hút attention.
