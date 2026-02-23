import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

// Layouts
import DashboardLayout from '@/layouts/DashboardLayout';
import AuthLayout from '@/layouts/AuthLayout';
import PublicLayout from '@/layouts/PublicLayout';

// Pages
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword';
import VerifyEmail from '@/pages/auth/VerifyEmail';
import VerifyEmailCallback from '@/pages/auth/VerifyEmailCallback';
import Setup from '@/pages/auth/Setup';
import Dashboard from '@/pages/dashboard/Dashboard';
import SingleValidation from '@/pages/dashboard/SingleValidation';
import BulkValidation from '@/pages/dashboard/BulkValidation';
import ValidationHistory from '@/pages/dashboard/ValidationHistory';
import ApiKeys from '@/pages/dashboard/ApiKeys';
import Billing from '@/pages/dashboard/Billing';
import Settings from '@/pages/dashboard/Settings';
import Landing from '@/pages/landing/Landing';
import Pricing from '@/pages/landing/Pricing';
import Documentation from '@/pages/landing/Documentation';
import About from '@/pages/landing/About';
import Contact from '@/pages/landing/Contact';
import Blog from '@/pages/landing/Blog';
import Privacy from '@/pages/landing/Privacy';
import Terms from '@/pages/landing/Terms';
import Gdpr from '@/pages/landing/Gdpr';

// Protected Route
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminRoute from '@/components/AdminRoute';
import AdminLayout from '@/layouts/AdminLayout';
import AdminOverview from '@/pages/admin/AdminOverview';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminJobs from '@/pages/admin/AdminJobs';
import AdminTransactions from '@/pages/admin/AdminTransactions';
import AdminConfig from '@/pages/admin/AdminConfig';
import AdminApiKeys from '@/pages/admin/AdminApiKeys';
import AdminActivity from '@/pages/admin/AdminActivity';
import AdminUserProfile from '@/pages/admin/AdminUserProfile';
import AdminSettings from '@/pages/admin/AdminSettings';
import AdminBlog from '@/pages/admin/AdminBlog';
import AdminInbox from '@/pages/admin/AdminInbox';
import AdminValidationServers from '@/pages/admin/AdminValidationServers';
import AdminPricing from '@/pages/admin/AdminPricing';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="spamguard-theme">
        <Router>
          <AuthProvider>
            <Routes>
              {/* Public Routes */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Landing />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/docs" element={<Documentation />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/gdpr" element={<Gdpr />} />
              </Route>

              {/* Setup Route (standalone layout) */}
              <Route path="/setup" element={<Setup />} />

              {/* Email Verification Routes (standalone layout) */}
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/verify-email/:token" element={<VerifyEmailCallback />} />

              {/* Auth Routes */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
              </Route>

              {/* Protected Dashboard Routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/validate/single" element={<SingleValidation />} />
                  <Route path="/validate/bulk" element={<BulkValidation />} />
                  <Route path="/history" element={<ValidationHistory />} />
                  <Route path="/api-keys" element={<ApiKeys />} />
                  <Route path="/billing" element={<Billing />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>
              </Route>

              {/* Admin Routes */}
              <Route element={<AdminRoute />}>
                <Route element={<AdminLayout />}>
                  <Route path="/admin" element={<AdminOverview />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/admin/jobs" element={<AdminJobs />} />
                  <Route path="/admin/transactions" element={<AdminTransactions />} />
                  <Route path="/admin/api-keys" element={<AdminApiKeys />} />
                  <Route path="/admin/activity" element={<AdminActivity />} />
                  <Route path="/admin/users/:id" element={<AdminUserProfile />} />
                  <Route path="/admin/settings" element={<AdminSettings />} />
                  <Route path="/admin/blog" element={<AdminBlog />} />
                  <Route path="/admin/inbox" element={<AdminInbox />} />
                  <Route path="/admin/config" element={<AdminConfig />} />
                  <Route path="/admin/servers" element={<AdminValidationServers />} />
                  <Route path="/admin/pricing" element={<AdminPricing />} />
                </Route>
              </Route>

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthProvider>
          <Toaster position="top-right" richColors />
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
