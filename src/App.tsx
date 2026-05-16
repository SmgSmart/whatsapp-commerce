import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import { Store } from './pages/Store';
import { StoreDirectory } from './pages/StoreDirectory';
import { AdminLayout } from './components/admin/AdminLayout';
import { Dashboard } from './pages/admin/Dashboard';
import { CategoryManager } from './pages/admin/CategoryManager';
import { ProductManager } from './pages/admin/ProductManager';
import { BusinessSettings } from './pages/admin/BusinessSettings';
import { AccountView } from './components/auth/AccountView';
import { Onboarding } from './pages/admin/Onboarding';
import { Login } from './pages/admin/Login';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Public Store Routes */}
            <Route path="/" element={<StoreDirectory />} />
            <Route path="/store/:slug" element={<Store />} />

            {/* Admin Auth */}
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin/signup" element={<Login />} />

            {/* Protected Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<ProductManager />} />
              <Route path="categories" element={<CategoryManager />} />
              <Route path="settings" element={<BusinessSettings />} />
              <Route path="account" element={<AccountView />} />
              <Route path="onboarding" element={<Onboarding />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
