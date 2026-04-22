import React, { lazy, Suspense, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider, useDispatch } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store/store';
import { clearAllAuthAndPurge } from './utils/authLogout';
import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import { CrossAppLogoutHandler } from "./components/CrossAppLogoutHandler";
import { PostAuthSsoRedirect } from "./components/PostAuthSsoRedirect";

const Index = lazy(() => import('./pages/Index'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const NotFound = lazy(() => import('./pages/NotFound'));
const PublicSubmissionPage = lazy(() => import('./pages/PublicSubmissionPage'));
const IncomeExpenseTracker = lazy(() => import('./pages/IncomeExpenseTracker'));
const TaxEngagementLetter = lazy(() => import('./pages/TaxEngagementLetter'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const CreateAdmin = lazy(() => import('./pages/CreateAdmin'));
const ManageAdmins = lazy(() => import('./pages/ManageAdmins'));
const ClientProfileCreator = lazy(() => import('./pages/ClientProfileCreator'));
const ClientProfilePublicPage = lazy(() => import('./pages/ClientProfilePublicPage'));
const SSOHandlerPage = lazy(() => import('./pages/SSOHandlerPage'));

const RouterFallback = () => (
  <div className="flex min-h-[50vh] w-full items-center justify-center bg-background">
    <div
      className="h-9 w-9 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-primary"
      aria-label="Loading page"
    />
  </div>
);

const queryClient = new QueryClient();

// Component to handle global auth events (e.g. 401 / token expired from API)
const AuthHandler = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const handleLogout = () => {
      clearAllAuthAndPurge(dispatch, persistor);
    };

    window.addEventListener('auth:logout', handleLogout);

    return () => {
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, [dispatch]);

  return null;
};

const App = () => (
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthHandler />
          <Toaster />
          <Sonner />
          <BrowserRouter basename={import.meta.env.VITE_BASENAME || "/"}>
            <CrossAppLogoutHandler />
            <PostAuthSsoRedirect />
            <Suspense fallback={<RouterFallback />}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/onboard" element={<ClientProfileCreator />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                {/* SSO handler — redirect app2 users back with tokens */}
                <Route path="/sso" element={<SSOHandlerPage />} />

                {/* Admin Routes */}
                <Route path="/atg-admin/login" element={<AdminLogin />} />
                <Route path="/atg-admin" element={
                  <ProtectedAdminRoute>
                    <AdminDashboard />
                  </ProtectedAdminRoute>
                } />
                <Route path="/atg-admin/create-admin" element={
                  <ProtectedAdminRoute>
                    <CreateAdmin />
                  </ProtectedAdminRoute>
                } />
                <Route path="/atg-admin/manage-admins" element={
                  <ProtectedAdminRoute>
                    <ManageAdmins />
                  </ProtectedAdminRoute>
                } />

                {/* User Routes */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                } />
                <Route path="/income-expense-tracker" element={
                  <ProtectedRoute>
                    <IncomeExpenseTracker />
                  </ProtectedRoute>
                } />
                <Route path="/tax-engagement-letter" element={
                  <ProtectedRoute>
                    <TaxEngagementLetter />
                  </ProtectedRoute>
                } />
                {/* <Route path="/estate-planning" element={
                  <ProtectedRoute>
                    <EstatePlanningPage />
                  </ProtectedRoute>
                } /> */}
                {/* Public profile by UUID — no auth required */}
                <Route path="/profile/:identifier" element={<ClientProfilePublicPage />} />
                {/* Public submission by ID (no auth). Same detail view as admin/user. */}
                <Route path="/submission/:id" element={<PublicSubmissionPage />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </PersistGate>
  </Provider>
);

export default App;
