import { accountHandlers } from './accounts.handlers';
import { analyticsHandlers } from './analytics.handlers';
import { auditHandlers } from './audit.handlers';
import { authHandlers } from './auth.handlers';
import { billingHandlers } from './billing.handlers';
import { customerHandlers } from './customers.handlers';
import { dashboardHandlers } from './dashboard.handlers';
import { deliveryHandlers } from './delivery.handlers';
import { inventoryHandlers } from './inventory.handlers';
import { orderHandlers } from './orders.handlers';
import { paymentHandlers } from './payments.handlers';
import { productHandlers } from './products.handlers';
import { userHandlers } from './users.handlers';

export const handlers = [
  ...authHandlers,
  ...customerHandlers,
  ...productHandlers,
  ...orderHandlers,
  ...inventoryHandlers,
  ...accountHandlers,
  ...paymentHandlers,
  ...dashboardHandlers,
  ...analyticsHandlers,
  ...auditHandlers,
  ...billingHandlers,
  ...deliveryHandlers,
  ...userHandlers,
];
