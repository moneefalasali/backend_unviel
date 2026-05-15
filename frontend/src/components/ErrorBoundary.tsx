import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-primary-bg flex items-center justify-center p-6">
          <div className="bg-primary-dark rounded-2xl shadow-2xl p-8 max-w-md text-center">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Something went wrong</h2>
            <p className="text-neutral-gray mb-6">
              An unexpected error occurred. Please refresh the page or try again later.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-accent-gold text-primary-dark px-6 py-3 rounded-lg font-medium hover:bg-yellow-500 transition-colors"
            >
              Refresh Page
            </button>
            {import.meta.env.DEV && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="text-neutral-gray cursor-pointer">Error Details</summary>
                <pre className="text-red-400 text-sm mt-2 whitespace-pre-wrap">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}