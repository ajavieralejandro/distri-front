import { accountHandlers } from './accounts.handlers';
import { authHandlers } from './auth.handlers';
import { customerHandlers } from './customers.handlers';
import { dashboardHandlers } from './dashboard.handlers';
import { inventoryHandlers } from './inventory.handlers';
import { orderHandlers } from './orders.handlers';
import { paymentHandlers } from './payments.handlers';
import { productHandlers } from './products.handlers';

export const handlers = [
  ...authHandlers,
  ...customerHandlers,
  ...productHandlers,
  ...orderHandlers,
  ...inventoryHandlers,
  ...accountHandlers,
  ...paymentHandlers,
  ...dashboardHandlers,
];
