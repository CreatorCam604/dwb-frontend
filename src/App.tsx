import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import { RequireAuth } from "./auth/RequireAuth";
import AppLayout from "./layout/AppLayout";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import InvoiceDetail from "./pages/InvoiceDetail";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC */}
        <Route path="/login" element={<Login />} />

        {/* PROTECTED */}
        <Route
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        >
          {/* redirect / → /dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/invoices/:invoiceId" element={<InvoiceDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
