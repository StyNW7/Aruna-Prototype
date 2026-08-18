import { Link } from "react-router-dom";
import { Waves, MapPin, Mail, Phone } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="border-t border-aruna-border bg-aruna-dark text-white/80">
      <div className="container grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
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
        </div>

        <div>
          <p className="font-display text-sm font-semibold text-white">Navigasi</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link to="/tentang-aruna" className="hover:text-white">Tentang Aruna</Link></li>
            <li><Link to="/fish-framework" className="hover:text-white">FISH Framework</Link></li>
            <li><Link to="/cara-kerja" className="hover:text-white">Cara Kerja</Link></li>
            <li><Link to="/insight" className="hover:text-white">Insight</Link></li>
          </ul>
        </div>

        <div>
          <p className="font-display text-sm font-semibold text-white">Platform</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link to="/masuk" className="hover:text-white">Masuk</Link></li>
            <li><Link to="/app/overview" className="hover:text-white">Dashboard Operasional</Link></li>
            <li><Link to="/kontak" className="hover:text-white">Kontak Tim</Link></li>
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
              operasional@aruna.id
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 shrink-0 text-white/50" />
              (0751) 000-0000
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5">
        <div className="container flex flex-col items-center justify-between gap-2 text-xs text-white/50 sm:flex-row">
          <p>© 2024 PT Aruna Jaya Nuswantara. Prototype untuk kebutuhan business case competition.</p>
          <p>Seluruh data pada prototype ini bersifat ilustratif.</p>
        </div>
      </div>
    </footer>
  );
}
