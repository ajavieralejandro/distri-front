import { Component, type ErrorInfo, type ReactNode } from 'react';

import { ErrorState } from '@/shared/components/ErrorState';

type AppErrorBoundaryProps = {
  children: ReactNode;
};

type AppErrorBoundaryState = {
  hasError: boolean;
  message: string;
};

export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = {
    hasError: false,
    message: '',
  };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || 'Error inesperado de renderizado',
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Unhandled UI error', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto flex min-h-screen max-w-lg items-center px-4">
          <ErrorState
            title="No se pudo mostrar la aplicación"
            message={this.state.message}
          />
        </div>
      );
    }

    return this.props.children;
  }
}
