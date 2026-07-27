import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Can } from '@/features/auth/Can';
import {
  stockAdjustSchema,
  useAdjustInventoryMutation,
  useInventoryQuery,
  type StockAdjustFormValues,
} from '@/features/inventory/hooks';
import { useProductsQuery } from '@/features/products/hooks';
import { Modal } from '@/shared/components/Modal';
import { PageHeader } from '@/shared/components/PageHeader';
import { QueryState } from '@/shared/components/QueryState';
import type { InventoryItem } from '@/shared/types/demo';

const WAREHOUSE_NAMES: Record<string, string> = {
  'wh-1': 'Depósito Central',
  'wh-2': 'Depósito Norte',
};

export function InventoryPage() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get('search') ?? '');
  const [lowStockOnly, setLowStockOnly] = useState(
    params.get('lowStock') === '1',
  );
  const [selected, setSelected] = useState<InventoryItem | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const next = new URLSearchParams();
    if (search) next.set('search', search);
    if (lowStockOnly) next.set('lowStock', '1');
    setParams(next, { replace: true });
  }, [search, lowStockOnly, setParams]);

  const inventoryQuery = useInventoryQuery({
    search: search || undefined,
    lowStock: lowStockOnly || undefined,
  });
  const productsQuery = useProductsQuery();
  const adjustMutation = useAdjustInventoryMutation();

  const productNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const product of productsQuery.data ?? []) {
      map.set(product.id, product.name);
    }
    return map;
  }, [productsQuery.data]);

  const summary = useMemo(() => {
    const items = inventoryQuery.data ?? [];
    const critical = items.filter(
      (item) =>
        item.availableStock > 0 &&
        item.availableStock <= item.lowStockThreshold,
    ).length;
    const empty = items.filter((item) => item.availableStock <= 0).length;
    const reserved = items.reduce((sum, item) => sum + item.reservedStock, 0);
    return { critical, empty, reserved, total: items.length };
  }, [inventoryQuery.data]);

  const form = useForm<StockAdjustFormValues>({
    resolver: zodResolver(stockAdjustSchema),
    defaultValues: { quantity: 1, reason: '' },
  });

  const closeModal = () => {
    setSelected(null);
    form.reset({ quantity: 1, reason: '' });
  };

  const onSubmit = form.handleSubmit((values) => {
    if (!selected) {
      return;
    }

    adjustMutation.mutate(
      {
        productId: selected.productId,
        warehouseId: selected.warehouseId,
        quantity: values.quantity,
        reason: values.reason,
      },
      {
        onSuccess: () => {
          setSuccessMessage('Ajuste simulado aplicado.');
          closeModal();
        },
      },
    );
  });

  return (
    <section>
      <PageHeader
        title="Inventario"
        description="Stock físico, reservado y disponible por depósito. Los ajustes se centralizan como movimientos simulados."
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-4">
        {[
          ['Ítems listados', summary.total],
          ['Stock crítico', summary.critical],
          ['Sin stock', summary.empty],
          ['Unidades reservadas', summary.reserved],
        ].map(([label, value]) => (
          <div
            key={String(label)}
            className="rounded-lg bg-white p-3 shadow-sm"
          >
            <p className="text-xs text-slate-500">{label}</p>
            <p className="text-xl font-semibold">{value}</p>
          </div>
        ))}
      </div>

      {successMessage ? (
        <p className="mb-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {successMessage}
        </p>
      ) : null}

      <div className="mb-4 flex flex-wrap gap-3">
        <input
          aria-label="Buscar inventario"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="Buscar por producto o SKU"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(event) => setLowStockOnly(event.target.checked)}
          />
          Solo stock bajo / crítico
        </label>
        <Link
          to="/admin/alerts"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm text-teal-900"
        >
          Ver alertas de stock
        </Link>
      </div>

      <QueryState
        isPending={inventoryQuery.isPending || productsQuery.isPending}
        isError={inventoryQuery.isError || productsQuery.isError}
        isEmpty={!inventoryQuery.data?.length}
      >
        {inventoryQuery.data ? (
          <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600">
                  <th className="p-3">Producto</th>
                  <th className="p-3">Depósito</th>
                  <th className="p-3">Físico</th>
                  <th className="p-3">Reservado</th>
                  <th className="p-3">Disponible</th>
                  <th className="p-3">Mínimo</th>
                  <th className="p-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {inventoryQuery.data.map((item) => {
                  const isLow = item.availableStock <= item.lowStockThreshold;
                  return (
                    <tr key={item.id} className="border-b border-slate-100">
                      <td className="p-3">
                        {productNameById.get(item.productId) ?? item.productId}
                        {isLow ? (
                          <span className="ml-2 text-amber-700">
                            {item.availableStock <= 0
                              ? 'Sin stock'
                              : 'Stock bajo'}
                          </span>
                        ) : null}
                      </td>
                      <td className="p-3">
                        {WAREHOUSE_NAMES[item.warehouseId] ?? item.warehouseId}
                      </td>
                      <td className="p-3">{item.physicalStock}</td>
                      <td className="p-3">{item.reservedStock}</td>
                      <td
                        className={`p-3 ${isLow ? 'font-medium text-amber-700' : ''}`}
                      >
                        {item.availableStock}
                      </td>
                      <td className="p-3">{item.lowStockThreshold}</td>
                      <td className="p-3">
                        <Can permission="inventory:adjust">
                          <button
                            type="button"
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
                            onClick={() => {
                              setSuccessMessage(null);
                              setSelected(item);
                            }}
                          >
                            Ajuste simulado
                          </button>
                        </Can>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </QueryState>

      {selected ? (
        <Modal title="Ajuste simulado" onClose={closeModal}>
          <p className="mb-4 text-sm text-slate-600">
            Este movimiento no afecta un depósito real. Motivo obligatorio.
          </p>
          <form className="space-y-4" onSubmit={onSubmit}>
            <label className="block text-sm font-medium text-slate-800">
              Cantidad (positiva o negativa)
              <input
                type="number"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                {...form.register('quantity', { valueAsNumber: true })}
              />
            </label>
            {form.formState.errors.quantity ? (
              <p className="text-sm text-red-700">
                {form.formState.errors.quantity.message}
              </p>
            ) : null}

            <label className="block text-sm font-medium text-slate-800">
              Motivo
              <textarea
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                rows={3}
                {...form.register('reason')}
              />
            </label>
            {form.formState.errors.reason ? (
              <p className="text-sm text-red-700">
                {form.formState.errors.reason.message}
              </p>
            ) : null}

            {adjustMutation.error ? (
              <p role="alert" className="text-sm text-red-700">
                {adjustMutation.error.message}
              </p>
            ) : null}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                onClick={closeModal}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={adjustMutation.isPending}
                className="rounded-md bg-teal-700 px-3 py-2 text-sm text-white disabled:opacity-50"
              >
                {adjustMutation.isPending ? 'Aplicando…' : 'Confirmar ajuste'}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
    </section>
  );
}
