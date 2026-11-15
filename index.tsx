import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

interface ErrorBoundaryState {
  hasError: boolean;
}

class AppErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('App crashed:', error);
    if (error?.name === 'QuotaExceededError') {
      try {
        localStorage.removeItem('userJournal');
      } catch {
        // ignore
      }
    }
  }

  handleRecover = () => {
    try {
      localStorage.removeItem('userJournal');
    } catch {
      // ignore
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-sky-50 flex items-center justify-center p-6 text-center">
          <div className="bg-white max-w-md w-full rounded-3xl border border-slate-200 shadow-xl p-8 space-y-4">
            <div className="text-5xl">🐻</div>
            <h1 className="text-2xl font-bold text-slate-900">Ups, Penyimpanan Penuh!</h1>
            <p className="text-sm text-slate-600">
              Memori browser di perangkat ini penuh. Klik tombol di bawah untuk merapikan cache media agar bisa lanjut belajar (poin dan progresmu tetap aman).
            </p>
            <button
              onClick={this.handleRecover}
              className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm cursor-pointer"
            >
              Rapikan & Lanjutkan Belajar 🚀
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </React.StrictMode>
);
