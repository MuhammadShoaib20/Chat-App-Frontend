import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) { // eslint-disable-line no-unused-vars
    // Update state so the next render shows fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // ✅ Use error here to satisfy the linter
    console.error('Caught error:', error, errorInfo);
    // Optionally send to an error reporting service
  }

  render() {
    if (this.state.hasError) {
      const isDev = import.meta?.env?.DEV;
      return (
        <div style={{ padding: 16, maxWidth: 900, margin: '0 auto' }}>
          <h1>Something went wrong. Please refresh the page.</h1>
          {isDev && this.state.error && (
            <pre style={{ whiteSpace: 'pre-wrap', marginTop: 12, padding: 12, background: '#111', color: '#fff', borderRadius: 8 }}>
              {String(this.state.error?.stack || this.state.error?.message || this.state.error)}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;