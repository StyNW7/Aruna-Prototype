import { Link } from "react-router-dom";
import {
  Zap,
  Calculator,
  LayoutDashboard,
  BookText,
  ArrowRight,
  Gauge,
  Sliders,
  DollarSign,
  Boxes,
  Sparkles,
  Container,
  AlertTriangle,
  FileCheck2,
  ClipboardCheck,
  TrendingUp,
  Target,
  ListChecks,
  Repeat,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PillarDetail {
  letter: string;
  name: string;
  tagline: string;
  icon: typeof Zap;
  problem: string;
  howItWorks: string;
  features: { icon: typeof Zap; text: string }[];
  output: string;
  impact: string[];
}

const pillars: PillarDetail[] = [
  {
    letter: "F",
    name: "Factory Energy Intelligence",
    tagline: "Measure Better",
    icon: Zap,
    problem:
      "Energi selama ini dibebankan secara general per periode produksi, bukan per proses atau per SKU. Akibatnya, tidak jelas produk mana yang boros energi dan mana yang efisien.",
    howItWorks:
      "F mengukur konsumsi daya tiap mesin (bandsaw, freezer, chiller, cold storage, peralatan proses) berdasarkan runtime dan volume aktual, lalu mengalokasikan biaya energi tersebut secara proporsional ke setiap proses dan SKU yang melaluinya.",
    features: [
      { icon: Gauge, text: "Pemetaan konsumsi kWh per mesin dan proses" },
      { icon: Calculator, text: "Alokasi biaya energi ke level SKU" },
      { icon: TrendingUp, text: "Model efisiensi energi dari waktu ke waktu" },
    ],
    output: "Energy model lengkap dengan parameter efisiensi per proses dan per SKU.",
    impact: [
      "Biaya energi riil per produk menjadi terlihat",
      "Basis akurat untuk perhitungan true value produk",
      "Identifikasi proses paling boros energi",
    ],
  },
  {
    letter: "I",
    name: "Integrated Value Optimization",
    tagline: "Optimize Better",
    icon: Calculator,
    problem:
      "Perhitungan supply, yield, joint-cost, energi, harga, kapasitas, demand, dan kualitas selama ini berjalan di spreadsheet terpisah — sulit menemukan kombinasi produksi paling bernilai.",
    howItWorks:
      "I menggabungkan seluruh variabel tersebut ke dalam satu model optimisasi: karakteristik supply yang masuk, yield tiap SKU, biaya energi dari pilar F, kapasitas plant, demand buyer, dan syarat kualitas — untuk menghasilkan rekomendasi harga dan production mix optimal.",
    features: [
      { icon: Sliders, text: "Production mix optimizer lintas SKU" },
      { icon: DollarSign, text: "Pricing advisor berbasis true value" },
      { icon: Target, text: "Perhitungan joint-cost dan margin per SKU" },
    ],
    output: "Rekomendasi harga jual dan production mix yang memaksimalkan nilai dari supply yang tersedia.",
    impact: [
      "Alokasi bahan baku ke SKU bernilai tertinggi",
      "Harga jual mencerminkan true value produk",
      "Margin per SKU lebih transparan",
    ],
  },
  {
    letter: "S",
    name: "Smart Operations Dashboard",
    tagline: "Execute Better",
    icon: LayoutDashboard,
    problem:
      "Tanpa satu tampilan operasional yang terpadu, tim kesulitan memantau status supply, produksi, inventory, dan energi secara real-time — keputusan menjadi lambat dan reaktif.",
    howItWorks:
      "S menjalankan seluruh hasil perhitungan pilar F dan I secara operasional harian: menampilkan rekomendasi, mengelola inventory, memantau produksi, dan memungkinkan simulasi skenario sebelum keputusan diambil.",
    features: [
      { icon: Boxes, text: "Inventory management WIP & finished goods" },
      { icon: Sparkles, text: "Scenario simulator untuk uji dampak keputusan" },
      { icon: Container, text: "Container planner untuk perencanaan ekspor" },
      { icon: AlertTriangle, text: "Excess monitoring dan peringatan dini" },
    ],
    output: "Satu dashboard operasional harian untuk seluruh tim lintas fungsi.",
    impact: [
      "Visibilitas end-to-end dari supply hingga shipment",
      "Keputusan harian didukung data real-time",
      "Deteksi risiko excess lebih awal",
    ],
  },
  {
    letter: "H",
    name: "Harmonized SOP & Decision Rules",
    tagline: "Standardize Better",
    icon: BookText,
    problem:
      "Tanpa SOP dan aturan keputusan yang seragam, eksekusi rekomendasi bisa berbeda antar shift maupun antar individu, sehingga konsistensi kualitas dan hasil sulit dijaga.",
    howItWorks:
      "H menstandarkan bagaimana rekomendasi dari pilar F, I, dan S dijalankan — termasuk siapa yang berwenang menyetujui, batas toleransi override, dan bagaimana performa dievaluasi secara berkala.",
    features: [
      { icon: FileCheck2, text: "SOP eligibility, pricing, capacity, dan energy" },
      { icon: ClipboardCheck, text: "Alur approval terstruktur" },
      { icon: ListChecks, text: "Plan vs actual performance review" },
      { icon: Repeat, text: "Siklus evaluasi dan penyempurnaan berkelanjutan" },
    ],
    output: "Aturan dan alur kerja baku yang menjaga konsistensi eksekusi di seluruh organisasi.",
    impact: [
      "Keputusan konsisten lintas shift dan tim",
      "Jejak audit yang jelas untuk setiap approval",
      "Perbaikan berkelanjutan berbasis plan vs actual",
    ],
  },
];

export default function FishFramework() {
  return (
    <div className="pb-24">
      {/* HERO */}
      <section className="border-b border-aruna-border bg-white py-16">
        <div className="container">
          <Badge variant="primary" className="mb-4">
            Solusi FISH
          </Badge>
          <h1 className="max-w-3xl font-display text-4xl font-bold text-aruna-text">
            Framework FISH: Empat Pilar Menuju Resource-Driven Value Optimization
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-aruna-textSecondary">
            FISH — Factory Energy Intelligence, Integrated Value Optimization, Smart Operations
            Dashboard, dan Harmonized SOP & Decision Rules — bekerja sebagai satu sistem yang
            saling melengkapi, mengubah cara Aruna mengelola energi, nilai produk, dan keputusan
            operasional.
          </p>
        </div>
      </section>

      {/* PILLAR NAV */}
      <section className="container py-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p) => (
            <a
              key={p.letter}
              href={`#${p.letter}`}
              className="flex items-center gap-3 rounded-xl border border-aruna-border bg-white p-4 transition-shadow hover:shadow-soft"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg aruna-gradient font-display font-bold text-white">
                {p.letter}
              </div>
              <div>
                <p className="text-sm font-semibold text-aruna-text">{p.name}</p>
                <p className="text-xs text-aruna-textSecondary">{p.tagline}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* PILLAR DETAILS */}
      <div className="space-y-16 py-4">
        {pillars.map((p, i) => (
          <section
            key={p.letter}
            id={p.letter}
            className={i % 2 === 1 ? "border-y border-aruna-border bg-white py-16" : "py-16"}
          >
            <div className="container">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl aruna-gradient font-display text-2xl font-bold text-white">
                  {p.letter}
                </div>
                <div>
                  <Badge variant="outline">{p.tagline}</Badge>
                  <h2 className="mt-1 font-display text-2xl font-bold text-aruna-text">{p.name}</h2>
                </div>
              </div>

              <div className="mt-8 grid gap-6 lg:grid-cols-2">
                <Card className="p-6">
                  <CardHeader className="p-0">
                    <CardTitle className="text-sm uppercase tracking-wide text-aruna-error">
                      Masalah
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 pt-3">
                    <p className="text-sm leading-relaxed text-aruna-textSecondary">{p.problem}</p>
                  </CardContent>
                </Card>
                <Card className="p-6">
                  <CardHeader className="p-0">
                    <CardTitle className="text-sm uppercase tracking-wide text-aruna-primary">
                      Cara Kerja
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 pt-3">
                    <p className="text-sm leading-relaxed text-aruna-textSecondary">{p.howItWorks}</p>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                <Card className="p-6">
                  <CardTitle className="text-sm uppercase tracking-wide text-aruna-text">
                    Fitur Utama
                  </CardTitle>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {p.features.map((f) => (
                      <div key={f.text} className="flex items-start gap-2.5 rounded-lg bg-aruna-light1/60 p-3">
                        <f.icon className="mt-0.5 h-4 w-4 shrink-0 text-aruna-primary" />
                        <span className="text-sm text-aruna-text">{f.text}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                <div className="flex flex-col gap-6">
                  <Card className="flex-1 border-aruna-secondary/30 bg-aruna-light1/40 p-6">
                    <CardTitle className="text-sm uppercase tracking-wide text-aruna-primary">
                      Output
                    </CardTitle>
                    <p className="mt-3 text-sm leading-relaxed text-aruna-text">{p.output}</p>
                  </Card>
                  <Card className="flex-1 p-6">
                    <CardTitle className="text-sm uppercase tracking-wide text-aruna-success">
                      Impact
                    </CardTitle>
                    <ul className="mt-3 space-y-2">
                      {p.impact.map((im) => (
                        <li key={im} className="flex items-start gap-2 text-sm text-aruna-textSecondary">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aruna-success" />
                          {im}
                        </li>
                      ))}
                    </ul>
                  </Card>
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* CTA */}
      <section className="container">
        <Card className="flex flex-col items-center gap-4 border-aruna-border bg-aruna-light1/50 p-10 text-center">
          <h2 className="font-display text-2xl font-bold text-aruna-text">
            Lihat bagaimana keempat pilar bekerja bersama, langkah demi langkah
          </h2>
          <Button asChild variant="gradient" size="lg">
            <Link to="/cara-kerja">
              Lihat Cara Kerja
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </Card>
      </section>
    </div>
  );
}
