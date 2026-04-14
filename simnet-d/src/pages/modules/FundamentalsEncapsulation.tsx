import { useMachine } from '@xstate/react';
import { motion, AnimatePresence } from 'framer-motion';
import { encapsulationMachine } from '../../machines/encapsulationMachine';
import PacketMatryoshka from '../../components/module1/PacketMatryoshka';
import StepControls from '../../components/module1/StepControls';
import { useLessonData } from '../../hooks/useLessonData';
import '../../styles/module1.css';

const STEP_NARRATIONS: Record<string, { title: string; text: string; icon: string }> = {
  idle: {
    title: 'Khởi Tạo',
    text: 'Dữ liệu HTTP gốc đang nằm tại tầng Application. Bấm "Next" để bắt đầu quá trình đóng gói xuống các tầng OSI bên dưới.',
    icon: '📄',
  },
  l4_packing: {
    title: 'Tầng 4: Transport (TCP/UDP)',
    text: 'Segment được tạo! Port Number (cổng 80 - HTTP) được gắn vào header để xác định ứng dụng đích trên máy nhận.',
    icon: '📦',
  },
  l3_packing: {
    title: 'Tầng 3: Network (IP)',
    text: 'Packet được tạo! Địa chỉ IP nguồn và đích được gắn vào header. Đây là "địa chỉ nhà" giúp Router xác định đường đi.',
    icon: '🌐',
  },
  l2_packing: {
    title: 'Tầng 2: Data Link (Ethernet)',
    text: 'Frame hoàn thiện! Địa chỉ MAC được bọc ngoài cùng. Đây là "biển số xe" để Switch nhận diện thiết bị trên mạng LAN cục bộ.',
    icon: '🔗',
  },
  on_wire: {
    title: 'Truyền Tín Hiệu',
    text: 'Frame đã được chuyển thành tín hiệu điện (hoặc quang) và đang di chuyển trên đường dây vật lý (Layer 1) tới thiết bị đích!',
    icon: '⚡',
  },
  decapsulating: {
    title: 'Giải Mã (De-Encapsulation)',
    text: 'Server nhận được tín hiệu. Các lớp bọc được gỡ ra theo thứ tự ngược lại: L2 → L3 → L4, để trích xuất dữ liệu gốc.',
    icon: '🔓',
  },
  delivered: {
    title: 'Hoàn Tất!',
    text: 'Dữ liệu HTTP nguyên vẹn đã được giao tới ứng dụng Web Server. Quá trình Encapsulation/De-Encapsulation thành công! 🎉',
    icon: '✅',
  },
};

const STATES_ORDER = ['idle', 'l4_packing', 'l3_packing', 'l2_packing', 'on_wire', 'decapsulating', 'delivered'];

export default function FundamentalsEncapsulation() {
  const [state, send] = useMachine(encapsulationMachine);
  const { data: lesson, isLoading, error } = useLessonData('encapsulation');

  if (isLoading) {
    return <div className="encap-loading">Đang tải cấu hình mô phỏng...</div>;
  }

  if (error || !lesson) {
    return <div className="encap-error">Lỗi tải dữ liệu: {error ? error.toString() : 'Không tìm thấy'}</div>;
  }

  const topo = lesson.base_topology;
  const currentState = state.value as string;
  const currentStepIndex = STATES_ORDER.indexOf(currentState);
  const narration = STEP_NARRATIONS[currentState] || STEP_NARRATIONS.idle;

  const canNext = currentState !== 'delivered';
  const canPrev = currentState !== 'idle';

  const isOnWire = currentState === 'on_wire';
  const isDecap = currentState === 'decapsulating';
  const isDelivered = currentState === 'delivered';

  return (
    <div className="encap-container">
      <div className="encap-layout">
        
        {/* LEFT PANEL */}
        <aside className="encap-left-panel">
          <header className="encap-header">
            <div className="encap-badge">Giai Đoạn 1</div>
            <h1>{lesson.title}</h1>
          </header>

          {/* Progress Dots */}
          <div className="progress-dots">
            {STATES_ORDER.map((s, i) => (
              <div key={s} className={`dot ${i === currentStepIndex ? 'dot-active' : i < currentStepIndex ? 'dot-done' : ''}`}>
                <div className="dot-circle">{i < currentStepIndex ? '✓' : i + 1}</div>
              </div>
            ))}
          </div>

          {/* Narration Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentState}
              className="narration-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
            >
              <div className="narration-icon">{narration.icon}</div>
              <h3 className="narration-title">{narration.title}</h3>
              <p className="narration-text">{narration.text}</p>
            </motion.div>
          </AnimatePresence>

          <div style={{ flex: 1 }} />

          {/* Step Controls */}
          <div className="encap-glass-card">
            <StepControls
              canNext={canNext}
              canPrev={canPrev}
              onNext={() => send({ type: 'NEXT_STEP' })}
              onPrev={() => send({ type: 'PREV_STEP' })}
            />
          </div>
        </aside>

        {/* RIGHT PANEL: Animation Stage */}
        <main className="encap-right-panel">
          <div className="encap-stage encap-glass-card">

            {/* Wire glow effect */}
            <div className={`wire-glow ${isOnWire ? 'wire-active' : ''}`} />

            <div className="encap-topology">
              {/* Source Device */}
              <motion.div 
                className="device-box"
                animate={isOnWire ? { opacity: 0.4, scale: 0.95 } : { opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="device-icon"><span>💻</span></div>
                <div className="device-info">
                  <div className="device-name">{topo.source.name}</div>
                  <div className="device-ip">{topo.source.ip}</div>
                </div>
              </motion.div>

              {/* Fiber Wire with sliding packet */}
              <div className="fiber-wire">
                <motion.div 
                  className="packet-anchor"
                  animate={
                    isOnWire ? { x: '30%' }
                    : isDecap || isDelivered ? { x: '55%' }
                    : { x: '0%' }
                  }
                  transition={{ type: 'spring', damping: 18, stiffness: 60, mass: 1.2 }}
                >
                  <PacketMatryoshka currentState={currentState} topo={topo} />
                </motion.div>

                {/* Data particles flowing on wire */}
                {isOnWire && (
                  <div className="wire-particles">
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="wire-particle"
                        initial={{ x: '-10%', opacity: 0 }}
                        animate={{ x: '110%', opacity: [0, 1, 1, 0] }}
                        transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity, ease: 'linear' }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Destination Device */}
              <motion.div 
                className="device-box"
                animate={
                  isDecap || isDelivered 
                    ? { opacity: 1, scale: 1.05, filter: 'drop-shadow(0 0 15px rgba(16,185,129,0.5))' }
                    : { opacity: isOnWire ? 0.4 : 1, scale: 1, filter: 'none' }
                }
                transition={{ duration: 0.5 }}
              >
                <div className="device-icon"><span>🖥️</span></div>
                <div className="device-info">
                  <div className="device-name">{topo.destination.name}</div>
                  <div className="device-ip">{topo.destination.ip}</div>
                </div>
              </motion.div>
            </div>
          </div>
        </main>

      </div>
    </div>
  );
}
