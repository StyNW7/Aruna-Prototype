import { useMemo, useState } from "react";
import {
  Sparkles,
  Sliders,
  Package,
  Zap,
  Snowflake,
  Target,
  PlayCircle,
  TrendingUp,
  Gauge,
  Recycle,
  Container,
  Lightbulb,
  Info,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Label, Slider } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { PageHeader } from "@/components/cards/PageHeader";
import { KPICard } from "@/components/cards/KPICard";
import { ChartCard } from "@/components/charts/ChartCard";
import { CHART_COLORS, chartTooltipStyle } from "@/components/charts/chart-theme";
import {
  formatKg,
  formatPercent,
  formatRupiahJuta,
  formatKwh,
  formatRupiah,
} from "@/utils/format";
import { skus, skuByCode } from "@/data/skus";
import { ENERGY_TARIFF_RUPIAH_PER_KWH } from "@/data/energy";
import {
  runOptimizer,
  DEFAULT_OPTIMIZER_INPUTS,
  type OptimizerInputs,
  type OptimizationPriority,
} from "@/utils/optimization";
import type { SKUCode } from "@/types";

const PRIORITIES: OptimizationPriority[] = ["Maksimalkan Profit", "Efisiensi Energi", "Balanced Optimization"];

const PRIORITY_DESCRIPTIONS: Record<OptimizationPriority, string> = {
  "Maksimalkan Profit": "Menimbang margin per kg tertinggi tanpa mempertimbangkan intensitas energi.",
  "Efisiensi Energi": "Menimbang margin relatif terhadap konsumsi energi (Rp margin per kWh).",
  "Balanced Optimization": "Kombinasi tertimbang antara profitabilitas dan efisiensi energi (60:40).",
};

// Mix ilustratif hari ini — pola PO-driven yang cenderung menumpuk pada beberapa SKU favorit buyer.
const CURRENT_MIX_PCT: Record<SKUCode, number> = {
  "SAKU-16OZ": 8,
  "STEAK-10OZ": 4,
  "STEAK-8OZ": 42,
  "STEAK-6OZ": 20,
  "STEAK-4OZ": 4,
  "POKE-1.5CM": 8,
  "MEDALLION-2-3OZ": 8,
  "GROUND-MEAT": 6,
};

const SHIPMENT_CAPACITY_KG = 19000;

const SIZE_RANK: Record<string, number> = { "14 UP": 0, "20 UP": 1, "30 UP": 2 };
const GRADE_RANK: Record<string, number> = { "Grade C": 0, "Grade B": 1 };

const CATEGORY_ORDER = ["SAKU", "Steak", "Poke", "Medallion", "Ground Meat"] as const;

interface SupplySegment {
  label: string;
  size: "14 UP" | "20 UP" | "30 UP";
  grade: "Grade B" | "Grade C";
  weightKg: number;
}

function buildSupplySegments(totalSupplyKg: number, size30UpPct: number, gradeBPct: number): SupplySegment[] {
  const total30Up = totalSupplyKg * (size30UpPct / 100);
  const remaining = totalSupplyKg - total30Up;
  const total20Up = remaining * 0.55;
  const total14Up = remaining * 0.45;
  const grade30UpB = total30Up * (gradeBPct / 100);
  const grade30UpC = total30Up - grade30UpB;

  return [
    { label: "30 UP Grade B", size: "30 UP", grade: "Grade B", weightKg: grade30UpB },
    { label: "30 UP Grade C", size: "30 UP", grade: "Grade C", weightKg: grade30UpC },
    { label: "20 UP Grade C", size: "20 UP", grade: "Grade C", weightKg: total20Up },
    { label: "14 UP Grade C", size: "14 UP", grade: "Grade C", weightKg: total14Up },
  ];
}

function isEligible(segment: SupplySegment, minSize: string, minGrade: string): boolean {
  return SIZE_RANK[segment.size] >= SIZE_RANK[minSize] && GRADE_RANK[segment.grade] >= GRADE_RANK[minGrade];
}

