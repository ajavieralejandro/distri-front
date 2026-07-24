import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { App } from '@/app/App';
import { AppErrorBoundary } from '@/app/errors/AppErrorBoundary';
import { AppProviders } from '@/app/providers/AppProviders';
import { env } from '@/app/config/env';
import { shouldStartMockWorker } from '@/mocks/should-start-worker';
import '@/styles/index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element "#root" was not found in index.html');
}

async function prepareApp() {
  if (shouldStartMockWorker(env, import.meta.env.PROD)) {
    const { startMockWorker } = await import('@/mocks/browser');
    await startMockWorker();
  }
}
prepareApp().then(() =>
  createRoot(rootElement).render(
    <StrictMode>
      <AppErrorBoundary>
        <AppProviders>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AppProviders>
      </AppErrorBoundary>
    </StrictMode>,
  ),
);
