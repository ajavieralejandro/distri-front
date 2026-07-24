import type { ReactNode } from 'react';
import { BrowserRouter, HashRouter } from 'react-router-dom';

import { getRouterMode } from '@/app/router/router-mode';

type AppRouterProviderProps = {
  children: ReactNode;
};

function browserBasename(baseUrl: string): string | undefined {
  const trimmed = baseUrl.replace(/\/$/, '');
  return trimmed === '' ? undefined : trimmed;
}

export function AppRouterProvider({ children }: AppRouterProviderProps) {
  const mode = getRouterMode();

  if (mode === 'hash') {
    return <HashRouter>{children}</HashRouter>;
  }

  return (
    <BrowserRouter basename={browserBasename(import.meta.env.BASE_URL)}>
      {children}
    </BrowserRouter>
  );
}
