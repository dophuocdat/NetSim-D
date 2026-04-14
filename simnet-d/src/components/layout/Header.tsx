import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';

export function Header() {
  const { session, signOut } = useAuth();

  return (
    <header style={{
      height: 'var(--header-height)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.5rem',
      background: 'rgba(10, 14, 26, 0.8)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--glass-border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <Link to="/" style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        color: 'var(--text-primary)', textDecoration: 'none',
      }}>
        <span style={{
          fontSize: '1.3rem', fontWeight: 700,
          background: 'var(--accent-gradient)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          SimNet-D
        </span>
        <span className="badge" style={{
          background: 'rgba(99,102,241,0.15)',
          color: 'var(--accent-primary)',
          fontSize: '0.6rem',
        }}>
          BETA
        </span>
      </Link>

      <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <Link to="/lesson/ipv4-subnet-mask" style={{
          color: 'var(--text-secondary)',
          fontSize: '0.9rem',
          transition: 'color var(--transition-fast)',
        }}>
          Học thử
        </Link>
        
        {session ? (
          <>
            <Link to="/dashboard" style={{
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              fontWeight: 500,
            }}>
              Dashboard
            </Link>
            <button onClick={signOut} className="btn" style={{
              background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--glass-border)'
            }}>
              Đăng xuất
            </button>
          </>
        ) : (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Link to="/login" style={{
               color: 'var(--text-secondary)', fontSize: '0.9rem',
            }}>
              Đăng nhập
            </Link>
            <Link to="/register" className="btn btn-primary" style={{
              padding: '0.4rem 1rem', fontSize: '0.85rem'
            }}>
              Đăng ký
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
