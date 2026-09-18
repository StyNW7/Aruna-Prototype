import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import RootLayout from "@/layouts/root-layout";
import DashboardLayout from "@/components/layout/DashboardLayout";

import ScrollToTop from "./utility/ScrollToTop";
import ScrollToTopFunction from "./utility/ScrollToTopFunction";
import NotFoundPage from "./pages/Utility/NotFound404";

// Public pages
import Home from "@/pages/public/Home";
import About from "@/pages/public/About";
import FishFramework from "@/pages/public/FishFramework";
import HowItWorks from "@/pages/public/HowItWorks";
import Insight from "@/pages/public/Insight";
import Contact from "@/pages/public/Contact";
import Login from "@/pages/public/Login";
import Onboarding from "@/pages/public/Onboarding";

// Dashboard pages
import Overview from "@/pages/dashboard/Overview";
import Supply from "@/pages/dashboard/Supply";
import Inventory from "@/pages/dashboard/Inventory";
import Traceability from "@/pages/dashboard/Traceability";
import Energy from "@/pages/dashboard/Energy";
import Value from "@/pages/dashboard/Value";
import Pricing from "@/pages/dashboard/Pricing";
import Optimizer from "@/pages/dashboard/Optimizer";
import Scenario from "@/pages/dashboard/Scenario";
import Production from "@/pages/dashboard/Production";
import Shipment from "@/pages/dashboard/Shipment";
import Excess from "@/pages/dashboard/Excess";
import Quality from "@/pages/dashboard/Quality";
import Performance from "@/pages/dashboard/Performance";
import Reports from "@/pages/dashboard/Reports";
import Sop from "@/pages/dashboard/Sop";
import Approvals from "@/pages/dashboard/Approvals";
import Settings from "@/pages/dashboard/Settings";
import Help from "@/pages/dashboard/Help";

// Aruna ERP (Extended Dashboard)
import ErpLayout from "@/erp/components/ErpLayout";
import ErpHome from "@/erp/pages/ErpHome";
import ErpFinance from "@/erp/pages/Finance";
import ErpProcurement from "@/erp/pages/Procurement";
import ErpInventory from "@/erp/pages/Inventory";
import ErpOperations from "@/erp/pages/Operations";
import ErpSales from "@/erp/pages/Sales";
import ErpHR from "@/erp/pages/HR";
import ErpApprovals from "@/erp/pages/Approvals";
import ErpIntegrations from "@/erp/pages/Integrations";
import ErpReports from "@/erp/pages/Reports";
import ErpActivity from "@/erp/pages/ActivityLog";
import ErpSettings from "@/erp/pages/Settings";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTopFunction />
      <ScrollToTop />

      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path="tentang-aruna" element={<About />} />
          <Route path="fish-framework" element={<FishFramework />} />
          <Route path="cara-kerja" element={<HowItWorks />} />
          <Route path="insight" element={<Insight />} />
          <Route path="kontak" element={<Contact />} />
          <Route path="masuk" element={<Login />} />
          <Route path="onboarding" element={<Onboarding />} />
        </Route>

        <Route path="/app" element={<DashboardLayout />}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<Overview />} />
          <Route path="supply" element={<Supply />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="traceability" element={<Traceability />} />
          <Route path="optimizer" element={<Optimizer />} />
          <Route path="energy" element={<Energy />} />
          <Route path="value" element={<Value />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="scenario" element={<Scenario />} />
          <Route path="production" element={<Production />} />
          <Route path="shipment" element={<Shipment />} />
          <Route path="excess" element={<Excess />} />
          <Route path="quality" element={<Quality />} />
          <Route path="performance" element={<Performance />} />
          <Route path="reports" element={<Reports />} />
          <Route path="sop" element={<Sop />} />
          <Route path="approvals" element={<Approvals />} />
          <Route path="settings" element={<Settings />} />
          <Route path="help" element={<Help />} />
        </Route>

        <Route path="/erp" element={<ErpLayout />}>
          <Route index element={<ErpHome />} />
          <Route path="finance" element={<ErpFinance />} />
          <Route path="procurement" element={<ErpProcurement />} />
          <Route path="inventory" element={<ErpInventory />} />
          <Route path="operations" element={<ErpOperations />} />
          <Route path="sales" element={<ErpSales />} />
          <Route path="hr" element={<ErpHR />} />
          <Route path="approvals" element={<ErpApprovals />} />
          <Route path="integrations" element={<ErpIntegrations />} />
          <Route path="reports" element={<ErpReports />} />
          <Route path="activity" element={<ErpActivity />} />
          <Route path="settings" element={<ErpSettings />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      <Toaster
        position="top-center"
        gutter={8}
        toastOptions={{
          duration: 3200,
          style: {
            borderRadius: 12,
            border: "1px solid #E3EAF0",
            boxShadow: "0 1px 2px rgba(1,96,151,0.05), 0 18px 36px -18px rgba(1,96,151,0.28)",
            color: "#1E293B",
            fontSize: 13,
            fontFamily: "Inter, system-ui, sans-serif",
            padding: "10px 14px",
          },
          success: { iconTheme: { primary: "#1E8E5A", secondary: "#fff" } },
          error: { iconTheme: { primary: "#D8342A", secondary: "#fff" } },
        }}
      />
    </BrowserRouter>
  );
}

export default App;
