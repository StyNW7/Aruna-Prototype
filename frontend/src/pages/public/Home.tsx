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
import { formatKg, formatPercent, formatRupiahJuta, formatNumber } from "@/utils/format";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { CountUp } from "@/components/motion/CountUp";
import { SectionHeading } from "@/components/public/SectionHeading";
import { navGroups } from "@/components/layout/nav-config";

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

// Seluruh modul dashboard, ditampilkan sebagai ticker berjalan di bawah hero
const moduleTicker = navGroups.flatMap((g) => g.items).filter((i) => !["/app/settings", "/app/help"].includes(i.href));

const impactMetrics = [
  { value: 18.4, suffix: "%", label: "Efisiensi energi per kg output", decimals: 1 },
  { value: 12.7, suffix: "%", label: "Uplift profit dari production mix", decimals: 1 },
  { value: 5.4, suffix: "%", label: "Reduksi excess & side product", decimals: 1 },
  { value: 19, suffix: "", label: "Modul operasional terintegrasi", decimals: 0 },
];

export default function Home() {
  return (
    <div className="pb-24">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-aruna-border mesh-hero">
        <div className="pointer-events-none absolute inset-0 dot-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
        <div className="pointer-events-none absolute -right-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-aruna-medium/25 blur-3xl animate-float-slow" />
        <div className="pointer-events-none absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-aruna-light2/80 blur-3xl animate-float" />

        <div className="container relative grid gap-14 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-28">
          <Reveal immediate>
            <Badge variant="primary" className="mb-5 shadow-sm">
              <Fish className="h-3.5 w-3.5" />
              FISH Framework — PT Aruna Jaya Nuswantara
            </Badge>
            <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight text-aruna-text sm:text-5xl lg:text-[56px]">
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
              <Button asChild size="lg" variant="outline" className="bg-white/80 backdrop-blur">
                <Link to="/app/overview">
                  <LayoutDashboard className="h-4 w-4 text-aruna-primary" />
                  Masuk ke Dashboard
                </Link>
              </Button>
            </div>
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-aruna-border/80 pt-6">
              <div>
                <dd className="font-display text-2xl font-bold text-aruna-text">
                  <CountUp value={53899} format={(n) => formatNumber(n)} />
                  <span className="text-base font-semibold text-aruna-textSecondary"> kg</span>
                </dd>
                <dt className="mt-0.5 text-xs text-aruna-textSecondary">total supply historis</dt>
              </div>
              <div>
                <dd className="font-display text-2xl font-bold text-aruna-text">
                  <CountUp value={59.07} format={(n) => formatPercent(n, 2)} />
                </dd>
                <dt className="mt-0.5 text-xs text-aruna-textSecondary">yield rata-rata Loin</dt>
              </div>
              <div>
                <dd className="font-display text-2xl font-bold text-aruna-text">4 pilar</dd>
                <dt className="mt-0.5 text-xs text-aruna-textSecondary">framework FISH</dt>
              </div>
            </dl>
          </Reveal>

          {/* Value flow visual */}
          <Reveal immediate delay={0.12} from="left" className="relative">
            <div className="pointer-events-none absolute -inset-4 rounded-[28px] bg-gradient-to-br from-aruna-primary/10 via-transparent to-aruna-medium/20 blur-2xl" />
            <Card className="relative overflow-hidden p-6 shadow-elevated">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-aruna-textSecondary">
                  Alur Optimalisasi Nilai
                </p>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-aruna-successBg px-2 py-0.5 text-[11px] font-semibold text-aruna-success">
                  <span className="live-dot h-1.5 w-1.5 rounded-full bg-aruna-success" />
                  Live
                </span>
              </div>
              <div className="mt-4 flex flex-col gap-3">
                {[
                  { label: "Whole Fish / WGG", sub: "Bahan baku masuk", icon: Fish, tone: "bg-aruna-light1 text-aruna-primary" },
                  { label: "Fresh Loin", sub: "Yield ~59,07%", icon: Layers, tone: "bg-aruna-light1 text-aruna-primary" },
                  { label: "Optimizer FISH", sub: "Alokasi nilai tertinggi", icon: Sparkles, tone: "aruna-gradient text-white" },
                  { label: "SKU Finished Goods", sub: "SAKU · Steak · Poke · dst", icon: Boxes, tone: "bg-aruna-successBg text-aruna-success" },
                ].map((step, i) => (
                  <div key={step.label} className="flex items-center gap-3">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${step.tone}`}>
                      <step.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 rounded-lg border border-aruna-border bg-aruna-bg px-3 py-2">
                      <p className="text-sm font-semibold text-aruna-text">{step.label}</p>
                      <p className="text-xs text-aruna-textSecondary">{step.sub}</p>
                    </div>
                    {i < 3 && <ArrowRight className="hidden h-4 w-4 shrink-0 text-aruna-textSecondary sm:block" />}
                  </div>
                ))}
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-aruna-border bg-aruna-light1 p-3">
                  <div className="flex items-center gap-1.5 text-aruna-primary">
                    <Zap className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">Efisiensi Energi</span>
                  </div>
                  <p className="mt-1 font-display text-lg font-bold text-aruna-text">{formatPercent(18.4)}</p>
                </div>
                <div className="rounded-lg border border-aruna-border bg-aruna-light1 p-3">
                  <div className="flex items-center gap-1.5 text-aruna-primary">
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">Uplift Profit</span>
                  </div>
                  <p className="mt-1 font-display text-lg font-bold text-aruna-text">{formatPercent(12.7)}</p>
                </div>
              </div>
            </Card>
          </Reveal>
        </div>

        {/* Wave divider */}
        <svg className="pointer-events-none relative -mb-px block h-10 w-full text-white/70 sm:h-14" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true">
          <path fill="currentColor" d="M0,48 C240,88 480,8 720,40 C960,72 1200,24 1440,48 L1440,80 L0,80 Z" />
          <path fill="currentColor" opacity="0.5" d="M0,60 C260,24 520,84 780,52 C1040,20 1240,64 1440,36 L1440,80 L0,80 Z" />
        </svg>

        {/* Module ticker */}
        <div className="marquee relative border-t border-aruna-border/70 bg-white/70 py-3 backdrop-blur">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-white to-transparent" />
          <div className="marquee-track gap-3">
            {[...moduleTicker, ...moduleTicker].map((m, i) => (
              <Link
                key={`${m.href}-${i}`}
                to={m.href}
                className="inline-flex items-center gap-2 rounded-full border border-aruna-border bg-white px-3.5 py-1.5 text-xs font-medium text-aruna-text transition-colors hover:border-aruna-medium hover:text-aruna-primary"
              >
                <m.icon className="h-3.5 w-3.5 text-aruna-primary" />
                {m.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CHALLENGES */}
      <section className="container py-20">
        <SectionHeading
          eyebrow="Tantangan Saat Ini"
          title="Empat Celah yang Menahan Nilai Produksi"
          description="Sebelum FISH, keputusan operasional Aruna berjalan di atas data yang terpisah dan kurang terukur."
        />
        <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {challenges.map((c, i) => (
            <StaggerItem key={c.title} className="h-full">
              <Card interactive className="h-full p-6">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-aruna-errorBg text-aruna-error">
                    <c.icon className="h-5 w-5" />
                  </div>
                  <span className="font-display text-xs font-semibold text-aruna-textSecondary/60">0{i + 1}</span>
                </div>
                <h3 className="mt-4 font-display text-base font-semibold text-aruna-text">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-aruna-textSecondary">{c.description}</p>
              </Card>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* FISH FRAMEWORK */}
      <section className="relative overflow-hidden border-y border-aruna-border bg-white py-20">
        <div className="pointer-events-none absolute inset-0 dot-grid opacity-30 [mask-image:linear-gradient(to_bottom,transparent,black_30%,black_70%,transparent)]" />
        <div className="container relative">
          <SectionHeading
            eyebrow="Solusi"
            title="Framework FISH"
            description="Empat pilar yang bekerja bersama mengubah PO-Driven Production menjadi Resource-Driven Value Optimization."
          />

          <Stagger className="mt-14 grid gap-4 lg:grid-cols-4">
            {fishPillars.map((p, i) => (
              <StaggerItem key={p.letter} className="relative h-full">
                <Card interactive className="group h-full p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl aruna-gradient font-display text-xl font-bold text-white shadow-glow transition-transform group-hover:scale-105">
                      {p.letter}
                    </div>
                    <Badge variant="outline">{p.tagline}</Badge>
                  </div>
                  <h3 className="mt-4 font-display text-base font-semibold text-aruna-text">{p.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-aruna-textSecondary">{p.description}</p>
                  <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-aruna-primary opacity-0 transition-opacity group-hover:opacity-100">
                    <p.icon className="h-3.5 w-3.5" />
                    Pilar {i + 1} dari 4
                  </div>
                </Card>
                {i < fishPillars.length - 1 && (
                  <div className="absolute right-[-1.1rem] top-1/2 z-10 hidden -translate-y-1/2 lg:block">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-aruna-border bg-white text-aruna-secondary shadow-sm">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                )}
              </StaggerItem>
            ))}
          </Stagger>

          <Reveal className="mt-10 flex justify-center">
            <Button asChild variant="secondary">
              <Link to="/fish-framework">
                Lihat detail framework
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </Reveal>
        </div>
      </section>

      {/* IMPACT BAND */}
      <section className="container py-20">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl bg-aruna-gradient-dark p-8 text-white shadow-elevated sm:p-12">
            <div className="pointer-events-none absolute inset-0 line-grid-light opacity-60" />
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="relative grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/70">Dampak Terukur</p>
                <h2 className="mt-3 font-display text-3xl font-bold leading-tight">
                  Angka yang berubah ketika keputusan mengikuti supply, bukan sebaliknya.
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-white/80">
                  Estimasi ilustratif berdasarkan simulasi resource-driven pada data supply historis Hub Bungus.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {impactMetrics.map((m) => (
                  <div key={m.label} className="rounded-xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
                    <p className="font-display text-3xl font-bold sm:text-4xl">
                      <CountUp value={m.value} format={(n) => formatNumber(n, m.decimals)} />
                      {m.suffix}
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-white/75">{m.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* TRANSFORMATION */}
      <section className="container pb-20">
        <SectionHeading
          eyebrow="Transformasi Operasional"
          title="PO-Driven Production → Resource-Driven Value Optimization"
        />
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <Reveal from="right">
            <Card className="h-full border-aruna-border p-7">
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
          </Reveal>
          <Reveal from="left" delay={0.08}>
            <Card className="gradient-border h-full bg-aruna-light1/40 p-7">
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
          </Reveal>
        </div>
      </section>

      {/* CAPABILITIES */}
      <section className="border-y border-aruna-border bg-white py-20">
        <div className="container">
          <SectionHeading eyebrow="Kapabilitas Utama" title="Satu Sistem, Sepuluh Kapabilitas Operasional" />
          <Stagger gap={0.05} className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {capabilities.map((c) => (
              <StaggerItem key={c.title} className="h-full">
                <Card interactive className="group h-full p-5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-aruna-light1 text-aruna-primary transition-colors group-hover:bg-aruna-gradient group-hover:text-white">
                    <c.icon className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-aruna-text">{c.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-aruna-textSecondary">{c.desc}</p>
                </Card>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* DASHBOARD PREVIEW */}
      <section className="container py-20">
        <SectionHeading
          eyebrow="Smart Operations Dashboard"
          title="Lihat Sekilas Dashboard yang Akan Anda Gunakan"
          description="KPI, rekomendasi, dan monitoring operasional dalam satu tampilan yang terpadu."
        />

        <Reveal delay={0.1} distance={28} className="relative mx-auto mt-12 max-w-6xl">
          <div className="pointer-events-none absolute -inset-6 rounded-[32px] bg-gradient-to-b from-aruna-light2/70 to-transparent blur-2xl" />
          <Card className="relative overflow-hidden p-0 shadow-elevated">
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
              <div className="hidden bg-aruna-dark p-4 lg:block">
                <div className="mb-6 flex items-center gap-2 text-white">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg aruna-gradient text-white">
                    <Fish className="h-4 w-4" />
                  </div>
                  <span className="font-display text-sm font-bold">Aruna FISH</span>
                </div>
                <div className="space-y-1">
                  {["Overview", "Supply Intake", "Factory Energy", "Value Optimization", "Production Plan"].map((item, i) => (
                    <div
                      key={item}
                      className={`rounded-md px-3 py-2 text-xs font-medium ${
                        i === 0 ? "bg-white/10 text-white" : "text-white/60"
                      }`}
                    >
                      {item}
                    </div>
                  ))}
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
                    sparkline={[182, 196, 174, 214, 231, 219, 244]}
                  />
                  <KPICard
                    label="Efisiensi Energi"
                    value={formatPercent(84.3)}
                    icon={Zap}
                    deltaLabel="+3,1%"
                    deltaDirection="up"
                    deltaTone="positive"
                    helperText="rata-rata plant"
                    accent="success"
                    sparkline={[79, 80, 81, 80, 82, 83, 84.3]}
                  />
                  <KPICard
                    label="Utilisasi Kapasitas"
                    value={formatPercent(91.6)}
                    icon={Gauge}
                    deltaLabel="-1,4%"
                    deltaDirection="down"
                    deltaTone="negative"
                    helperText="vs target"
                    accent="warning"
                    sparkline={[94, 93, 93.5, 92, 92.4, 91.9, 91.6]}
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
        </Reveal>
      </section>

      {/* CTA */}
      <section className="container">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl aruna-gradient px-8 py-16 text-center shadow-elevated sm:px-16">
            <div className="pointer-events-none absolute inset-0 dot-grid-light opacity-70" />
            <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -right-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="relative">
              <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
                Siap Mengubah Data Operasional Menjadi Keputusan yang Lebih Bernilai?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-white/85">
                Masuk ke Smart Operations Dashboard dan rasakan bagaimana FISH mengoptimalkan setiap
                keputusan produksi Aruna.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Button asChild size="lg" className="bg-white text-aruna-primary shadow-lg hover:bg-white/90 hover:shadow-xl">
                  <Link to="/app/overview">
                    Masuk ke Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white/40 bg-transparent text-white hover:border-white hover:bg-white/10">
                  <Link to="/cara-kerja">Lihat Cara Kerja</Link>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
