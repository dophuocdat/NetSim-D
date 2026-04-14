import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: '🌐',
    title: 'Mô phỏng trực quan',
    description: 'Xem trực tiếp gói tin di chuyển qua các thiết bị mạng với animation mượt mà.',
  },
  {
    icon: '✏️',
    title: 'Bài tập tương tác',
    description: 'Trắc nghiệm, điền đáp án, kéo thả — đa dạng hình thức kiểm tra kiến thức.',
  },
  {
    icon: '🧠',
    title: 'Học theo lộ trình',
    description: 'Nội dung sắp xếp từ cơ bản đến nâng cao, phù hợp CCNA và CCNP.',
  },
  {
    icon: '🏆',
    title: 'Gamification',
    description: 'Tích XP, streak, achievements — biến việc học thành trò chơi thú vị.',
  },
];

export function Landing() {
  return (
    <div>
      {/* Hero Section */}
      <section style={{
        minHeight: 'calc(100vh - var(--header-height))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
        padding: '4rem 1.5rem',
      }}>
        {/* Animated background */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          background: `
            radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 50%, rgba(139,92,246,0.1) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 100%, rgba(16,185,129,0.08) 0%, transparent 40%)
          `,
        }} />

        {/* Grid pattern */}
        <svg
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            opacity: 0.3, zIndex: 0,
          }}
        >
          <defs>
            <pattern id="hero-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="30" r="0.5" fill="var(--glass-border)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
        </svg>

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '700px' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="badge" style={{
              background: 'rgba(99,102,241,0.15)',
              color: 'var(--accent-primary)',
              marginBottom: '1.5rem',
              display: 'inline-flex',
            }}>
              🚀 CCNA & CCNP Training Platform
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              marginBottom: '1.5rem',
            }}
          >
            Học Networking bằng{' '}
            <span style={{
              background: 'var(--accent-gradient)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Mô phỏng trực quan
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              fontSize: '1.15rem', color: 'var(--text-secondary)',
              maxWidth: '550px', margin: '0 auto 2.5rem', lineHeight: 1.7,
            }}
          >
            SimNet-D giúp bạn hiểu sâu mạng máy tính qua các mô phỏng tương tác.
            Xem gói tin di chuyển, hiểu subnet mask, cấu hình router — tất cả trên trình duyệt.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <Link to="/lesson/ipv4-subnet-mask" className="btn btn-primary btn-lg">
              Bắt đầu học miễn phí
            </Link>
            <a href="#features" className="btn btn-secondary btn-lg">
              Tìm hiểu thêm
            </a>
          </motion.div>

          {/* Mini topology preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            style={{ marginTop: '3rem' }}
          >
            <svg viewBox="0 0 500 120" style={{
              width: '100%', maxWidth: '500px',
              filter: 'drop-shadow(0 0 20px rgba(99,102,241,0.2))',
            }}>
              <defs>
                <pattern id="mini-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="10" cy="10" r="0.3" fill="rgba(255,255,255,0.1)" />
                </pattern>
              </defs>
              <rect width="500" height="120" rx="12" fill="var(--bg-secondary)" stroke="var(--glass-border)" strokeWidth="1" />
              <rect width="500" height="120" rx="12" fill="url(#mini-grid)" />

              {/* Devices */}
              <text x="80" y="55" textAnchor="middle" fill="var(--text-primary)" fontSize="24">💻</text>
              <text x="80" y="80" textAnchor="middle" fill="var(--text-secondary)" fontSize="9" fontFamily="JetBrains Mono">PC-A</text>

              <text x="250" y="55" textAnchor="middle" fill="var(--text-primary)" fontSize="24">🌐</text>
              <text x="250" y="80" textAnchor="middle" fill="var(--text-secondary)" fontSize="9" fontFamily="JetBrains Mono">Router</text>

              <text x="420" y="55" textAnchor="middle" fill="var(--text-primary)" fontSize="24">💻</text>
              <text x="420" y="80" textAnchor="middle" fill="var(--text-secondary)" fontSize="9" fontFamily="JetBrains Mono">PC-B</text>

              {/* Lines */}
              <line x1="110" y1="50" x2="220" y2="50" stroke="var(--connection-line)" strokeWidth="1.5" />
              <line x1="280" y1="50" x2="390" y2="50" stroke="var(--connection-line)" strokeWidth="1.5" />

              {/* Animated packet */}
              <circle r="4" fill="var(--packet-icmp)" opacity="0.9">
                <animateMotion dur="3s" repeatCount="indefinite" path="M 110,50 L 220,50 L 280,50 L 390,50" />
              </circle>
            </svg>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section" style={{ padding: '4rem 1.5rem' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 className="section-title">Tính năng nổi bật</h2>
            <p className="section-subtitle">Mọi thứ bạn cần để chinh phục chứng chỉ Cisco</p>
          </div>

          <div className="grid-4">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card"
                style={{ textAlign: 'center' }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{feature.icon}</div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  {feature.title}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '4rem 1.5rem', textAlign: 'center',
        background: 'linear-gradient(to bottom, transparent, rgba(99,102,241,0.05))',
      }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 style={{
              fontSize: '1.8rem', fontWeight: 700, marginBottom: '1rem',
              background: 'var(--accent-gradient)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Sẵn sàng bắt đầu?
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.05rem' }}>
              Bài học đầu tiên: IPv4 Subnet Mask — hoàn toàn miễn phí
            </p>
            <Link to="/lesson/ipv4-subnet-mask" className="btn btn-primary btn-lg">
              🚀 Học ngay
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
