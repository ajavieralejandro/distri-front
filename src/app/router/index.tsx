import { Navigate, Route, Routes } from 'react-router-dom';

import { AdminLayout } from '@/app/layouts/AdminLayout';
import { CommerceLayout } from '@/app/layouts/CommerceLayout';
import { WarehouseLayout } from '@/app/layouts/WarehouseLayout';
import { CashierLayout } from '@/app/layouts/CashierLayout';
import { DeliveryLayout } from '@/app/layouts/DeliveryLayout';
import { AccountPage } from '@/pages/commerce/AccountPage';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { CartPage } from '@/pages/commerce/CartPage';
import { CatalogPage } from '@/pages/commerce/CatalogPage';
import { CommerceOrdersPage } from '@/pages/commerce/OrdersPage';
import { CustomersPage } from '@/pages/admin/CustomersPage';
import { InventoryPage } from '@/pages/admin/InventoryPage';
import { LoginPage } from '@/pages/LoginPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { OrdersPage } from '@/pages/admin/OrdersPage';
import { PaymentsPage } from '@/pages/admin/PaymentsPage';
import { ProductsPage } from '@/pages/admin/ProductsPage';
import { RequireDemoAuth } from '@/app/router/RequireDemoAuth';
import { CustomerDetailPage } from '@/pages/admin/CustomerDetailPage';
import { OrderDetailPage } from '@/pages/admin/OrderDetailPage';
import { ForbiddenPage } from '@/pages/ForbiddenPage';
import { AdminAnalyticsPage } from '@/pages/admin/AdminAnalyticsPage';
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage';
import { AdminAuditPage } from '@/pages/admin/AdminAuditPage';
import { AdminBillingPage } from '@/pages/admin/AdminBillingPage';
import { WarehouseHomePage } from '@/pages/operations/WarehouseHomePage';
import { WarehouseOrdersPage } from '@/pages/operations/WarehouseOrdersPage';
import { WarehouseOrderDetailPage } from '@/pages/operations/WarehouseOrderDetailPage';
import { CashierHomePage } from '@/pages/operations/CashierHomePage';
import { CashierCustomerPage } from '@/pages/operations/CashierCustomerPage';
import { CashierPaymentsPage } from '@/pages/operations/CashierPaymentsPage';
import { CashierReceiptPage } from '@/pages/operations/CashierReceiptPage';
import { DeliveryHomePage } from '@/pages/operations/DeliveryHomePage';
import { DeliveryRoutePage } from '@/pages/operations/DeliveryRoutePage';
import { DeliveryOrderPage } from '@/pages/operations/DeliveryOrderPage';
import { CommerceDashboardPage } from '@/pages/commerce/CommerceDashboardPage';
import { CommerceBillingPage } from '@/pages/commerce/CommerceBillingPage';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />

      <Route path="/forbidden" element={<ForbiddenPage />} />
      <Route
        element={<RequireDemoAuth roles={['DISTRIBUTOR_ADMIN', 'SALES']} />}
      >
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route
            element={<RequireDemoAuth permission="analytics:view_global" />}
          >
            <Route path="analytics" element={<AdminAnalyticsPage />} />
          </Route>
          <Route path="customers" element={<CustomersPage />} />
          <Route
            path="customers/:customerId"
            element={<CustomerDetailPage />}
          />
          <Route path="products" element={<ProductsPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:orderId" element={<OrderDetailPage />} />
          <Route element={<RequireDemoAuth permission="inventory:read" />}>
            <Route path="inventory" element={<InventoryPage />} />
          </Route>
          <Route element={<RequireDemoAuth permission="payments:read_all" />}>
            <Route path="payments" element={<PaymentsPage />} />
          </Route>
          <Route element={<RequireDemoAuth permission="billing:read_all" />}>
            <Route path="billing" element={<AdminBillingPage />} />
          </Route>
          <Route element={<RequireDemoAuth permission="users:manage_demo" />}>
            <Route path="users" element={<AdminUsersPage />} />
          </Route>
          <Route element={<RequireDemoAuth permission="audit:read" />}>
            <Route path="audit" element={<AdminAuditPage />} />
          </Route>
        </Route>
      </Route>

      <Route
        element={
          <RequireDemoAuth
            roles={['WAREHOUSE_PICKER', 'DISTRIBUTOR_ADMIN']}
            permission="orders:prepare"
          />
        }
      >
        <Route path="/operations/warehouse" element={<WarehouseLayout />}>
          <Route index element={<WarehouseHomePage />} />
          <Route path="orders" element={<WarehouseOrdersPage />} />
          <Route
            path="orders/:orderId"
            element={<WarehouseOrderDetailPage />}
          />
        </Route>
      </Route>
      <Route element={<RequireDemoAuth roles={['CASHIER']} />}>
        <Route path="/operations/cashier" element={<CashierLayout />}>
          <Route index element={<CashierHomePage />} />
          <Route
            path="customers/:customerId"
            element={<CashierCustomerPage />}
          />
          <Route path="payments" element={<CashierPaymentsPage />} />
          <Route path="receipts/:receiptId" element={<CashierReceiptPage />} />
        </Route>
      </Route>
      <Route element={<RequireDemoAuth roles={['DRIVER']} />}>
        <Route path="/operations/delivery" element={<DeliveryLayout />}>
          <Route index element={<DeliveryHomePage />} />
          <Route path="route" element={<DeliveryRoutePage />} />
          <Route path="orders/:orderId" element={<DeliveryOrderPage />} />
        </Route>
      </Route>
      <Route
        element={
          <RequireDemoAuth
            roles={['COMMERCE_OWNER', 'COMMERCE_BUYER', 'COMMERCE_CASHIER']}
          />
        }
      >
        <Route path="/commerce" element={<CommerceLayout />}>
          <Route index element={<Navigate to="catalog" replace />} />
          <Route element={<RequireDemoAuth roles={['COMMERCE_OWNER']} />}>
            <Route path="dashboard" element={<CommerceDashboardPage />} />
          </Route>
          <Route path="catalog" element={<CatalogPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="orders" element={<CommerceOrdersPage />} />
          <Route element={<RequireDemoAuth roles={['COMMERCE_OWNER']} />}>
            <Route path="account" element={<AccountPage />} />
            <Route path="payments" element={<AccountPage />} />
            <Route path="billing" element={<CommerceBillingPage />} />
            <Route path="users" element={<AdminUsersPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
