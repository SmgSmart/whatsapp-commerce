import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import { StoreProvider } from './contexts/StoreContext';
import { Store } from './pages/Store';
import { StoreDirectory } from './pages/StoreDirectory';
import { AdminLayout } from './components/admin/AdminLayout';
import { Dashboard } from './pages/admin/Dashboard';
import { CategoryManager } from './pages/admin/CategoryManager';
import { ProductManager } from './pages/admin/ProductManager';
import { BusinessSettings } from './pages/admin/BusinessSettings';
import { Billing } from './pages/admin/Billing';
import { AccountView } from '@neondatabase/auth-ui';
import '@neondatabase/auth-ui/css'; // Correct path to the official styles!
import { Onboarding } from './pages/admin/Onboarding';
import { Login } from './pages/admin/Login';
import { AuthCallback } from './pages/AuthCallback';
import { AuthSuccess } from './pages/AuthSuccess';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <StoreProvider>
          <CartProvider>
            <Routes>
              {/* Public Store Routes */}
              <Route path="/" element={<StoreDirectory />} />
              <Route path="/store/:slug" element={<Store />} />

              {/* OAuth Callback Handlers */}
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/auth/success" element={<AuthSuccess />} />

              {/* Admin Auth */}
              <Route path="/admin/login" element={<Login />} />
              <Route path="/admin/signup" element={<Login />} />

              {/* Protected Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="products" element={<ProductManager />} />
                <Route path="categories" element={<CategoryManager />} />
                <Route path="settings" element={<BusinessSettings />} />
                <Route path="billing" element={<Billing />} />
                <Route path="account" element={<AccountView />} />
                <Route path="onboarding" element={<Onboarding />} />
              </Route>

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </CartProvider>
        </StoreProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