export default function Optimizer() {
  const [totalSupplyKg, setTotalSupplyKg] = useState(DEFAULT_OPTIMIZER_INPUTS.totalSupplyKg);
  const [size30UpPct, setSize30UpPct] = useState(DEFAULT_OPTIMIZER_INPUTS.size30UpPct);
  const [gradeBPct, setGradeBPct] = useState(DEFAULT_OPTIMIZER_INPUTS.gradeBPct);
  const [freezerCapacityKg, setFreezerCapacityKg] = useState(DEFAULT_OPTIMIZER_INPUTS.freezerCapacityKg);
  const [energyTariff, setEnergyTariff] = useState(ENERGY_TARIFF_RUPIAH_PER_KWH);
  const [priority, setPriority] = useState<OptimizationPriority>(DEFAULT_OPTIMIZER_INPUTS.priority);
  const [demandOverrides, setDemandOverrides] = useState<Partial<Record<SKUCode, number>>>({});
  const [isCalculating, setIsCalculating] = useState(false);

  const inputs: OptimizerInputs = useMemo(
    () => ({
      totalSupplyKg,
      size30UpPct,
      gradeBPct,
      energyTariffRupiahPerKwh: energyTariff,
      yieldDeltaPp: 0,
      freezerCapacityKg,
      demandCeilingKg: demandOverrides,
      priority,
    }),
    [totalSupplyKg, size30UpPct, gradeBPct, energyTariff, freezerCapacityKg, demandOverrides, priority]
  );

  const result = useMemo(() => runOptimizer(inputs), [inputs]);

  const handleRun = () => {
    setIsCalculating(true);
    window.setTimeout(() => setIsCalculating(false), 500);
  };

  // Baseline "hari ini" ilustratif — mencerminkan pola produksi PO-driven yang kurang optimal.
  const profitBaselineFactor = priority === "Maksimalkan Profit" ? 0.8 : priority === "Balanced Optimization" ? 0.83 : 0.86;
  const energyBaselineFactor = priority === "Efisiensi Energi" ? 1.22 : priority === "Balanced Optimization" ? 1.14 : 1.08;
  const baselineExcessRatioPct = 23.5;

  const baselineProfit = result.expectedProfitRupiah * profitBaselineFactor;
  const profitUpliftPct = baselineProfit > 0 ? ((result.expectedProfitRupiah - baselineProfit) / baselineProfit) * 100 : 0;
  const baselineEnergyIntensity = result.energyIntensity * energyBaselineFactor;
  const energyEfficiencyImprovementPct =
    baselineEnergyIntensity > 0 ? (1 - result.energyIntensity / baselineEnergyIntensity) * 100 : 0;
  const excessReductionPct = Math.max(0, baselineExcessRatioPct - result.excessRatioPct);

  const chartData = skus.map((s) => ({
    name: s.name,
    saatIni: CURRENT_MIX_PCT[s.code],
    rekomendasi: result.mix.find((r) => r.skuCode === s.code)?.mixPct ?? 0,
  }));

  const supplySegments = useMemo(
    () => buildSupplySegments(totalSupplyKg, size30UpPct, gradeBPct),
    [totalSupplyKg, size30UpPct, gradeBPct]
  );

  const categoryOutputKg = useMemo(() => {
    const map: Record<string, number> = {};
    for (const cat of CATEGORY_ORDER) map[cat] = 0;
    for (const row of result.mix) {
      const sku = skuByCode(row.skuCode);
      if (sku) map[sku.category] += row.expectedOutputKg;
    }
    return map;
  }, [result.mix]);

  const allocationMatrix = useMemo(() => {
    return supplySegments.map((segment) => {
      const eligibleCategories = CATEGORY_ORDER.filter((cat) =>
        skus.some((s) => s.category === cat && isEligible(segment, s.minSizeGrade, s.minQualityGrade))
      );
      const totalWeight = eligibleCategories.reduce((a, c) => a + Math.max(categoryOutputKg[c], 1), 0);
      const cells = CATEGORY_ORDER.map((cat) => {
        if (!eligibleCategories.includes(cat)) return { category: cat, kg: 0, eligible: false };
        const weight = Math.max(categoryOutputKg[cat], 1) / totalWeight;
        return { category: cat, kg: Math.round(segment.weightKg * weight), eligible: true };
      });
      return { segment, cells };
    });
  }, [supplySegments, categoryOutputKg]);

  const reasoning = useMemo(() => {
    const byOutput = [...result.mix].sort((a, b) => b.expectedOutputKg - a.expectedOutputKg);
    const byMargin = [...result.mix].sort((a, b) => b.marginRupiah - a.marginRupiah);
    const topOutput = byOutput[0];
    const topMargin = byMargin[0];
    const topOutputSku = skuByCode(topOutput.skuCode);
    const topMarginSku = skuByCode(topMargin.skuCode);

    const lines: string[] = [];
    if (topOutputSku) {
      lines.push(
        `${topOutputSku.name} mendapat alokasi input terbesar (${formatKg(topOutput.recommendedInputKg)}, ${formatPercent(
          topOutput.mixPct
        )} dari total output) karena kombinasi yield ${formatPercent(topOutput.yieldPct)} dan margin per kg memberikan kontribusi nilai tertinggi terhadap komposisi supply saat ini.`
      );
    }
    if (topMarginSku && topMarginSku.code !== topOutputSku?.code) {
      lines.push(
        `${topMarginSku.name} mencatat margin absolut tertinggi (${formatRupiahJuta(topMargin.marginRupiah / 1_000_000)}) sehingga tetap diprioritaskan meski volumenya lebih kecil dari SKU dengan output terbesar.`
      );
    }
    if (priority === "Efisiensi Energi") {
      lines.push(
        `Mode "Efisiensi Energi" menggeser bobot alokasi ke SKU dengan margin per kWh tertinggi, menekan intensitas energi keseluruhan menjadi ${result.energyIntensity.toFixed(3)} kWh/kg output.`
      );
    } else if (priority === "Maksimalkan Profit") {
      lines.push(
        `Mode "Maksimalkan Profit" mengutamakan margin per kg tanpa penalti energi, sehingga total profit yang diharapkan mencapai ${formatRupiahJuta(result.expectedProfitRupiah / 1_000_000)}.`
      );
    } else {
      lines.push(
        `Mode "Balanced Optimization" menyeimbangkan profitabilitas dan efisiensi energi (bobot 60:40) agar hasil tetap kompetitif di kedua dimensi.`
      );
    }
    lines.push(
      `Utilisasi kapasitas freezer berada di ${formatPercent(result.capacityUtilizationPct)} dari ${formatKg(
        freezerCapacityKg
      )} kapasitas yang tersedia, dengan sisa supply tidak teralokasikan sebesar ${formatPercent(result.excessRatioPct)} — jauh lebih rendah dibanding pola produksi PO-driven saat ini.`
    );
    return lines;
  }, [result, priority, freezerCapacityKg]);

  return (
    <div>
      <PageHeader
        title="Optimal Production Mix"
        subtitle="Temukan kombinasi finished goods terbaik berdasarkan supply, yield, profitability, energy, demand, capacity, dan quality."
        badge={
          <Badge variant="outline" className="gap-1">
            <Info className="h-3 w-3" /> Prototype Optimization Simulation
          </Badge>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Input Panel */}
        <div className="lg:col-span-4">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-aruna-primary" /> Parameter Input
              </CardTitle>
              <CardDescription>Sesuaikan parameter untuk melihat rekomendasi mix berubah secara langsung.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Supply */}
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-aruna-textSecondary">Supply</p>
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <Label>Total Raw Material</Label>
                    <span className="text-sm font-semibold text-aruna-primary">{formatKg(totalSupplyKg)}</span>
                  </div>
                  <Slider
                    min={5000}
                    max={30000}
                    step={100}
                    value={totalSupplyKg}
                    onChange={(e) => setTotalSupplyKg(Number(e.target.value))}
                  />
                </div>
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <Label>Distribusi Ukuran 30 UP</Label>
                    <span className="text-sm font-semibold text-aruna-primary">{formatPercent(size30UpPct)}</span>
                  </div>
                  <Slider
                    min={0}
                    max={100}
                    step={1}
                    value={size30UpPct}
                    onChange={(e) => setSize30UpPct(Number(e.target.value))}
                  />
                </div>
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <Label>Distribusi Grade B (dalam 30 UP)</Label>
                    <span className="text-sm font-semibold text-aruna-primary">{formatPercent(gradeBPct)}</span>
                  </div>
                  <Slider
                    min={0}
                    max={100}
                    step={1}
                    value={gradeBPct}
                    onChange={(e) => setGradeBPct(Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Demand */}
              <div className="space-y-3 border-t border-aruna-border pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-aruna-textSecondary">Demand Ceiling (kg, opsional)</p>
                <div className="grid grid-cols-2 gap-2">
                  {skus.map((s) => (
                    <div key={s.code}>
                      <Label className="mb-1 block text-xs font-normal text-aruna-textSecondary">{s.name}</Label>
                      <Input
                        type="number"
                        min={0}
                        placeholder="Otomatis"
                        className="h-8 text-xs"
                        value={demandOverrides[s.code] ?? ""}
                        onChange={(e) => {
                          const val = e.target.value === "" ? undefined : Number(e.target.value);
                          setDemandOverrides((prev) => ({ ...prev, [s.code]: val }));
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Capacity */}
              <div className="space-y-3 border-t border-aruna-border pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-aruna-textSecondary">Capacity</p>
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <Label className="flex items-center gap-1.5">
                      <Snowflake className="h-3.5 w-3.5" /> Kapasitas Freezer
                    </Label>
                    <span className="text-sm font-semibold text-aruna-primary">{formatKg(freezerCapacityKg)}</span>
                  </div>
                  <Slider
                    min={4000}
                    max={20000}
                    step={100}
                    value={freezerCapacityKg}
                    onChange={(e) => setFreezerCapacityKg(Number(e.target.value))}
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg bg-aruna-light1 px-3 py-2 text-xs text-aruna-textSecondary">
                  <span className="flex items-center gap-1.5">
                    <Container className="h-3.5 w-3.5" /> Kapasitas Shipment
                  </span>
                  <span className="font-semibold text-aruna-text">{formatKg(SHIPMENT_CAPACITY_KG)} (tetap)</span>
                </div>
              </div>

              {/* Financial */}
              <div className="space-y-3 border-t border-aruna-border pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-aruna-textSecondary">Financial</p>
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <Label className="flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5" /> Tarif Energi (Rp/kWh)
                    </Label>
                    <span className="text-sm font-semibold text-aruna-primary">{formatRupiah(energyTariff)}</span>
                  </div>
                  <Slider
                    min={800}
                    max={2500}
                    step={10}
                    value={energyTariff}
                    onChange={(e) => setEnergyTariff(Number(e.target.value))}
                  />
                </div>
                <div className="max-h-36 space-y-1 overflow-y-auto rounded-lg border border-aruna-border p-2 text-xs">
                  {skus.map((s) => (
                    <div key={s.code} className="flex items-center justify-between text-aruna-textSecondary">
                      <span>{s.name}</span>
                      <span className="font-medium text-aruna-text">US${s.priceUsdPerKg.toFixed(2)}/kg</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Priority */}
              <div className="space-y-2 border-t border-aruna-border pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-aruna-textSecondary">Optimization Priority</p>
                <div className="space-y-2">
                  {PRIORITIES.map((p) => (
                    <label
                      key={p}
                      className={`flex cursor-pointer items-start gap-2 rounded-lg border p-2.5 text-sm transition-colors ${
                        priority === p ? "border-aruna-primary bg-aruna-light1" : "border-aruna-border hover:bg-aruna-light1/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="priority"
                        className="mt-0.5 accent-aruna-primary"
                        checked={priority === p}
                        onChange={() => setPriority(p)}
                      />
                      <span>
                        <span className="block font-medium text-aruna-text">{p}</span>
                        <span className="block text-xs text-aruna-textSecondary">{PRIORITY_DESCRIPTIONS[p]}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <Button className="w-full gap-2" size="lg" onClick={handleRun} disabled={isCalculating}>
                <PlayCircle className="h-4 w-4" />
                {isCalculating ? "Menghitung..." : "Jalankan Optimasi"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="space-y-6 lg:col-span-8">
          <Card className="border-aruna-primary/30 bg-gradient-to-r from-aruna-light1 to-white">
            <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl aruna-gradient text-white">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-lg font-bold text-aruna-text">Production Mix Optimal Ditemukan</p>
                  <p className="text-sm text-aruna-textSecondary">
                    Prioritas: <span className="font-medium text-aruna-text">{priority}</span> · Total output{" "}
                    {formatKg(result.totalOutputKg)}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="gap-1 self-start sm:self-center">
                <Info className="h-3 w-3" /> Prototype Optimization Simulation
              </Badge>
            </CardContent>
          </Card>

          {/* Impact KPI cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KPICard
              label="Profit Uplift"
              value={formatPercent(profitUpliftPct)}
              icon={TrendingUp}
              deltaLabel="vs pola PO-driven"
              deltaDirection="up"
              deltaTone="positive"
            />
            <KPICard
              label="Efisiensi Energi"
              value={formatPercent(energyEfficiencyImprovementPct)}
              icon={Zap}
              deltaLabel="penurunan kWh/kg"
              deltaDirection="up"
              deltaTone="positive"
            />
            <KPICard
              label="Reduksi Excess"
              value={formatPercent(excessReductionPct)}
              icon={Recycle}
              deltaLabel="supply tak teralokasi"
              deltaDirection="up"
              deltaTone="positive"
            />
            <KPICard
              label="Utilisasi Kapasitas"
              value={formatPercent(result.capacityUtilizationPct)}
              icon={Gauge}
              helperText={`dari ${formatKg(freezerCapacityKg)} freezer`}
            />
          </div>

          <ChartCard
            title="Current Mix vs Recommended Mix"
            description="Perbandingan komposisi produk hari ini (pola PO-driven) dengan rekomendasi optimizer (% dari total output)."
          >
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3EAF0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11 }} label={{ value: "% Mix", angle: -90, position: "insideLeft", fontSize: 11 }} />
                <Tooltip {...chartTooltipStyle} formatter={(v: number) => `${v}%`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="saatIni" name="Saat Ini (PO-driven)" fill={CHART_COLORS[2]} radius={[4, 4, 0, 0]} />
                <Bar dataKey="rekomendasi" name="Rekomendasi Optimizer" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-4 w-4 text-aruna-primary" /> Rekomendasi Mix Produksi
              </CardTitle>
              <CardDescription>Alokasi input, output, margin, dan energi per SKU hasil optimasi.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Input (kg)</TableHead>
                    <TableHead>Output (kg)</TableHead>
                    <TableHead>% Mix</TableHead>
                    <TableHead>Yield</TableHead>
                    <TableHead>Margin (Rp)</TableHead>
                    <TableHead>Energi (kWh)</TableHead>
                    <TableHead>Demand Fulfillment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.mix.map((row) => {
                    const sku = skuByCode(row.skuCode);
                    return (
                      <TableRow key={row.skuCode}>
                        <TableCell className="font-medium">{sku?.name ?? row.skuCode}</TableCell>
                        <TableCell>{formatKg(row.recommendedInputKg)}</TableCell>
                        <TableCell>{formatKg(row.expectedOutputKg)}</TableCell>
                        <TableCell>{formatPercent(row.mixPct)}</TableCell>
                        <TableCell>{formatPercent(row.yieldPct)}</TableCell>
                        <TableCell>{formatRupiah(row.marginRupiah)}</TableCell>
                        <TableCell>{formatKwh(row.energyKwh)}</TableCell>
                        <TableCell>{formatPercent(row.demandFulfillmentPct)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-4 w-4 text-aruna-primary" /> Allocation Matrix
              </CardTitle>
              <CardDescription>
                Distribusi ilustratif segmen supply ke kategori produk, berbasis eligibility ukuran &amp; grade minimum tiap SKU.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Segmen Supply</TableHead>
                    {CATEGORY_ORDER.map((cat) => (
                      <TableHead key={cat}>{cat}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allocationMatrix.map(({ segment, cells }) => (
                    <TableRow key={segment.label}>
                      <TableCell className="font-medium">{segment.label}</TableCell>
                      {cells.map((cell) => (
                        <TableCell key={cell.category} className={!cell.eligible ? "text-aruna-textSecondary/50" : ""}>
                          {cell.eligible ? formatKg(cell.kg) : "—"}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-aruna-primary" /> Recommendation Reason
              </CardTitle>
              <CardDescription>Mengapa optimizer merekomendasikan komposisi ini.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2.5">
                {reasoning.map((line, i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-aruna-text">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aruna-primary" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
