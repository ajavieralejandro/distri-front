/**
 * Provisional domain types for the interactive demo (v2).
 * PROVISIONAL — pending validation against Distrisoft API.
 *
 * Authorization in the UI is demonstrative only.
 * Definitive authorization will be enforced by Distrisoft API.
 */

export type DemoRole =
  | 'DISTRIBUTOR_ADMIN'
  | 'SALES'
  | 'WAREHOUSE_PICKER'
  | 'CASHIER'
  | 'DRIVER'
  | 'COMMERCE_OWNER'
  | 'COMMERCE_BUYER'
  | 'COMMERCE_CASHIER';

export const DEMO_ROLES: DemoRole[] = [
  'DISTRIBUTOR_ADMIN',
  'SALES',
  'WAREHOUSE_PICKER',
  'CASHIER',
  'DRIVER',
  'COMMERCE_OWNER',
  'COMMERCE_BUYER',
  'COMMERCE_CASHIER',
];

export type DemoSession = {
  userId: string;
  role: DemoRole;
  displayName: string;
  email: string;
  distributorId?: string;
  commerceId?: string;
  branchId?: string;
  warehouseId?: string;
  assignedRouteId?: string;
};

export type Permission =
  | 'analytics:view_global'
  | 'analytics:view_own'
  | 'customers:read'
  | 'customers:manage'
  | 'products:read'
  | 'products:manage'
  | 'orders:create'
  | 'orders:read_all'
  | 'orders:read_own'
  | 'orders:confirm'
  | 'orders:prepare'
  | 'orders:dispatch'
  | 'orders:deliver'
  | 'orders:cancel'
  | 'inventory:read'
  | 'inventory:adjust'
  | 'accounts:read_all'
  | 'accounts:read_own'
  | 'payments:read_all'
  | 'payments:read_own'
  | 'payments:record'
  | 'billing:read_all'
  | 'billing:read_own'
  | 'billing:issue_demo'
  | 'receipts:issue_demo'
  | 'users:manage_demo'
  | 'audit:read';

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

export type CommerceBranch = {
  id: string;
  commerceId: string;
  name: string;
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
  userId?: string;
};

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY_FOR_DISPATCH'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'DELIVERY_FAILED';

export type PickItemStatus =
  'PENDING' | 'PICKED' | 'MISSING' | 'SUBSTITUTED_DEMO';

export type OrderItem = {
  productId: string;
  sku: string;
  name: string;
  unitPrice: string;
  quantity: number;
  lineTotal: string;
  preparedQuantity: number;
  pickStatus: PickItemStatus;
  missingQuantity: number;
  substituteProductId?: string;
  itemNote?: string;
};

export type OrderStatusEvent = {
  id: string;
  orderId: string;
  fromStatus?: OrderStatus;
  toStatus: OrderStatus;
  userId: string;
  userDisplayName: string;
  createdAt: string;
  note?: string;
};

export type OrderPriority = 'NORMAL' | 'HIGH';

export type Order = {
  id: string;
  number: string;
  commerceId: string;
  branchId?: string;
  warehouseId: string;
  routeId?: string;
  status: OrderStatus;
  priority: OrderPriority;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  subtotal: string;
  total: string;
  notes?: string;
  history: OrderStatusEvent[];
  deliveryAddress: string;
  deliveryContactName: string;
  deliveryContactPhone: string;
  deliveryWindow?: string;
  stopSequence?: number;
  deliveryResult?: DeliveryResult;
  deliveryObservation?: string;
  receivedByName?: string;
};

export type DeliveryResult =
  | 'DELIVERED_OK'
  | 'CUSTOMER_ABSENT'
  | 'WRONG_ADDRESS'
  | 'REJECTED'
  | 'PARTIAL_DEMO';

export type DemoVehicle = {
  id: string;
  label: string;
  plate: string;
};

export type DeliveryRoute = {
  id: string;
  name: string;
  driverUserId: string;
  vehicleId: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';
  startedAt?: string;
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

export type PaymentMethod = 'CASH' | 'TRANSFER' | 'CARD' | 'MERCADO_PAGO_DEMO';

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
  clientOperationId?: string;
  recordedByUserId?: string;
};

export type DemoInvoiceStatus = 'DRAFT' | 'ISSUED_DEMO' | 'CANCELLED_DEMO';

export type DemoInvoiceItem = {
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  unitPrice: string;
  lineTotal: string;
};

export type DemoInvoice = {
  id: string;
  number: string;
  commerceId: string;
  orderId: string;
  issuedAt?: string;
  dueAt?: string;
  status: DemoInvoiceStatus;
  subtotal: string;
  tax: string;
  total: string;
  items: DemoInvoiceItem[];
  disclaimer: string;
};

export type DemoReceiptAllocation = {
  invoiceId?: string;
  description: string;
  amount: string;
};

export type DemoReceipt = {
  id: string;
  number: string;
  commerceId: string;
  paymentId: string;
  issuedAt: string;
  amount: string;
  paymentMethod: PaymentMethod;
  allocations: DemoReceiptAllocation[];
  disclaimer: string;
};

export type DemoAuditEvent = {
  id: string;
  userId: string;
  userDisplayName: string;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  summary: string;
};

export type DemoUser = {
  id: string;
  email: string;
  password: string;
  displayName: string;
  role: DemoRole;
  distributorId?: string;
  commerceId?: string;
  branchId?: string;
  warehouseId?: string;
  assignedRouteId?: string;
};

export type DemoFeatureFlags = {
  analytics: boolean;
  billing: boolean;
  cashier: boolean;
  warehouseOperations: boolean;
  deliveryOperations: boolean;
};

export type DemoDatabase = {
  version: 2;
  distributorId: string;
  categories: Category[];
  products: Product[];
  commerces: Commerce[];
  branches: CommerceBranch[];
  warehouses: Warehouse[];
  inventory: InventoryItem[];
  inventoryMovements: InventoryMovement[];
  orders: Order[];
  accountMovements: AccountMovement[];
  payments: Payment[];
  invoices: DemoInvoice[];
  receipts: DemoReceipt[];
  vehicles: DemoVehicle[];
  routes: DeliveryRoute[];
  auditEvents: DemoAuditEvent[];
  users: DemoUser[];
  orderSequence: number;
  invoiceSequence: number;
  receiptSequence: number;
  featureFlags: DemoFeatureFlags;
};

export const DEMO_INVOICE_DISCLAIMER =
  'DOCUMENTO DEMOSTRATIVO — SIN VALIDEZ FISCAL — NO AUTORIZADO POR ARCA';

export const DEMO_RECEIPT_DISCLAIMER =
  'RECIBO DEMOSTRATIVO — SIN VALIDEZ FISCAL';
