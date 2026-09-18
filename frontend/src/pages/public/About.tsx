import { Link } from "react-router-dom";
import {
  Anchor,
  Users,
  Globe2,
  Fish,
  Factory,
  Package,
  ShoppingBag,
  ArrowRight,
  MapPin,
  Network,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatKg, formatPercent } from "@/utils/format";
import { PageHero } from "@/components/public/PageHero";

const valueChain = [
  { icon: Anchor, title: "Nelayan", desc: "Nelayan skala kecil di sekitar Teluk Bungus dan pesisir Sumatera Barat menangkap dan menyalurkan hasil laut segar." },
  { icon: Network, title: "Hub Aruna", desc: "Hub Pelabuhan Bungus menerima, menimbang, dan menggrading hasil tangkapan sebagai titik konsolidasi supply." },
  { icon: Factory, title: "Processing", desc: "Whole Fish diproses menjadi Fresh Loin, WIP, hingga Finished Goods sesuai karakteristik bahan baku." },
  { icon: Package, title: "Finished Goods", desc: "SAKU, Steak, Poke, Medallion, Ground Meat, dan side product siap dikemas dan didistribusikan." },
  { icon: ShoppingBag, title: "Buyer", desc: "Produk disalurkan ke buyer domestik dan pembeli ekspor internasional dengan standar kualitas terjaga." },
];

const pillars = [
  {
    icon: Users,
    title: "Peran Nelayan",
    desc: "Aruna menjembatani nelayan skala kecil dengan pasar yang lebih luas — memberi kepastian penyaluran hasil tangkapan dan harga yang lebih transparan.",
  },
  {
    icon: Globe2,
    title: "Pasar Domestik & Ekspor",
    desc: "Produk olahan tuna Aruna melayani kebutuhan pasar domestik sekaligus memenuhi standar buyer ekspor di berbagai negara tujuan.",
  },
  {
    icon: ShieldCheck,
    title: "Integrated Fisheries System",
    desc: "Seluruh mata rantai — dari laut hingga buyer — terhubung dalam satu sistem yang mengedepankan traceability, efisiensi, dan nilai berkelanjutan.",
  },
];

