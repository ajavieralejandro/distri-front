import { useState } from 'react';
import { Link } from 'react-router-dom';

import { env } from '@/app/config/env';
import {
  ApiUrlError,
  API_URL_HELP,
  normalizeApiBaseUrl,
} from '@/shared/connection/api-url';
import {
  allowsCleartextHttp,
  readActiveBaseUrl,
  initialApiBaseUrl,
} from '@/shared/connection/connection-store';
import {
  describeProbeResult,
  probeServer,
} from '@/shared/connection/probe-server';
import {
  commitApiBaseUrl,
  serverSwitchConfirmation,
  serverSwitchImpact,
  switchNeedsConfirmation,
} from '@/shared/connection/server-switch';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';

export function ConnectionPage() {
  const [active, setActive] = useState<string | null>(readActiveBaseUrl());
  const [draft, setDraft] = useState(active ?? '');
  const [probeText, setProbeText] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [probing, setProbing] = useState(false);
  const [confirming, setConfirming] = useState<{ next: string | null } | null>(
    null,
  );
  const [confirmText, setConfirmText] = useState('');
  const cleartext = allowsCleartextHttp();
  const showCleartextWarning =
    draft.trim().toLowerCase().startsWith('http://') ||
    (active ?? '').startsWith('http://');

  const remember = (value: string | null) => {
    setActive(value);
    setDraft(value ?? '');
  };

  const normalizeDraft = () =>
    normalizeApiBaseUrl(draft, { allowCleartext: cleartext });

  const onProbe = async () => {
    setError('');
    setNotice('');
    setConfirming(null);
    let normalized: string;
    try {
      normalized = normalizeDraft();
    } catch (caught) {
      setProbeText(
        caught instanceof Error ? caught.message : 'La dirección no es válida.',
      );
      return;
    }
    const controller = new AbortController();
    setProbing(true);
    setProbeText('Comprobando…');
    try {
      const pageProtocol =
        typeof window !== 'undefined' ? window.location.protocol : undefined;
      const result = await probeServer(normalized, {
        signal: controller.signal,
        pageProtocol,
      });
      setProbeText(describeProbeResult(result));
    } catch (caught) {
      if (controller.signal.aborted) {
        return;
      }
      setProbeText(
        caught instanceof Error
          ? caught.message
          : 'No se pudo comprobar la conexión.',
      );
    } finally {
      setProbing(false);
    }
  };

  const apply = (next: string | null) => {
    commitApiBaseUrl(next);
    const current = readActiveBaseUrl();
    remember(current);
    setConfirming(null);
    setNotice(
      'Dirección guardada. La comprobación no inicia sesión ni envía pedidos.',
    );
  };

  const requestCommit = (next: string | null) => {
    setError('');
    setNotice('');
    const current = readActiveBaseUrl();
    if (current === next) {
      commitApiBaseUrl(next);
      remember(readActiveBaseUrl());
      setNotice('La dirección activa no cambió.');
      return;
    }
    const impact = serverSwitchImpact();
    if (switchNeedsConfirmation(impact)) {
      setConfirming({ next });
      setConfirmText(serverSwitchConfirmation(impact, current));
      return;
    }
    apply(next);
  };

  const onSave = () => {
    try {
      requestCommit(normalizeDraft());
    } catch (caught) {
      setError(
        caught instanceof ApiUrlError
          ? caught.message
          : 'La dirección no es válida.',
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8">
      <section className="mx-auto max-w-xl rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-teal-800">Distrisoft</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">
          Conexión con el servidor
        </h1>
        <p className="mt-3 text-sm text-slate-700">
          Dirección activa: {active ?? 'sin configurar'}
        </p>
        <p className="mt-2 text-sm text-slate-600">{API_URL_HELP}</p>
        {env.isMockDataSource ? (
          <p className="mt-2 text-sm text-slate-600">
            Esta compilación sigue en demostración. La prueba de conexión habla
            con la dirección escrita y no con los mocks. El resto de la demo no
            cambia de servidor hasta usar la variante API.
          </p>
        ) : (
          <p className="mt-2 text-sm text-slate-600">
            Modo API: las pantallas usan solo esta dirección. Si falla, no se
            muestran datos de demostración.
          </p>
        )}
        {env.allowCleartext && cleartext ? (
          <p className="mt-3 text-sm font-semibold text-amber-800">
            Esta compilación de pruebas internas permite HTTP. No uses cuentas
            ni datos reales.
          </p>
        ) : null}
        {showCleartextWarning ? (
          <p className="mt-2 text-sm font-semibold text-amber-800">
            Conexión sin cifrar. No uses cuentas ni datos reales.
          </p>
        ) : null}
        <label className="mt-5 block text-sm font-medium text-slate-700">
          Dirección del servidor
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="https://servidor.ejemplo"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
        {error ? (
          <p className="mt-3 text-sm font-semibold text-red-700">{error}</p>
        ) : null}
        {probeText ? (
          <p className="mt-3 text-sm text-slate-800" role="status">
            {probeText}
          </p>
        ) : null}
        {notice ? (
          <p className="mt-3 text-sm font-semibold text-emerald-800">
            {notice}
          </p>
        ) : null}
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void onProbe()}
            disabled={probing}
            className="rounded-lg border border-teal-700 px-4 py-2 text-sm font-semibold text-teal-800 disabled:opacity-60"
          >
            {probing ? 'Comprobando…' : 'Probar conexión'}
          </button>
          <button
            type="button"
            onClick={onSave}
            className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white"
          >
            Guardar
          </button>
          <button
            type="button"
            onClick={() => requestCommit(initialApiBaseUrl())}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Restaurar configuración inicial
          </button>
        </div>
        <Link to="/login" className="mt-6 inline-block text-sm text-teal-800">
          Volver al ingreso
        </Link>
      </section>
      {confirming ? (
        <ConfirmDialog
          title="Cambiar de servidor"
          message={confirmText}
          onCancel={() => setConfirming(null)}
          onConfirm={() => apply(confirming.next)}
        />
      ) : null}
    </div>
  );
}
