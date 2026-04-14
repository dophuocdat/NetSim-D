import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class SimulationErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[SimulationErrorBoundary]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="sim-panel" style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚠️</div>
          <h3 style={{ color: 'var(--warning)', marginBottom: '0.5rem' }}>
            Lỗi khi tải mô phỏng
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            Dữ liệu cấu hình mô phỏng có thể bị lỗi. Bạn vẫn có thể đọc nội dung bài học bên dưới.
          </p>
          <button
            className="btn btn-secondary"
            onClick={() => this.setState({ hasError: false })}
          >
            Thử lại
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
