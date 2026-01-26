
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import PasswordReset from "./components/auth/PasswordReset";
import VerifyEmail from "./components/auth/VerifyEmail";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Pricing from "./pages/Pricing";
import Dashboard from "./pages/Dashboard";
import BusinessEntities from "./pages/BusinessEntities";
import AuditDefense from "./pages/AuditDefense";
import CryptoTaxes from "./pages/CryptoTaxes";
import Receipts from "./pages/Receipts";
import Subscriptions from "./pages/Subscriptions";
import EFile from "./pages/EFile";
import Features from "./pages/Features";
import BlogList from "./pages/BlogList";
import BlogPost from "./pages/BlogPost";
import Backups from "./pages/Backups";
import HealthCheck from "./pages/HealthCheck";

import Navigation from "./components/Navigation";




const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="light">
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Navigation />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/reset-password" element={<PasswordReset />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/entities" element={<ProtectedRoute><BusinessEntities /></ProtectedRoute>} />
              <Route path="/audit-defense" element={<ProtectedRoute><AuditDefense /></ProtectedRoute>} />
              <Route path="/crypto" element={<ProtectedRoute><CryptoTaxes /></ProtectedRoute>} />
              <Route path="/receipts" element={<ProtectedRoute><Receipts /></ProtectedRoute>} />
              <Route path="/subscriptions" element={<ProtectedRoute><Subscriptions /></ProtectedRoute>} />
              <Route path="/efile" element={<ProtectedRoute><EFile /></ProtectedRoute>} />
              <Route path="/features" element={<Features />} />
              <Route path="/blog" element={<BlogList />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/backups" element={<ProtectedRoute><Backups /></ProtectedRoute>} />
              <Route path="/health" element={<ProtectedRoute><HealthCheck /></ProtectedRoute>} />





              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
