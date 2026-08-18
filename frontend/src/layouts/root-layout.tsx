import { Outlet } from "react-router-dom";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";

function RootLayout() {
  return (
    <div className="relative flex min-h-svh flex-col bg-aruna-bg">
      <PublicNavbar />
      <div className="flex-1">
        <Outlet />
      </div>
      <PublicFooter />
    </div>
  );
}

export default RootLayout;
