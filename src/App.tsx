import React, { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider, useDispatch } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store/store';
import { clearAllAuthAndPurge } from './utils/authLogout';
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import NotFound from "./pages/NotFound";
import PublicSubmissionPage from "./pages/PublicSubmissionPage";
import IncomeExpenseTracker from "./pages/IncomeExpenseTracker";
import TaxEngagementLetter from "./pages/TaxEngagementLetter";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import CreateAdmin from "./pages/CreateAdmin";
import ManageAdmins from "./pages/ManageAdmins";
import ClientProfileCreator from "./pages/ClientProfileCreator";
import ClientProfilePublicPage from "./pages/ClientProfilePublicPage";
import EstatePlanningPage from "./pages/EstatePlanningPage";
import SSOHandlerPage from "./pages/SSOHandlerPage";
import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import { CrossAppLogoutHandler } from "./components/CrossAppLogoutHandler";

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
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </PersistGate>
  </Provider>
);

export default App;
