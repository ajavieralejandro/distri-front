import { Navigate, Route, Routes } from 'react-router-dom';

import { AdminLayout } from '@/app/layouts/AdminLayout';
import { CommerceLayout } from '@/app/layouts/CommerceLayout';
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

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />

      <Route element={<RequireDemoAuth roles={['ADMIN']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route
            path="customers/:customerId"
            element={<CustomerDetailPage />}
          />
          <Route path="products" element={<ProductsPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:orderId" element={<OrderDetailPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="payments" element={<PaymentsPage />} />
        </Route>
      </Route>

      <Route element={<RequireDemoAuth roles={['COMMERCE']} />}>
        <Route path="/commerce" element={<CommerceLayout />}>
          <Route index element={<Navigate to="catalog" replace />} />
          <Route path="catalog" element={<CatalogPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="orders" element={<CommerceOrdersPage />} />
          <Route path="account" element={<AccountPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
