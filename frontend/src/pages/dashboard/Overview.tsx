import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Ship,
  Package,
  TrendingUp,
  DollarSign,
  Zap,
  AlertOctagon,
  Snowflake,
  Warehouse,
  Container,
  Target,
  AlertTriangle,
  Clock,
  TrendingDown,
  PlusCircle,
  Calculator,
  ClipboardList,
  SlidersHorizontal,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  ComposedChart,
  Line,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { KPICard } from "@/components/cards/KPICard";
import { ChartCard } from "@/components/charts/ChartCard";
import { CHART_COLORS, CHART_WARNING, chartTooltipStyle } from "@/components/charts/chart-theme";
import { formatKg, formatPercent, formatRupiahJuta, formatKwh, formatNumber } from "@/utils/format";
import { supplyBatches } from "@/data/supply";
import { skus } from "@/data/skus";
import { currentUser } from "@/data/roles";

const sizeGradeData = ["14 UP", "20 UP", "30 UP"].map((grade) => ({
  grade,
  weightKg: supplyBatches.filter((b) => b.sizeGrade === grade).reduce((a, b) => a + b.totalWeightKg, 0),
}));

const qualityGradeData = ["Grade B", "Grade C"].map((grade) => ({
  name: grade,
  value: supplyBatches.filter((b) => b.qualityGrade === grade).reduce((a, b) => a + b.totalWeightKg, 0),
}));

const categoryOrder = ["SAKU", "Steak", "Poke", "Medallion", "Ground Meat"] as const;
const productMixPct: Record<string, number> = {
  SAKU: 22,
  Steak: 38,
  Poke: 14,
  Medallion: 16,
  "Ground Meat": 10,
};
const productMixData = categoryOrder.map((cat) => ({
  name: cat,
  value: productMixPct[cat],
  skuCount: skus.filter((s) => s.category === cat).length,
}));

const profitEnergyData = [
  { period: "Minggu 1", marginRp: 512, kwhPerKg: 0.081 },
  { period: "Minggu 2", marginRp: 538, kwhPerKg: 0.079 },
  { period: "Minggu 3", marginRp: 549, kwhPerKg: 0.076 },
  { period: "Minggu 4", marginRp: 574, kwhPerKg: 0.077 },
];

const alerts = [
  { icon: Warehouse, tone: "warning" as const, text: "Kapasitas freezer mencapai 87% — pertimbangkan percepatan shipment terjadwal." },
  { icon: Target, tone: "primary" as const, text: "Demand SAKU 16 OZ telah 92% terpenuhi dari target periode ini." },
  { icon: TrendingDown, tone: "error" as const, text: "Margin produk Poke / Cube berada di bawah target — tinjau alokasi input." },
  { icon: Clock, tone: "warning" as const, text: "Batch BT-2408-12 (14 UP, Grade C) mendekati batas umur stok, prioritaskan proses." },
];

const alertToneClass: Record<string, string> = {
  warning: "bg-aruna-warningBg text-aruna-warning",
  primary: "bg-aruna-light1 text-aruna-primary",
  error: "bg-aruna-errorBg text-aruna-error",
};

const quickActions = [
  { label: "Tambah Supply", href: "/app/supply", icon: PlusCircle },
  { label: "Jalankan Optimizer", href: "/app/optimizer", icon: Calculator },
  { label: "Buat Production Plan", href: "/app/production", icon: ClipboardList },
  { label: "Jalankan Simulasi", href: "/app/scenario", icon: SlidersHorizontal },
];

const statusMetrics = [
  { label: "Utilisasi Freezer", value: 87, icon: Snowflake, variant: "warning" as const },
  { label: "Kapasitas Cold Storage", value: 64, icon: Warehouse, variant: "default" as const },
  { label: "Utilisasi Container", value: 93.9, icon: Container, variant: "success" as const },
  { label: "Pemenuhan Demand", value: 78, icon: Target, variant: "default" as const },
];

function greetingByHour(): string {
  const h = new Date().getHours();
  if (h < 11) return "Pagi";
  if (h < 15) return "Siang";
  if (h < 18) return "Sore";
  return "Malam";
}

