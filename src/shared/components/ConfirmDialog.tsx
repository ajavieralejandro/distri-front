import { Modal } from '@/shared/components/Modal';
export function ConfirmDialog({
  title,
  message,
  onConfirm,
  onCancel,
  busy = false,
}: {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  busy?: boolean;
}) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="text-slate-600">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="rounded-md border px-3 py-2"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className="rounded-md bg-teal-700 px-3 py-2 text-white disabled:opacity-50"
        >
          {busy ? 'Procesando…' : 'Confirmar'}
        </button>
      </div>
    </Modal>
  );
}
