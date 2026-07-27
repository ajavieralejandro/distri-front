import {
  orderStatusLabel,
  orderStatusTone,
} from '@/features/orders/lib/order-status';
import { StatusBadge } from '@/shared/components/StatusBadge';
import type { OrderStatus } from '@/shared/types/demo';

type OrderStatusBadgeProps = {
  status: OrderStatus;
};

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return (
    <StatusBadge
      label={orderStatusLabel(status)}
      tone={orderStatusTone(status)}
    />
  );
}
