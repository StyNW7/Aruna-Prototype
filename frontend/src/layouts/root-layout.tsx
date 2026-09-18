import { Outlet, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";

function RootLayout() {
  const { pathname } = useLocation();
  // Beranda memakai animasi framer-motion sendiri; halaman lain memakai scroll-driven reveal CSS
  const reveal = pathname !== "/" && pathname !== "/masuk" && pathname !== "/onboarding";
  return (
    <div className="relative flex min-h-svh flex-col bg-aruna-bg">
      <PublicNavbar />
      <div className={cn("flex-1", reveal && "public-reveal")}>
        <Outlet />
      </div>
      <PublicFooter />
    </div>
  );
}

export default RootLayout;
