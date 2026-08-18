import { Link } from "react-router-dom";
import { Home, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-aruna-bg px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl aruna-gradient text-white shadow-soft">
        <Waves className="h-7 w-7" />
      </div>
      <p className="mt-6 font-display text-6xl font-bold text-aruna-primary">404</p>
      <h1 className="mt-3 font-display text-2xl font-bold text-aruna-text">Halaman Tidak Ditemukan</h1>
      <p className="mt-2 max-w-sm text-sm text-aruna-textSecondary">
        Halaman yang Anda cari tidak tersedia atau telah dipindahkan.
      </p>
      <Button className="mt-6" variant="gradient" asChild>
        <Link to="/">
          <Home className="h-4 w-4" />
          Kembali ke Beranda
        </Link>
      </Button>
    </div>
  );
}
