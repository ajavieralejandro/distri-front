import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { env } from '@/app/config/env';
import { clearDemoSession } from '@/features/auth/session';
import { useCartStore } from '@/features/orders/cart-store';
import { resetDemoData } from '@/mocks/reset-demo';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
export function ResetDemoButton() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  if (!env.isMockDataSource || !env.demoMode) return null;
  const reset = async () => {
    resetDemoData();
    clearDemoSession();
    useCartStore.getState().clear();
    await queryClient.invalidateQueries();
    navigate('/login');
  };
  return (
    <>
      {open && (
        <ConfirmDialog
          title="Restablecer demostración"
          message="Se restaurarán todos los datos ficticios y se cerrará la sesión."
          onConfirm={() => void reset()}
          onCancel={() => setOpen(false)}
        />
      )}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm text-slate-600 underline"
      >
        Restablecer demostración
      </button>
    </>
  );
}
