import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '1.5rem',
          margin: '1rem auto',
          maxWidth: '500px',
          backgroundColor: '#fff1f2',
          border: '1px solid #fecdd3',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#9f1239'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
            <AlertTriangle size={36} color="#e11d48" />
          </div>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 700 }}>
            {this.props.fallbackTitle || 'Component Display Notice'}
          </h3>
          <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: '#881337' }}>
            {this.state.error?.message || 'An unexpected rendering issue occurred.'}
          </p>
          <button
            onClick={this.handleRetry}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#e11d48',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            <RefreshCw size={14} /> Close / Dismiss
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