export default function Overview() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 550);
    return () => clearTimeout(t);
  }, []);

  return (
    <div>
      {/* Hero greeting header */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-aruna-border aruna-gradient p-6 text-white shadow-card sm:p-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-white/80">{currentUser.plant}</p>
            <h1 className="mt-1 font-display text-2xl font-bold sm:text-[28px]">
              Selamat {greetingByHour()}, {currentUser.role}
            </h1>
            <p className="mt-1.5 max-w-xl text-sm text-white/85">
              Berikut kondisi operasional Hub Bungus hari ini. Data mencerminkan supply masuk, kapasitas, dan
              rekomendasi alokasi produksi resource-driven.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button asChild variant="secondary" size="default" className="bg-white text-aruna-primary hover:bg-white/90">
              <Link to="/app/optimizer">
                <Calculator className="h-4 w-4" />
                Jalankan Optimizer
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* KPI grid */}
      {loading ? (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <KPICard
            label="Incoming Supply"
            value={formatKg(18750)}
            icon={Ship}
            deltaLabel="+8,4% dari periode sebelumnya"
            deltaDirection="up"
            deltaTone="positive"
          />
          <KPICard
            label="Expected Finished Goods"
            value={formatKg(10980)}
            icon={Package}
            deltaLabel="+5,1% dari periode sebelumnya"
            deltaDirection="up"
            deltaTone="positive"
          />
          <KPICard
            label="Average Yield"
            value={formatPercent(59.1)}
            icon={TrendingUp}
            helperText="Loin ke finished goods"
          />
          <KPICard
            label="Expected Margin"
            value={formatRupiahJuta(574)}
            icon={DollarSign}
            deltaLabel="+2,3% dari periode sebelumnya"
            deltaDirection="up"
            deltaTone="positive"
          />
          <KPICard
            label="Energy Intensity"
            value={formatKwh(0.077)}
            icon={Zap}
            helperText="per kg finished goods"
          />
          <KPICard
            label="Excess Product Ratio"
            value={formatPercent(6.3)}
            icon={AlertOctagon}
            deltaLabel="+1,2pp dari target"
            deltaDirection="up"
            deltaTone="negative"
          />
        </div>
      )}

      {/* Status cards row */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statusMetrics.map((m) => (
          <Card key={m.label} className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-aruna-textSecondary">{m.label}</p>
              <m.icon className="h-4 w-4 text-aruna-primary" />
            </div>
            <p className="mt-2 font-display text-xl font-bold text-aruna-text">{formatPercent(m.value)}</p>
            <Progress value={m.value} variant={m.variant} className="mt-3" />
          </Card>
        ))}
      </div>

      {/* Charts grid */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Supply by Size Grade" description="Distribusi berat supply berdasarkan grade ukuran">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sizeGradeData} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E3EAF0" vertical={false} />
                <XAxis dataKey="grade" tick={{ fontSize: 12, fill: "#64748B" }} axisLine={{ stroke: "#E3EAF0" }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} tickFormatter={(v) => formatNumber(v)} />
                <Tooltip {...chartTooltipStyle} formatter={(v: number) => formatKg(v)} />
                <Bar dataKey="weightKg" name="Berat (kg)" radius={[6, 6, 0, 0]} fill={CHART_COLORS[0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Supply by Quality Grade" description="Proporsi Grade B vs Grade C dari total supply">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={qualityGradeData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={2}
                >
                  {qualityGradeData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...chartTooltipStyle} formatter={(v: number) => formatKg(v)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Product Mix Recommendation" description="Alokasi output finished goods yang direkomendasikan optimizer">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={productMixData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={2}>
                  {productMixData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...chartTooltipStyle} formatter={(v: number) => formatPercent(v)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Profit vs Energy" description="Margin produksi dibanding intensitas energi per periode">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={profitEnergyData} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E3EAF0" vertical={false} />
                <XAxis dataKey="period" tick={{ fontSize: 12, fill: "#64748B" }} axisLine={{ stroke: "#E3EAF0" }} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
                <Tooltip {...chartTooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar yAxisId="left" dataKey="marginRp" name="Margin (Rp juta)" fill={CHART_COLORS[1]} radius={[6, 6, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="kwhPerKg" name="Energi (kWh/kg)" stroke={CHART_WARNING} strokeWidth={2.5} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Alerts + quick actions */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-aruna-warning" />
              Peringatan Terkini
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {alerts.map((a, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border border-aruna-border p-3">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${alertToneClass[a.tone]}`}>
                  <a.icon className="h-4 w-4" />
                </div>
                <p className="text-sm text-aruna-text">{a.text}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-2.5 pt-0">
            {quickActions.map((qa) => (
              <Button key={qa.label} asChild variant="outline" className="justify-start">
                <Link to={qa.href}>
                  <qa.icon className="h-4 w-4 text-aruna-primary" />
                  {qa.label}
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
