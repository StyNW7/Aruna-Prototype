import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Waves, Menu, X, LayoutDashboard, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { label: "Beranda", href: "/" },
  { label: "Tentang Aruna", href: "/tentang-aruna" },
  { label: "FISH Framework", href: "/fish-framework" },
  { label: "Cara Kerja", href: "/cara-kerja" },
  { label: "Insight", href: "/insight" },
  { label: "Kontak", href: "/kontak" },
];

export function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-all duration-200",
        scrolled ? "border-aruna-border bg-white/85 backdrop-blur-md shadow-sm" : "border-transparent bg-white/40 backdrop-blur-sm"
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="group flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg aruna-gradient text-white shadow-sm transition-transform group-hover:scale-105">
            <Waves className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <p className="font-display text-sm font-bold text-aruna-text">Aruna FISH</p>
            <p className="text-[11px] text-aruna-textSecondary">Resource-Driven Optimization</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <NavLink
              key={link.href}
              to={link.href}
              end={link.href === "/"}
              className={({ isActive }) =>
                cn(
                  "relative rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                  "after:absolute after:inset-x-3.5 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-aruna-primary after:transition-transform after:duration-200",
                  isActive
                    ? "text-aruna-primary after:scale-x-100"
                    : "text-aruna-text after:scale-x-0 hover:text-aruna-primary hover:after:scale-x-100"
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/masuk">
              <LogIn className="h-3.5 w-3.5" />
              Masuk
            </Link>
          </Button>
          <Button variant="gradient" size="sm" asChild>
            <Link to="/app/overview">
              <LayoutDashboard className="h-3.5 w-3.5" />
              Masuk ke Dashboard
            </Link>
          </Button>
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg text-aruna-text hover:bg-aruna-light1 lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-aruna-border bg-white px-4 pb-4 pt-2 animate-fade-in lg:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((link) => (
              <NavLink
                key={link.href}
                to={link.href}
                end={link.href === "/"}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "rounded-lg px-3 py-2.5 text-sm font-medium",
                    isActive ? "bg-aruna-light1 text-aruna-primary" : "text-aruna-text hover:bg-aruna-light1"
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-aruna-border pt-3">
              <Button variant="outline" asChild>
                <Link to="/masuk" onClick={() => setMobileOpen(false)}>Masuk</Link>
              </Button>
              <Button variant="gradient" asChild>
                <Link to="/app/overview" onClick={() => setMobileOpen(false)}>Masuk ke Dashboard</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
