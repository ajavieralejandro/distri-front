import { getDatabase } from '@/mocks/data/mock-database';
import type { DemoSession } from '@/shared/types/demo';
import { HttpResponse, http } from 'msw';

import { api, withLatency } from './utils';

type LoginRequest = { email?: unknown; password?: unknown };

export const authHandlers = [
  http.post(api('/auth/demo/login'), async ({ request }) => {
    await withLatency();
    const body = (await request.json()) as LoginRequest;
    const database = getDatabase();
    const user = database.users.find(
      (candidate) =>
        candidate.email === body.email && candidate.password === body.password,
    );

    if (!user) {
      return HttpResponse.json(
        { message: 'Credenciales inválidas.' },
        { status: 401 },
      );
    }

    const session: DemoSession = {
      userId: user.id,
      role: user.role,
      displayName: user.displayName,
      email: user.email,
      ...(user.commerceId ? { commerceId: user.commerceId } : {}),
    };
    return HttpResponse.json(session);
  }),

  http.post(api('/auth/demo/logout'), async () => {
    await withLatency();
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(api('/auth/demo/session'), async ({ request }) => {
    await withLatency();
    const userId = new URL(request.url).searchParams.get('userId');
    const user = userId
      ? getDatabase().users.find((candidate) => candidate.id === userId)
      : undefined;

    if (!user) {
      return HttpResponse.json(
        { message: 'Sesión de demo no encontrada.' },
        { status: 404 },
      );
    }

    return HttpResponse.json({
      userId: user.id,
      role: user.role,
      displayName: user.displayName,
      email: user.email,
      ...(user.commerceId ? { commerceId: user.commerceId } : {}),
    } satisfies DemoSession);
  }),
];
