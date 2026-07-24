import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from '@/app/App';
import { env } from '@/app/config/env';
import { AppErrorBoundary } from '@/app/errors/AppErrorBoundary';
import { AppProviders } from '@/app/providers/AppProviders';
import { AppRouterProvider } from '@/app/router/AppRouterProvider';
import { shouldStartMockWorker } from '@/mocks/should-start-worker';
import '@/styles/index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element "#root" was not found in index.html');
}

async function prepareApp() {
  if (shouldStartMockWorker(env)) {
    const { startMockWorker } = await import('@/mocks/browser');
    await startMockWorker();
  }
}

prepareApp().then(() =>
  createRoot(rootElement).render(
    <StrictMode>
      <AppErrorBoundary>
        <AppProviders>
          <AppRouterProvider>
            <App />
          </AppRouterProvider>
        </AppProviders>
      </AppErrorBoundary>
    </StrictMode>,
  ),
);
