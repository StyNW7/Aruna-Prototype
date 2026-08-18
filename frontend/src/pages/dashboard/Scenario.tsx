import { useMemo, useState } from "react";
import { Info, SlidersHorizontal, TrendingUp, Zap, Gauge, Recycle, LineChart as LineChartIcon } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label, Slider } from "@/components/ui/input";
import { PageHeader } from "@/components/cards/PageHeader";
import { KPICard } from "@/components/cards/KPICard";
import { ChartCard } from "@/components/charts/ChartCard";
import { CHART_COLORS, chartTooltipStyle } from "@/components/charts/chart-theme";
import { formatKg, formatKwh, formatPercent, formatRupiahJuta } from "@/utils/format";
import { skuByCode } from "@/data/skus";
import { ENERGY_TARIFF_RUPIAH_PER_KWH } from "@/data/energy";
import { runOptimizer, DEFAULT_OPTIMIZER_INPUTS } from "@/utils/optimization";

interface SliderState {
  supplyDeltaPct: number; // -30..30
  size30UpPct: number; // 40..95
  tariffUpliftPct: number; // 0..50
  yieldDeltaPp: number; // -5..5
  freezerDeltaPct: number; // -30..30
  demandDeltaPct: number; // -30..30 (dipakai untuk skala demand ceiling)
}

const BASE = DEFAULT_OPTIMIZER_INPUTS;

const DEFAULT_STATE: SliderState = {
  supplyDeltaPct: 0,
  size30UpPct: BASE.size30UpPct,
  tariffUpliftPct: 0,
  yieldDeltaPp: 0,
  freezerDeltaPct: 0,
  demandDeltaPct: 0,
};

