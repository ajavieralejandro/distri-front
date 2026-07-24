/**
 * Provisional domain types for the interactive demo.
 * PROVISIONAL — pending validation against Distrisoft API.
 */

export type DemoRole = 'ADMIN' | 'COMMERCE';

export type DemoSession = {
  userId: string;
  role: DemoRole;
  displayName: string;
  email: string;
  commerceId?: string;
};

export type ProductUnit = 'UNIT' | 'PACK' | 'BOX';

export type Category = {
  id: string;
  name: string;
};

export type Product = {
  id: string;
  sku: string;
  name: string;
  description: string;
  categoryId: string;
  unit: ProductUnit;
  presentation: string;
  price: string;
  availableStock: number;
  imageUrl?: string;
  active: boolean;
};

export type CommerceStatus = 'ACTIVE' | 'INACTIVE';

export type Commerce = {
  id: string;
  businessName: string;
  tradeName: string;
  taxId: string;
  status: CommerceStatus;
  paymentTerms: string;
  creditLimit: string;
  balance: string;
  email: string;
  phone: string;
  address: string;
};

export type Warehouse = {
  id: string;
  name: string;
  code: string;
};

export type InventoryItem = {
  id: string;
  productId: string;
  warehouseId: string;
  physicalStock: number;
  reservedStock: number;
  availableStock: number;
  lowStockThreshold: number;
};

export type InventoryMovement = {
  id: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  reason: string;
  createdAt: string;
  simulated: true;
};

export type OrderStatus =
  'PENDING' | 'CONFIRMED' | 'PREPARING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export type OrderItem = {
  productId: string;
  sku: string;
  name: string;
  unitPrice: string;
  quantity: number;
  lineTotal: string;
};

export type OrderStatusEvent = {
  status: OrderStatus;
  at: string;
  note: string;
};

export type Order = {
  id: string;
  number: string;
  commerceId: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  subtotal: string;
  total: string;
  notes?: string;
  history: OrderStatusEvent[];
};

export type AccountMovementType =
  'INVOICE' | 'PAYMENT' | 'CREDIT_NOTE' | 'ADJUSTMENT';

export type AccountMovement = {
  id: string;
  commerceId: string;
  type: AccountMovementType;
  description: string;
  amount: string;
  balanceAfter: string;
  dueDate?: string;
  createdAt: string;
  reference: string;
  status: 'OPEN' | 'PAID' | 'OVERDUE' | 'CANCELLED';
};

export type PaymentMethod = 'TRANSFER' | 'CARD' | 'MERCADO_PAGO_DEMO';

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export type Payment = {
  id: string;
  commerceId: string;
  amount: string;
  method: PaymentMethod;
  status: PaymentStatus;
  createdAt: string;
  reference: string;
  simulated: true;
};

export type DemoUser = {
  id: string;
  email: string;
  password: string;
  displayName: string;
  role: DemoRole;
  commerceId?: string;
};

export type DemoDatabase = {
  version: 1;
  categories: Category[];
  products: Product[];
  commerces: Commerce[];
  warehouses: Warehouse[];
  inventory: InventoryItem[];
  inventoryMovements: InventoryMovement[];
  orders: Order[];
  accountMovements: AccountMovement[];
  payments: Payment[];
  users: DemoUser[];
  orderSequence: number;
};
