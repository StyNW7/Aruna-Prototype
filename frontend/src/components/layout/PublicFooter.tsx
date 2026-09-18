import { Link } from "react-router-dom";
import { Waves, MapPin, Mail, Phone, ArrowUpRight } from "lucide-react";

const pillars = ["Factory Energy Intelligence", "Integrated Value Optimization", "Smart Operations Dashboard", "Harmonized SOP"];

export function PublicFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative overflow-hidden border-t border-aruna-border bg-aruna-dark text-white/80">
      <div className="pointer-events-none absolute inset-0 line-grid-light opacity-40" />
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-aruna-secondary/20 blur-3xl" />
      <div className="container relative grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white">
              <Waves className="h-5 w-5" />
            </div>
            <p className="font-display text-sm font-bold text-white">Aruna FISH</p>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
            Integrated fisheries commerce platform yang mengubah data operasional menjadi keputusan produksi
            paling bernilai.
          </p>
          <div className="mt-5 flex flex-wrap gap-1.5">
            {pillars.map((p) => (
              <span key={p} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white/70">
                {p}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="font-display text-sm font-semibold text-white">Navigasi</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link to="/tentang-aruna" className="transition-colors hover:text-white">Tentang Aruna</Link></li>
            <li><Link to="/fish-framework" className="transition-colors hover:text-white">FISH Framework</Link></li>
            <li><Link to="/cara-kerja" className="transition-colors hover:text-white">Cara Kerja</Link></li>
            <li><Link to="/insight" className="transition-colors hover:text-white">Insight</Link></li>
          </ul>
        </div>

        <div>
          <p className="font-display text-sm font-semibold text-white">Platform</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link to="/masuk" className="transition-colors hover:text-white">Masuk</Link></li>
            <li>
              <Link to="/app/overview" className="inline-flex items-center gap-1 transition-colors hover:text-white">
                Dashboard Operasional
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </li>
            <li><Link to="/onboarding" className="transition-colors hover:text-white">Onboarding</Link></li>
            <li><Link to="/kontak" className="transition-colors hover:text-white">Kontak Tim</Link></li>
          </ul>
        </div>

        <div>
          <p className="font-display text-sm font-semibold text-white">Kontak</p>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-white/50" />
              Hub Pelabuhan Bungus, Padang, Sumatera Barat
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 shrink-0 text-white/50" />
              <a href="mailto:operasional@arunajaya.co.id" className="transition-colors hover:text-white">
                operasional@arunajaya.co.id
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 shrink-0 text-white/50" />
              <a href="tel:+62751123456" className="transition-colors hover:text-white">
                (0751) 123-456
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="relative border-t border-white/10 py-5">
        <div className="container flex flex-col items-center justify-between gap-2 text-xs text-white/50 sm:flex-row">
          <p>© {year} PT Aruna Jaya Nuswantara. Prototype untuk kebutuhan business case competition.</p>
          <p className="inline-flex items-center gap-1.5">
            <span className="live-dot h-1.5 w-1.5 rounded-full bg-aruna-success" />
            Seluruh data pada prototype ini bersifat ilustratif.
          </p>
        </div>
      </div>
    </footer>
  );
}