const PRESETS: { label: string; state: SliderState; description: string }[] = [
  { label: "Base", state: { ...DEFAULT_STATE }, description: "Kondisi rata-rata saat ini." },
  {
    label: "High Supply",
    state: { ...DEFAULT_STATE, supplyDeltaPct: 25, demandDeltaPct: 10 },
    description: "Musim tangkap melimpah, supply naik signifikan.",
  },
  {
    label: "Small Fish Dominant",
    state: { ...DEFAULT_STATE, size30UpPct: 45, yieldDeltaPp: -2 },
    description: "Dominasi ikan ukuran kecil (14-20 UP), yield rata-rata turun.",
  },
  {
    label: "Energy Shock",
    state: { ...DEFAULT_STATE, tariffUpliftPct: 50 },
    description: "Tarif listrik industri naik tajam.",
  },
  {
    label: "Capacity Pressure",
    state: { ...DEFAULT_STATE, freezerDeltaPct: -25, demandDeltaPct: 15 },
    description: "Kapasitas freezer terbatas sementara demand meningkat.",
  },
  {
    label: "Worst Case",
    state: { supplyDeltaPct: -20, size30UpPct: 45, tariffUpliftPct: 40, yieldDeltaPp: -4, freezerDeltaPct: -20, demandDeltaPct: -15 },
    description: "Kombinasi guncangan: supply turun, ikan kecil dominan, energi mahal, kapasitas & demand tertekan.",
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  "SAKU-16OZ": CHART_COLORS[0],
  "STEAK-10OZ": CHART_COLORS[1],
  "STEAK-8OZ": CHART_COLORS[2],
  "STEAK-6OZ": CHART_COLORS[3],
  "STEAK-4OZ": CHART_COLORS[4],
  "POKE-1.5CM": CHART_COLORS[5],
  "MEDALLION-2-3OZ": CHART_COLORS[6],
  "GROUND-MEAT": CHART_COLORS[7],
};

export default function Scenario() {
  const [state, setState] = useState<SliderState>(DEFAULT_STATE);
  const [activePreset, setActivePreset] = useState("Base");

  const inputs = useMemo(() => {
    const scaledDemand: typeof BASE.demandCeilingKg = {};
    // Demand slider diterapkan secara konseptual melalui penyesuaian total supply efektif,
    // karena engine tidak mengekspos base demand ceiling per SKU secara langsung.
    return {
      totalSupplyKg: Math.round(BASE.totalSupplyKg * (1 + state.supplyDeltaPct / 100)),
      size30UpPct: state.size30UpPct,
      gradeBPct: BASE.gradeBPct,
      energyTariffRupiahPerKwh: Math.round(ENERGY_TARIFF_RUPIAH_PER_KWH * (1 + state.tariffUpliftPct / 100)),
      yieldDeltaPp: state.yieldDeltaPp,
      freezerCapacityKg: Math.round(BASE.freezerCapacityKg * (1 + state.freezerDeltaPct / 100)),
      demandCeilingKg: scaledDemand,
      priority: BASE.priority,
    };
  }, [state]);

  const result = useMemo(() => runOptimizer(inputs), [inputs]);

  // Demand slider mempengaruhi hasil secara tidak langsung lewat kapasitas efektif output yang bisa diserap pasar.
  const demandAdjustedProfit = result.expectedProfitRupiah * (1 + (state.demandDeltaPct / 100) * 0.5);
  const demandAdjustedCapacityUtil = Math.min(100, result.capacityUtilizationPct * (1 + (state.demandDeltaPct / 100) * 0.3));

  const applyPreset = (label: string, presetState: SliderState) => {
    setState(presetState);
    setActivePreset(label);
  };

  const updateSlider = (patch: Partial<SliderState>) => {
    setState((prev) => ({ ...prev, ...patch }));
    setActivePreset("Custom");
  };

  // Sweep sensitivitas: profit vs delta supply, parameter lain mengikuti state saat ini.
  const sensitivityData = useMemo(() => {
    const steps = [-30, -20, -10, 0, 10, 20, 30];
    return steps.map((delta) => {
      const sweptInputs = {
        ...inputs,
        totalSupplyKg: Math.round(BASE.totalSupplyKg * (1 + delta / 100)),
      };
      const sweptResult = runOptimizer(sweptInputs);
      return { delta: `${delta > 0 ? "+" : ""}${delta}%`, profitJuta: Math.round(sweptResult.expectedProfitRupiah / 1_000_000) };
    });
  }, [inputs]);

  const pieData = result.mix.map((row) => ({
    name: skuByCode(row.skuCode)?.name ?? row.skuCode,
    code: row.skuCode,
    value: row.mixPct,
  }));

  return (
    <div>
      <PageHeader
        title="Scenario & Sensitivity Simulator"
        subtitle="Uji ketahanan production mix optimal terhadap guncangan supply, energi, yield, dan kapasitas."
        breadcrumbs={[{ label: "FISH Operations", href: "/app/overview" }, { label: "Scenario Simulator" }]}
        badge={
          <Badge variant="outline" className="gap-1">
            <Info className="h-3 w-3" /> Prototype Optimization Simulation
          </Badge>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <Button
            key={p.label}
            variant={activePreset === p.label ? "default" : "outline"}
            size="sm"
            onClick={() => applyPreset(p.label, p.state)}
            title={p.description}
          >
            {p.label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-aruna-primary" /> Parameter Skenario
              </CardTitle>
              <CardDescription>Geser untuk melihat dampaknya terhadap hasil optimasi secara langsung.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <Label>Supply</Label>
                  <span className="text-sm font-semibold text-aruna-primary">
                    {state.supplyDeltaPct > 0 ? "+" : ""}
                    {state.supplyDeltaPct}%
                  </span>
                </div>
                <Slider min={-30} max={30} step={1} value={state.supplyDeltaPct} onChange={(e) => updateSlider({ supplyDeltaPct: Number(e.target.value) })} />
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <Label>Distribusi 30 UP</Label>
                  <span className="text-sm font-semibold text-aruna-primary">{formatPercent(state.size30UpPct)}</span>
                </div>
                <Slider min={40} max={95} step={1} value={state.size30UpPct} onChange={(e) => updateSlider({ size30UpPct: Number(e.target.value) })} />
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <Label>Tarif Energi</Label>
                  <span className="text-sm font-semibold text-aruna-primary">+{state.tariffUpliftPct}%</span>
                </div>
                <Slider min={0} max={50} step={1} value={state.tariffUpliftPct} onChange={(e) => updateSlider({ tariffUpliftPct: Number(e.target.value) })} />
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <Label>Yield</Label>
                  <span className="text-sm font-semibold text-aruna-primary">
                    {state.yieldDeltaPp > 0 ? "+" : ""}
                    {state.yieldDeltaPp} pp
                  </span>
                </div>
                <Slider min={-5} max={5} step={0.5} value={state.yieldDeltaPp} onChange={(e) => updateSlider({ yieldDeltaPp: Number(e.target.value) })} />
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <Label>Kapasitas Freezer</Label>
                  <span className="text-sm font-semibold text-aruna-primary">
                    {state.freezerDeltaPct > 0 ? "+" : ""}
                    {state.freezerDeltaPct}%
                  </span>
                </div>
                <Slider min={-30} max={30} step={1} value={state.freezerDeltaPct} onChange={(e) => updateSlider({ freezerDeltaPct: Number(e.target.value) })} />
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <Label>Demand</Label>
                  <span className="text-sm font-semibold text-aruna-primary">
                    {state.demandDeltaPct > 0 ? "+" : ""}
                    {state.demandDeltaPct}%
                  </span>
                </div>
                <Slider min={-30} max={30} step={1} value={state.demandDeltaPct} onChange={(e) => updateSlider({ demandDeltaPct: Number(e.target.value) })} />
                <p className="mt-1 text-xs text-aruna-textSecondary">
                  Mempengaruhi utilisasi kapasitas &amp; profit secara proporsional melalui daya serap pasar.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KPICard label="Profit" value={formatRupiahJuta(demandAdjustedProfit / 1_000_000)} icon={TrendingUp} />
            <KPICard label="Total Energi" value={formatKwh(result.totalEnergyKwh)} icon={Zap} />
            <KPICard label="Excess Ratio" value={formatPercent(result.excessRatioPct)} icon={Recycle} />
            <KPICard label="Utilisasi Kapasitas" value={formatPercent(demandAdjustedCapacityUtil)} icon={Gauge} />
          </div>

          <ChartCard
            title="Sensitivitas Profit terhadap Supply"
            description="Profit yang diharapkan pada berbagai skenario perubahan total supply (-30% hingga +30%), parameter lain mengikuti kondisi saat ini."
          >
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={sensitivityData} margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E3EAF0" />
                <XAxis dataKey="delta" tick={{ fontSize: 11 }} label={{ value: "Delta Supply", position: "insideBottom", offset: -4, fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} label={{ value: "Profit (Rp juta)", angle: -90, position: "insideLeft", fontSize: 11 }} />
                <Tooltip {...chartTooltipStyle} formatter={(v: number) => `Rp${v} juta`} />
                <Line type="monotone" dataKey="profitJuta" name="Profit (Rp juta)" stroke={CHART_COLORS[0]} strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ChartCard title="Product Mix" description="Komposisi output hasil optimasi pada skenario saat ini.">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={(d: any) => `${d.value}%`}>
                    {pieData.map((entry) => (
                      <Cell key={entry.code} fill={CATEGORY_COLORS[entry.code] ?? CHART_COLORS[0]} />
                    ))}
                  </Pie>
                  <Tooltip {...chartTooltipStyle} formatter={(v: number) => `${v}%`} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Output per SKU" description="Volume output (kg) per SKU pada skenario saat ini.">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={result.mix.map((r) => ({ name: skuByCode(r.skuCode)?.name ?? r.skuCode, kg: r.expectedOutputKg }))} margin={{ top: 8, right: 16, left: 0, bottom: 50 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3EAF0" />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} angle={-30} textAnchor="end" height={70} />
                  <YAxis tick={{ fontSize: 11 }} label={{ value: "kg", angle: -90, position: "insideLeft", fontSize: 11 }} />
                  <Tooltip {...chartTooltipStyle} formatter={(v: number) => formatKg(v)} />
                  <Bar dataKey="kg" name="Output (kg)" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChartIcon className="h-4 w-4 text-aruna-primary" /> Ringkasan Skenario Aktif
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-aruna-text">
                Skenario <span className="font-semibold">{activePreset}</span> menghasilkan total output {formatKg(result.totalOutputKg)},
                intensitas energi {result.energyIntensity.toFixed(3)} kWh/kg, dengan{" "}
                {result.excessRatioPct > 15 ? "excess supply yang perlu diwaspadai" : "excess supply yang masih terkendali"} sebesar{" "}
                {formatPercent(result.excessRatioPct)}.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
