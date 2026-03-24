import React from 'react';
import { createRoot } from 'react-dom/client';
import '@patternfly/react-core/dist/styles/base.css';
import App from '../code.jsx';
import './index.css';

class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    const { error } = this.state;
    if (error) {
      return (
        <div style={{ padding: '24px', fontFamily: 'system-ui, sans-serif' }}>
          <h1 style={{ color: '#c9190b' }}>Something went wrong</h1>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '13px' }}>{error.stack || error.message}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const el = document.getElementById('root');
if (!el) {
  throw new Error('Missing #root element');
}

createRoot(el).render(
  <React.StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </React.StrictMode>
);
