import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { DashboardHeader } from "./DashboardHeader";
import { AppProvider } from "@/context/AppContext";

export default function DashboardLayout() {
  const { pathname } = useLocation();
  return (
    <AppProvider>
      <div className="flex min-h-svh bg-aruna-bg">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardHeader />
          <main className="dashboard-canvas flex-1 px-4 py-6 sm:px-6 lg:px-8">
            {/* key per rute agar setiap halaman mendapat animasi masuk yang halus */}
            <div key={pathname} className="animate-fade-up">
              <Outlet />
            </div>
          </main>
          <footer className="border-t border-aruna-border px-4 py-3 text-center text-[11px] text-aruna-textSecondary sm:px-6 lg:px-8">
            Aruna FISH Operations · Prototype — seluruh data bersifat ilustratif
          </footer>
        </div>
      </div>
    </AppProvider>
  );
}
