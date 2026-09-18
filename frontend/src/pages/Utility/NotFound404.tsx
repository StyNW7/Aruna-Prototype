import { Link } from "react-router-dom";
import { Home, Waves, LayoutDashboard, Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden mesh-hero px-4 text-center">
      <div className="pointer-events-none absolute inset-0 dot-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
      <div className="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-aruna-medium/25 blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute -right-24 bottom-1/4 h-72 w-72 rounded-full bg-aruna-light2 blur-3xl animate-float" />

      <div className="relative animate-fade-up">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl aruna-gradient text-white shadow-glow">
          <Waves className="h-8 w-8" />
        </div>
        <p className="mt-8 font-display text-[88px] font-bold leading-none aruna-gradient-text sm:text-[120px]">404</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-aruna-text sm:text-3xl">Halaman Tidak Ditemukan</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-aruna-textSecondary sm:text-base">
          Halaman yang Anda cari tidak tersedia atau telah dipindahkan. Mungkin ikannya sudah diproses jadi SAKU 16 OZ.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button variant="gradient" size="lg" asChild>
            <Link to="/">
              <Home className="h-4 w-4" />
              Kembali ke Beranda
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild className="bg-white/80 backdrop-blur">
            <Link to="/app/overview">
              <LayoutDashboard className="h-4 w-4 text-aruna-primary" />
              Buka Dashboard
            </Link>
          </Button>
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-aruna-textSecondary">
          <button type="button" onClick={() => window.history.back()} className="inline-flex items-center gap-1 hover:text-aruna-primary">
            <ArrowLeft className="h-3.5 w-3.5" /> Halaman sebelumnya
          </button>
          <span className="h-3 w-px bg-aruna-border" />
          <Link to="/app/overview" className="inline-flex items-center gap-1 hover:text-aruna-primary">
            <Search className="h-3.5 w-3.5" /> Cari di dashboard (Ctrl+K)
          </Link>
        </div>
      </div>
    </div>
  );
}
