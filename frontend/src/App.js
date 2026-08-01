import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import PageLoader from './components/ui/PageLoader';
import './styles/global.css';

// ── Lazy loaded pages ────────────────────────────────────────
const Home          = lazy(() => import('./pages/Home'));
const Browse        = lazy(() => import('./pages/Browse'));
const CookProfile   = lazy(() => import('./pages/CookProfile'));
const Cart          = lazy(() => import('./pages/Cart'));
const Checkout      = lazy(() => import('./pages/Checkout'));
const OrderTracking = lazy(() => import('./pages/OrderTracking'));
const Login         = lazy(() => import('./pages/auth/Login'));
const Register      = lazy(() => import('./pages/auth/Register'));
const FoodieDashboard = lazy(() => import('./pages/foodie/FoodieDashboard'));
const OrderHistory  = lazy(() => import('./pages/foodie/OrderHistory'));
const Profile       = lazy(() => import('./pages/foodie/Profile'));
const CookDashboard = lazy(() => import('./pages/cook/CookDashboard'));
const MenuManager   = lazy(() => import('./pages/cook/MenuManager'));
const OrderQueue    = lazy(() => import('./pages/cook/OrderQueue'));
const Earnings      = lazy(() => import('./pages/cook/Earnings'));
const NotFound      = lazy(() => import('./pages/NotFound'));

// ── Route guards ─────────────────────────────────────────────
function PrivateRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (user) return <Navigate to={user.role === 'COOK' ? '/cook/dashboard' : '/browse'} replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Navbar />
          <Suspense fallback={<PageLoader />}>
            <Routes>

              {/* ── Public ──────────────────────────────── */}
              <Route path="/"         element={<Home />} />
              <Route path="/browse"   element={<Browse />} />
              <Route path="/cook/:id" element={<CookProfile />} />

              {/* ── Auth ────────────────────────────────── */}
              <Route path="/login"    element={<GuestRoute><Login /></GuestRoute>} />
              <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

              {/* ── Foodie (authenticated) ───────────────── */}
              <Route path="/cart"     element={<PrivateRoute role="FOODIE"><Cart /></PrivateRoute>} />
              <Route path="/checkout" element={<PrivateRoute role="FOODIE"><Checkout /></PrivateRoute>} />
              <Route path="/order/:id" element={<PrivateRoute><OrderTracking /></PrivateRoute>} />
              <Route path="/dashboard" element={<PrivateRoute role="FOODIE"><FoodieDashboard /></PrivateRoute>} />
              <Route path="/orders"    element={<PrivateRoute role="FOODIE"><OrderHistory /></PrivateRoute>} />
              <Route path="/profile"   element={<PrivateRoute><Profile /></PrivateRoute>} />

              {/* ── Cook (authenticated) ─────────────────── */}
              <Route path="/cook/dashboard" element={<PrivateRoute role="COOK"><CookDashboard /></PrivateRoute>} />
              <Route path="/cook/menu"      element={<PrivateRoute role="COOK"><MenuManager /></PrivateRoute>} />
              <Route path="/cook/orders"    element={<PrivateRoute role="COOK"><OrderQueue /></PrivateRoute>} />
              <Route path="/cook/earnings"  element={<PrivateRoute role="COOK"><Earnings /></PrivateRoute>} />

              {/* ── 404 ─────────────────────────────────── */}
              <Route path="*" element={<NotFound />} />

            </Routes>
          </Suspense>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
