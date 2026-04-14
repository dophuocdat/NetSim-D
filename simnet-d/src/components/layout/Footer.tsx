export function Footer() {
  return (
    <footer style={{
      padding: '2rem 1.5rem',
      borderTop: '1px solid var(--glass-border)',
      textAlign: 'center',
      marginTop: 'auto',
    }}>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        © {new Date().getFullYear()} SimNet-D — Nền tảng mô phỏng Networking
      </p>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
        Built for CCNA & CCNP learners 🌐
      </p>
    </footer>
  );
}
