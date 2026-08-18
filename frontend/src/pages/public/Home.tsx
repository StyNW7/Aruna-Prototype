import { Link } from "react-router-dom";
import {
  ArrowRight,
  Zap,
  Calculator,
  Network,
  ClipboardCheck,
  Fish,
  Layers,
  LayoutDashboard,
  BookText,
  Gauge,
  TrendingUp,
  Boxes,
  SlidersHorizontal,
  Container,
  AlertTriangle,
  FileCheck2,
  ListChecks,
  CheckCircle2,
  XCircle,
  Sparkles,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KPICard } from "@/components/cards/KPICard";
import { Progress } from "@/components/ui/progress";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
import { CHART_COLORS, CHART_GRID_COLOR, CHART_AXIS_COLOR, chartTooltipStyle } from "@/components/charts/chart-theme";
import { formatKg, formatPercent, formatRupiahJuta } from "@/utils/format";

const challenges = [
  {
    icon: Zap,
    title: "Energy Visibility Gap",
    description:
      "Konsumsi dan biaya energi belum terukur secara akurat per proses maupun per SKU, sehingga sulit tahu produk mana yang benar-benar hemat energi.",
  },
  {
    icon: Calculator,
    title: "Value Optimization Gap",
    description:
      "Perhitungan yield, joint-cost, energi, dan harga masih berjalan terpisah-pisah, membuat keputusan produksi belum mengoptimalkan nilai maksimal.",
  },
  {
    icon: Network,
    title: "Production Intelligence Gap",
    description:
      "Data supply, inventory, produksi, dan keuangan belum saling terhubung, sehingga visibilitas operasional menjadi terbatas dan reaktif.",
  },
  {
    icon: ClipboardCheck,
    title: "Execution Governance Gap",
    description:
      "Belum ada SOP dan aturan keputusan yang harmonis, sehingga eksekusi rekomendasi operasional bisa berbeda-beda tergantung individu.",
  },
];

const fishPillars = [
  {
    letter: "F",
    name: "Factory Energy Intelligence",
    tagline: "Measure Better",
    description: "Mengukur konsumsi dan biaya energi secara akurat per proses dan per SKU.",
    icon: Zap,
  },
  {
    letter: "I",
    name: "Integrated Value Optimization",
    tagline: "Optimize Better",
    description: "Menggabungkan yield, biaya, energi, dan harga untuk menemukan production mix bernilai tertinggi.",
    icon: Calculator,
  },
  {
    letter: "S",
    name: "Smart Operations Dashboard",
    tagline: "Execute Better",
    description: "Menjalankan rekomendasi, monitoring, dan simulasi skenario dalam satu dashboard operasional.",
    icon: LayoutDashboard,
  },
  {
    letter: "H",
    name: "Harmonized SOP & Decision Rules",
    tagline: "Standardize Better",
    description: "Menstandarkan cara rekomendasi dijalankan, disetujui, dan dievaluasi di seluruh tim.",
    icon: BookText,
  },
];

const before = [
  "Produksi mengikuti purchase order (PO-driven)",
  "Data operasional terfragmentasi antar fungsi",
  "Biaya energi dihitung secara general",
  "Keputusan produksi bertumpu pada manual judgement",
  "Excess produk & sisa bahan baku tinggi",
];

const after = [
  "Produksi mengikuti karakteristik supply (resource-driven)",
  "Optimisasi terintegrasi lintas fungsi",
  "Energy intelligence hingga level SKU",
  "Rekomendasi berbasis data (data-driven)",
  "Monitoring berkelanjutan menekan excess",
];

const capabilities = [
  { icon: Gauge, title: "Energy Intelligence", desc: "Alokasi biaya energi akurat per proses & SKU." },
  { icon: TrendingUp, title: "Yield Analysis", desc: "Pelacakan yield Whole Fish → Loin → Finished Goods." },
  { icon: SlidersHorizontal, title: "Production Optimizer", desc: "Rekomendasi production mix bernilai tertinggi." },
  { icon: DollarSign, title: "Pricing Advisor", desc: "Rekomendasi harga jual berbasis true value produk." },
  { icon: Boxes, title: "Inventory Management", desc: "Visibilitas stok WIP dan finished goods real-time." },
  { icon: Sparkles, title: "Scenario Simulator", desc: "Simulasi dampak perubahan supply, tarif, dan demand." },
  { icon: Container, title: "Container Planner", desc: "Perencanaan muatan ekspor sesuai kapasitas kontainer." },
  { icon: AlertTriangle, title: "Excess Monitoring", desc: "Deteksi dini potensi kelebihan produk & bahan baku." },
  { icon: FileCheck2, title: "SOP & Approval", desc: "Alur persetujuan terstandarisasi untuk setiap keputusan." },
  { icon: ListChecks, title: "Plan vs Actual", desc: "Perbandingan rencana dan realisasi produksi harian." },
];

