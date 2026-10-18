import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { CommercialOrderDetailView } from '@/pages/admin/CommercialOrderDetailPage';
import type { CommercialOrder } from '@/features/orders/commercial-order';
import { renderWithProviders } from '@/test/render-with-providers';

const order: CommercialOrder = {
  id: 'ord-1',
  number: 'PED-41',
  commerceId: 'com-norte',
  commerceName: 'Kiosco Norte',
  status: 'PENDING',
  createdAt: '2026-10-18T12:00:00.000Z',
  updatedAt: '2026-10-18T12:00:00.000Z',
  notes: 'Sin sal',
  paymentMethod: 'CASH',
  paidAmount: { amount: '0.00', currency: 'ARS' },
  delivery: {
    mode: 'DELIVERY',
    recipient: 'Ana Norte',
    phone: '1100000000',
    address: 'Av. Siempre Viva 123',
    city: 'Rosario',
    references: 'Portón verde',
  },
  items: [
    {
      productId: 'prod-1',
      sku: 'AGUA',
      name: 'Agua',
      unit: 'PACK',
      unitPrice: { amount: '850.50', currency: 'ARS' },
      quantity: 2,
      lineTotal: { amount: '1701.00', currency: 'ARS' },
    },
  ],
  subtotal: { amount: '1701.00', currency: 'ARS' },
  total: { amount: '1701.00', currency: 'ARS' },
  history: [
    {
      id: 'evt-1',
      fromStatus: null,
      toStatus: 'PENDING',
      createdAt: '2026-10-18T12:00:00.000Z',
      note: null,
    },
  ],
};

describe('commercial order detail', () => {
  it('shows the commerce, delivery, cash method and unpaid amount', () => {
    renderWithProviders(
      <CommercialOrderDetailView
        order={order}
        isPending={false}
        actionPending={false}
        onRequestStatus={vi.fn()}
        onConfirm={vi.fn()}
        onDismiss={vi.fn()}
      />,
    );

    expect(screen.getByText('Kiosco Norte')).toBeInTheDocument();
    expect(
      screen.getByText('Av. Siempre Viva 123, Rosario'),
    ).toBeInTheDocument();
    expect(screen.getByText('Ana Norte')).toBeInTheDocument();
    expect(screen.getByText('Portón verde')).toBeInTheDocument();
    expect(screen.getByText('Efectivo')).toBeInTheDocument();
    expect(screen.getByText('Agua')).toBeInTheDocument();
    expect(screen.getByText(/2 pack/)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Confirmar pedido' }),
    ).toBeEnabled();
    expect(
      screen.queryByRole('button', { name: 'Pasar a preparación' }),
    ).toBeNull();
    expect(screen.queryByText(/Despachado|Preparado/)).toBeNull();
  });

  it('confirms only through the admitted action and blocks a second click', async () => {
    const user = userEvent.setup();
    const onRequestStatus = vi.fn();
    const onConfirm = vi.fn();
    const { rerender } = renderWithProviders(
      <CommercialOrderDetailView
        order={order}
        isPending={false}
        actionPending={false}
        onRequestStatus={onRequestStatus}
        onConfirm={onConfirm}
        onDismiss={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Confirmar pedido' }));
    expect(onRequestStatus).toHaveBeenCalledWith('CONFIRMED');

    rerender(
      <CommercialOrderDetailView
        order={order}
        isPending={false}
        actionPending
        requestedStatus="CONFIRMED"
        actionError="No hay stock suficiente para confirmar el pedido."
        onRequestStatus={onRequestStatus}
        onConfirm={onConfirm}
        onDismiss={vi.fn()}
      />,
    );

    const confirm = screen.getByRole('button', { name: 'Procesando…' });
    expect(confirm).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Confirmar pedido' }),
    ).toBeDisabled();
    expect(screen.getByRole('alert')).toHaveTextContent(/stock suficiente/);
    await user.click(confirm);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('does not offer confirmation once the order is already confirmed', () => {
    renderWithProviders(
      <CommercialOrderDetailView
        order={{ ...order, status: 'CONFIRMED' }}
        isPending={false}
        actionPending={false}
        onRequestStatus={vi.fn()}
        onConfirm={vi.fn()}
        onDismiss={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole('button', { name: 'Confirmar pedido' }),
    ).toBeNull();
    expect(
      screen.getByRole('button', { name: 'Pasar a preparación' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Cancelar pedido' }),
    ).toBeInTheDocument();
  });
});
