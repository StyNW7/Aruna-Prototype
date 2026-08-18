import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { DashboardHeader } from "./DashboardHeader";
import { AppProvider } from "@/context/AppContext";

export default function DashboardLayout() {
  return (
    <AppProvider>
      <div className="flex min-h-svh bg-aruna-bg">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardHeader />
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </AppProvider>
  );
}