const dashboardTrend = [
  { day: "Sen", profit: 182 },
  { day: "Sel", profit: 196 },
  { day: "Rab", profit: 174 },
  { day: "Kam", profit: 214 },
  { day: "Jum", profit: 231 },
  { day: "Sab", profit: 219 },
  { day: "Min", profit: 244 },
];

const mixPreview = [
  { sku: "SAKU 16OZ", value: 32 },
  { sku: "Steak", value: 27 },
  { sku: "Poke", value: 15 },
  { sku: "Medallion", value: 14 },
  { sku: "Ground", value: 12 },
];

export default function Home() {
  return (
    <div className="pb-24">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-aruna-border bg-white">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-aruna-light1 blur-3xl" />
        <div className="pointer-events-none absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-aruna-light2/60 blur-3xl" />
        <div className="container relative grid gap-14 py-20 lg:grid-cols-2 lg:items-center lg:py-28">
          <div>
            <Badge variant="primary" className="mb-5">
              <Fish className="h-3.5 w-3.5" />
              FISH Framework — PT Aruna Jaya Nuswantara
            </Badge>
            <h1 className="font-display text-4xl font-bold leading-tight text-aruna-text sm:text-5xl">
              Optimalkan Setiap Ikan Menjadi{" "}
              <span className="aruna-gradient-text">Nilai Berkelanjutan Tertinggi.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-aruna-textSecondary sm:text-lg">
              FISH membantu Aruna mengintegrasikan energi, nilai produk, production mix, dan keputusan
              operasional ke dalam satu sistem yang adaptif dan terukur.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" variant="gradient">
                <Link to="/fish-framework">
                  Jelajahi FISH
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/app/overview">Masuk ke Dashboard</Link>
              </Button>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-aruna-textSecondary">
              <div>
                <span className="font-display text-xl font-bold text-aruna-text">
                  {formatKg(53899)}
                </span>{" "}
                total supply historis
              </div>
              <div>
                <span className="font-display text-xl font-bold text-aruna-text">
                  {formatPercent(59.07)}
                </span>{" "}
                yield rata-rata Loin
              </div>
              <div>
                <span className="font-display text-xl font-bold text-aruna-text">4 pilar</span> FISH
              </div>
            </div>
          </div>

          {/* Abstract flow visual */}
          <div className="relative">
            <Card className="p-6 shadow-soft">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-aruna-textSecondary">
                Alur Optimalisasi Nilai
              </p>
              <div className="flex flex-col gap-3">
                {[
                  { label: "Whole Fish / WGG", sub: "Bahan baku masuk", icon: Fish },
                  { label: "Fresh Loin", sub: "Yield ~59,07%", icon: Layers },
                  { label: "Optimizer FISH", sub: "Alokasi nilai tertinggi", icon: Sparkles },
                  { label: "SKU Finished Goods", sub: "SAKU · Steak · Poke · dst", icon: Boxes },
                ].map((step, i) => (
                  <div key={step.label} className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-aruna-light1 text-aruna-primary">
                      <step.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 rounded-lg border border-aruna-border bg-aruna-bg px-3 py-2">
                      <p className="text-sm font-semibold text-aruna-text">{step.label}</p>
                      <p className="text-xs text-aruna-textSecondary">{step.sub}</p>
                    </div>
                    {i < 3 && (
                      <ArrowRight className="hidden h-4 w-4 shrink-0 text-aruna-textSecondary sm:block" />
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-aruna-border bg-aruna-light1 p-3">
                  <div className="flex items-center gap-1.5 text-aruna-primary">
                    <Zap className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">Efisiensi Energi</span>
                  </div>
                  <p className="mt-1 font-display text-lg font-bold text-aruna-text">
                    {formatPercent(18.4)}
                  </p>
                </div>
                <div className="rounded-lg border border-aruna-border bg-aruna-light1 p-3">
                  <div className="flex items-center gap-1.5 text-aruna-primary">
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">Uplift Profit</span>
                  </div>
                  <p className="mt-1 font-display text-lg font-bold text-aruna-text">
                    {formatPercent(12.7)}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CHALLENGES */}
      <section className="container py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-aruna-secondary">
            Tantangan Saat Ini
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold text-aruna-text">
            Empat Celah yang Menahan Nilai Produksi
          </h2>
          <p className="mt-4 text-aruna-textSecondary">
            Sebelum FISH, keputusan operasional Aruna berjalan di atas data yang terpisah dan
            kurang terukur.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {challenges.map((c) => (
            <Card key={c.title} className="p-6 transition-shadow hover:shadow-soft">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-aruna-errorBg text-aruna-error">
                <c.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-base font-semibold text-aruna-text">
                {c.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-aruna-textSecondary">
                {c.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* FISH FRAMEWORK */}
      <section className="border-y border-aruna-border bg-white py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-aruna-secondary">
              Solusi
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold text-aruna-text">
              Framework FISH
            </h2>
            <p className="mt-4 text-aruna-textSecondary">
              Empat pilar yang bekerja bersama mengubah PO-Driven Production menjadi Resource-Driven
              Value Optimization.
            </p>
          </div>

          <div className="mt-14 grid gap-4 lg:grid-cols-4">
            {fishPillars.map((p, i) => (
              <div key={p.letter} className="relative">
                <Card className="h-full p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl aruna-gradient font-display text-xl font-bold text-white">
                      {p.letter}
                    </div>
                    <Badge variant="outline">{p.tagline}</Badge>
                  </div>
                  <h3 className="mt-4 font-display text-base font-semibold text-aruna-text">
                    {p.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-aruna-textSecondary">
                    {p.description}
                  </p>
                </Card>
                {i < fishPillars.length - 1 && (
                  <div className="absolute right-[-1.1rem] top-1/2 z-10 hidden -translate-y-1/2 lg:block">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-aruna-border bg-white text-aruna-secondary shadow-sm">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <Button asChild variant="secondary">
              <Link to="/fish-framework">
                Lihat detail framework
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* TRANSFORMATION */}
      <section className="container py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-aruna-secondary">
            Transformasi Operasional
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold text-aruna-text">
            PO-Driven Production → Resource-Driven Value Optimization
          </h2>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <Card className="border-aruna-border p-7">
            <div className="mb-5 flex items-center gap-2">
              <XCircle className="h-5 w-5 text-aruna-error" />
              <h3 className="font-display text-lg font-semibold text-aruna-text">Sebelum</h3>
            </div>
            <ul className="space-y-3.5">
              {before.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-aruna-textSecondary">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aruna-error" />
                  {item}
                </li>
              ))}
            </ul>
          </Card>
          <Card className="border-aruna-secondary/40 bg-aruna-light1/40 p-7">
            <div className="mb-5 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-aruna-success" />
              <h3 className="font-display text-lg font-semibold text-aruna-text">Setelah FISH</h3>
            </div>
            <ul className="space-y-3.5">
              {after.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-aruna-text">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aruna-success" />
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      {/* CAPABILITIES */}
      <section className="border-y border-aruna-border bg-white py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-aruna-secondary">
              Kapabilitas Utama
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold text-aruna-text">
              Satu Sistem, Sepuluh Kapabilitas Operasional
            </h2>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {capabilities.map((c) => (
              <Card key={c.title} className="p-5 transition-shadow hover:shadow-soft">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-aruna-light1 text-aruna-primary">
                  <c.icon className="h-4.5 w-4.5" />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-aruna-text">{c.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-aruna-textSecondary">{c.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* DASHBOARD PREVIEW */}
      <section className="container py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-aruna-secondary">
            Smart Operations Dashboard
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold text-aruna-text">
            Lihat Sekilas Dashboard yang Akan Anda Gunakan
          </h2>
          <p className="mt-4 text-aruna-textSecondary">
            KPI, rekomendasi, dan monitoring operasional dalam satu tampilan yang terpadu.
          </p>
        </div>

        <Card className="mx-auto mt-12 max-w-6xl overflow-hidden p-0 shadow-soft">
          {/* fake browser chrome */}
          <div className="flex items-center gap-2 border-b border-aruna-border bg-aruna-bg px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-aruna-error/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-aruna-warning/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-aruna-success/60" />
            <span className="ml-3 rounded-md bg-white px-3 py-1 text-xs text-aruna-textSecondary shadow-sm">
              aruna-fish.app/app/overview
            </span>
          </div>

          <div className="grid gap-0 lg:grid-cols-[220px_1fr]">
            {/* sidebar sliver */}
            <div className="hidden border-r border-aruna-border bg-white p-4 lg:block">
              <div className="mb-6 flex items-center gap-2 text-aruna-primary">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg aruna-gradient text-white">
                  <Fish className="h-4 w-4" />
                </div>
                <span className="font-display text-sm font-bold">Aruna FISH</span>
              </div>
              <div className="space-y-1">
                {["Overview", "Supply Intake", "Factory Energy", "Value Optimization", "Production Plan"].map(
                  (item, i) => (
                    <div
                      key={item}
                      className={`rounded-md px-3 py-2 text-xs font-medium ${
                        i === 0
                          ? "bg-aruna-light1 text-aruna-primary"
                          : "text-aruna-textSecondary"
                      }`}
                    >
                      {item}
                    </div>
                  )
                )}
              </div>
            </div>

            {/* main content */}
            <div className="bg-aruna-bg p-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <KPICard
                  label="Profit Hari Ini"
                  value={formatRupiahJuta(244.2)}
                  icon={TrendingUp}
                  deltaLabel="+12,7%"
                  deltaDirection="up"
                  deltaTone="positive"
                  helperText="vs kemarin"
                />
                <KPICard
                  label="Efisiensi Energi"
                  value={formatPercent(84.3)}
                  icon={Zap}
                  deltaLabel="+3,1%"
                  deltaDirection="up"
                  deltaTone="positive"
                  helperText="rata-rata plant"
                />
                <KPICard
                  label="Utilisasi Kapasitas"
                  value={formatPercent(91.6)}
                  icon={Gauge}
                  deltaLabel="-1,4%"
                  deltaDirection="down"
                  deltaTone="negative"
                  helperText="vs target"
                />
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-3">
                <div className="rounded-xl border border-aruna-border bg-white p-4 lg:col-span-2">
                  <p className="text-sm font-semibold text-aruna-text">Tren Profit Mingguan</p>
                  <p className="text-xs text-aruna-textSecondary">Ilustratif, dalam Rp juta</p>
                  <div className="mt-3 h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dashboardTrend}>
                        <defs>
                          <linearGradient id="homeProfit" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={CHART_COLORS[0]} stopOpacity={0.35} />
                            <stop offset="100%" stopColor={CHART_COLORS[0]} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke={CHART_GRID_COLOR} vertical={false} />
                        <XAxis dataKey="day" tick={{ fontSize: 11, fill: CHART_AXIS_COLOR }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: CHART_AXIS_COLOR }} axisLine={false} tickLine={false} width={30} />
                        <Tooltip {...chartTooltipStyle} />
                        <Area type="monotone" dataKey="profit" stroke={CHART_COLORS[0]} fill="url(#homeProfit)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="rounded-xl border border-aruna-border bg-white p-4">
                  <p className="text-sm font-semibold text-aruna-text">Production Mix</p>
                  <p className="text-xs text-aruna-textSecondary">Rekomendasi optimizer</p>
                  <div className="mt-3 h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={mixPreview} layout="vertical" margin={{ left: 8 }}>
                        <XAxis type="number" hide />
                        <YAxis
                          type="category"
                          dataKey="sku"
                          tick={{ fontSize: 10, fill: CHART_AXIS_COLOR }}
                          axisLine={false}
                          tickLine={false}
                          width={62}
                        />
                        <Tooltip {...chartTooltipStyle} />
                        <Bar dataKey="value" fill={CHART_COLORS[1]} radius={[0, 4, 4, 0]} barSize={14} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-aruna-border bg-white p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-aruna-text">Utilisasi Cold Storage</p>
                  <Badge variant="success">Aman</Badge>
                </div>
                <Progress value={68} className="mt-3" />
                <p className="mt-2 text-xs text-aruna-textSecondary">
                  {formatKg(12920)} dari {formatKg(19000)} kapasitas terpakai
                </p>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* CTA */}
      <section className="container">
        <div className="aruna-gradient overflow-hidden rounded-2xl px-8 py-16 text-center sm:px-16">
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
            Siap Mengubah Data Operasional Menjadi Keputusan yang Lebih Bernilai?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/85">
            Masuk ke Smart Operations Dashboard dan rasakan bagaimana FISH mengoptimalkan setiap
            keputusan produksi Aruna.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="bg-white text-aruna-primary hover:bg-white/90">
              <Link to="/app/overview">
                Masuk ke Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10">
              <Link to="/cara-kerja">Lihat Cara Kerja</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