export default function About() {
  return (
    <div className="pb-24">
      {/* HERO */}
      <PageHero
        badge="Tentang Aruna"
        badgeIcon={Fish}
        title="Platform Perikanan Terintegrasi dari Laut hingga Pasar Global"
        description="PT Aruna Jaya Nuswantara adalah integrated fisheries commerce platform yang menghubungkan nelayan skala kecil dengan pasar domestik dan ekspor. Aruna hadir untuk memastikan setiap hasil laut diproses dan disalurkan menjadi produk bernilai tinggi, secara adil dan berkelanjutan."
        stats={[
          { value: "5 tahap", label: "Rantai nilai" },
          { value: "1 hub", label: "Pelabuhan Bungus" },
          { value: "Ekspor", label: "Jangkauan pasar" },
        ]}
        aside={
          <Card className="p-5 shadow-elevated">
            <p className="text-xs font-semibold uppercase tracking-wide text-aruna-textSecondary">Rantai Nilai Aruna</p>
            <ol className="mt-4 space-y-2.5">
              {valueChain.map((v, i) => (
                <li key={v.title} className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      i === 2 ? "aruna-gradient text-white shadow-glow" : "bg-aruna-light1 text-aruna-primary"
                    }`}
                  >
                    <v.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 rounded-lg border border-aruna-border bg-aruna-bg px-3 py-1.5">
                    <p className="text-sm font-semibold text-aruna-text">{v.title}</p>
                  </div>
                  {i < valueChain.length - 1 && <ArrowRight className="hidden h-4 w-4 shrink-0 text-aruna-textSecondary sm:block" />}
                </li>
              ))}
            </ol>
          </Card>
        }
      />

      {/* HUB CONTEXT */}
      <section className="container py-16">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="flex items-center gap-2 text-aruna-secondary">
              <MapPin className="h-4 w-4" />
              <span className="text-sm font-semibold uppercase tracking-wide">
                Hub Pelabuhan Bungus, Padang
              </span>
            </div>
            <h2 className="mt-3 font-display text-3xl font-bold text-aruna-text">
              Pusat Konsolidasi dan Pengolahan Tuna
            </h2>
            <p className="mt-4 text-aruna-textSecondary leading-relaxed">
              Studi kasus ini berfokus pada operasional pengolahan tuna di Hub Pelabuhan Bungus —
              titik pertemuan antara hasil tangkapan nelayan dan proses transformasi menjadi
              produk bernilai tinggi. Di hub ini, Whole Fish / WGG diterima, digrading, kemudian
              diproses menjadi Fresh Loin, WIP, dan akhirnya Finished Goods seperti SAKU, Steak,
              Poke/Cube, Medallion, Ground Meat, dan side product lainnya.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <Card className="p-4">
                <p className="text-xs font-medium text-aruna-textSecondary">Total Supply Historis</p>
                <p className="mt-1 font-display text-xl font-bold text-aruna-text">{formatKg(53899)}</p>
              </Card>
              <Card className="p-4">
                <p className="text-xs font-medium text-aruna-textSecondary">Rata-rata Yield Loin</p>
                <p className="mt-1 font-display text-xl font-bold text-aruna-text">{formatPercent(59.07)}</p>
              </Card>
            </div>
          </div>
          <Card className="p-6">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-aruna-textSecondary">
              Karakteristik Supply Ilustratif
            </p>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-aruna-text">Distribusi ukuran 30 UP</span>
                  <span className="font-semibold text-aruna-text">{formatPercent(85.2)}</span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-aruna-light1">
                  <div className="h-full aruna-gradient" style={{ width: "85.2%" }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-aruna-text">Dominasi Grade C</span>
                  <span className="font-semibold text-aruna-text">{formatPercent(91.6)}</span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-aruna-light1">
                  <div className="h-full aruna-gradient" style={{ width: "91.6%" }} />
                </div>
              </div>
            </div>
            <p className="mt-4 text-xs text-aruna-textSecondary">
              Variasi ukuran dan grade inilah yang mendorong perlunya pendekatan resource-driven,
              bukan sekadar mengikuti PO.
            </p>
          </Card>
        </div>
      </section>

      {/* VALUE CHAIN */}
      <section className="border-y border-aruna-border bg-white py-16">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-aruna-secondary">
              Rantai Nilai Aruna
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold text-aruna-text">
              Dari Laut Menuju Buyer
            </h2>
          </div>
          <div className="mt-12 flex flex-col gap-4 lg:flex-row lg:items-stretch">
            {valueChain.map((step, i) => (
              <div key={step.title} className="flex flex-1 items-center gap-3">
                <Card className="flex-1 p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-aruna-light1 text-aruna-primary">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-3 font-display text-sm font-semibold text-aruna-text">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-aruna-textSecondary">{step.desc}</p>
                </Card>
                {i < valueChain.length - 1 && (
                  <ArrowRight className="hidden h-4 w-4 shrink-0 text-aruna-textSecondary lg:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PILLARS */}
      <section className="container py-16">
        <div className="grid gap-6 lg:grid-cols-3">
          {pillars.map((p) => (
            <Card key={p.title} className="p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-aruna-light1 text-aruna-primary">
                <p.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-base font-semibold text-aruna-text">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-aruna-textSecondary">{p.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container">
        <Card className="flex flex-col items-center gap-4 border-aruna-border bg-aruna-light1/50 p-10 text-center">
          <Sparkles className="h-6 w-6 text-aruna-primary" />
          <h2 className="font-display text-2xl font-bold text-aruna-text">
            Ingin tahu bagaimana FISH mengubah cara Aruna beroperasi?
          </h2>
          <Button asChild variant="gradient" size="lg">
            <Link to="/fish-framework">
              Jelajahi FISH Framework
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </Card>
      </section>
    </div>
  );
}
