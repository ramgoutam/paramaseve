import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DonationForm from "./pages/DonationForm";
import Dashboard from "./pages/Dashboard";
import UserManagement from "./pages/UserManagement";
import AddExpense from "./pages/AddExpense";
import Login from "./pages/Login";
import PublicDashboard from "./pages/PublicDashboard";
import PublicData from "./pages/PublicData";
import SupportUs from "./pages/SupportUs";
import ContactUs from "./pages/ContactUs";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedLayout } from "@/components/ProtectedLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<PublicDashboard />} />
            <Route path="/public-data" element={<PublicData />} />
            <Route path="/support-us" element={<SupportUs />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/add-donation" element={<DonationForm />} />
              <Route path="/add-expense" element={<AddExpense />} />
              <Route path="/users" element={<UserManagement />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
