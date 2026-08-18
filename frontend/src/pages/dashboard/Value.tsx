import { useMemo } from "react";
import { ArrowRight, Fish, Layers, Package, Trash2, TrendingUp } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { PageHeader } from "@/components/cards/PageHeader";
import { KPICard } from "@/components/cards/KPICard";
import { ChartCard } from "@/components/charts/ChartCard";
import { CHART_COLORS, chartTooltipStyle } from "@/components/charts/chart-theme";
import { formatKg, formatPercent, formatRupiah, formatUSD, usdToIdr } from "@/utils/format";
import { skus } from "@/data/skus";
import { skuEnergyProfiles } from "@/data/energy";

const WHOLE_FISH_INPUT_KG = 18750;
const WF_TO_LOIN_YIELD_PCT = 59.07;
const LOIN_TO_WIP_YIELD_PCT = 91; // ilustratif — susut trimming/sortasi menuju WIP
const WIP_TO_FG_YIELD_PCT = 82; // ilustratif — rata-rata tertimbang yield WIP -> FG seluruh SKU

const loinKg = WHOLE_FISH_INPUT_KG * (WF_TO_LOIN_YIELD_PCT / 100);
const wipKg = loinKg * (LOIN_TO_WIP_YIELD_PCT / 100);
const fgKg = wipKg * (WIP_TO_FG_YIELD_PCT / 100);
const sideProductKg = Math.round((WHOLE_FISH_INPUT_KG - loinKg) * 0.55);
const lossKg = Math.round(WHOLE_FISH_INPUT_KG - loinKg - sideProductKg + (loinKg - wipKg) + (wipKg - fgKg));

const flowStages = [
  { name: "Whole Fish", kg: WHOLE_FISH_INPUT_KG, icon: Fish },
  { name: "Fresh Loin", kg: Math.round(loinKg), icon: Layers },
  { name: "WIP", kg: Math.round(wipKg), icon: Package },
  { name: "Finished Goods", kg: Math.round(fgKg), icon: TrendingUp },
];

const waterfallData = [
  { name: "Whole Fish", kg: WHOLE_FISH_INPUT_KG },
  { name: "Fresh Loin", kg: Math.round(loinKg) },
  { name: "WIP", kg: Math.round(wipKg) },
  { name: "Finished Goods", kg: Math.round(fgKg) },
  { name: "Loss + Sisa", kg: lossKg },
];

// Struktur biaya ilustratif per SKU (Rp/kg), disusun agar total cost < harga jual sebagai margin wajar.
const COST_STRUCTURE = skus.map((s) => {
  const priceRp = usdToIdr(s.priceUsdPerKg);
  const energy = skuEnergyProfiles.find((e) => e.skuCode === s.code)!;
  const rawMaterial = priceRp * 0.32;
  const jointCost = priceRp * 0.1;
  const processing = priceRp * 0.09;
  const energyCost = energy.energyCostPerKg;
  const packaging = priceRp * 0.05;
  const handling = priceRp * 0.03;
  const totalCost = rawMaterial + jointCost + processing + energyCost + packaging + handling;
  return {
    code: s.code,
    name: s.name,
    priceRp,
    rawMaterial: Math.round(rawMaterial),
    jointCost: Math.round(jointCost),
    processing: Math.round(processing),
    energyCost: Math.round(energyCost),
    packaging: Math.round(packaging),
    handling: Math.round(handling),
    totalCost: Math.round(totalCost),
  };
});

const trueMarginData = skus.map((s) => {
  const cost = COST_STRUCTURE.find((c) => c.code === s.code)!;
  const energy = skuEnergyProfiles.find((e) => e.skuCode === s.code)!;
  const trueMargin = cost.priceRp - cost.totalCost;
  const marginPct = (trueMargin / cost.priceRp) * 100;
  return {
    code: s.code,
    name: s.name,
    priceUsd: s.priceUsdPerKg,
    priceRp: cost.priceRp,
    yieldAdjustedCost: cost.totalCost,
    energyCost: energy.energyCostPerKg,
    trueMargin,
    marginPct,
    profitPerKwh: energy.profitPerKwh,
  };
});

const marginPctValues = trueMarginData.map((d) => d.marginPct).sort((a, b) => a - b);
const medianMarginPct = marginPctValues[Math.floor(marginPctValues.length / 2)];
const profitPerKwhValues = trueMarginData.map((d) => d.profitPerKwh).sort((a, b) => a - b);
const medianProfitPerKwh = profitPerKwhValues[Math.floor(profitPerKwhValues.length / 2)];

const QUADRANTS = [
  { key: "prioritaskan", title: "Prioritaskan", description: "Margin tinggi & efisiensi energi tinggi — skalakan produksi.", tone: "success" as const },
  { key: "harga", title: "Optimalkan Harga", description: "Efisiensi energi tinggi tapi margin rendah — negosiasikan harga jual.", tone: "primary" as const },
  { key: "selektif", title: "Produksi Selektif", description: "Margin tinggi tapi boros energi — produksi saat kapasitas longgar.", tone: "warning" as const },
  { key: "redesign", title: "Redesign atau Kurangi", description: "Margin rendah & boros energi — evaluasi ulang atau kurangi volume.", tone: "error" as const },
];

function quadrantFor(marginPct: number, profitPerKwh: number) {
  const highMargin = marginPct >= medianMarginPct;
  const highEff = profitPerKwh >= medianProfitPerKwh;
  if (highMargin && highEff) return "prioritaskan";
  if (!highMargin && highEff) return "harga";
  if (highMargin && !highEff) return "selektif";
  return "redesign";
}

export default function Value() {
  const flowMax = WHOLE_FISH_INPUT_KG;

  const skuQuadrants = useMemo(
    () =>
      trueMarginData.map((d) => ({
        ...d,
        quadrant: quadrantFor(d.marginPct, d.profitPerKwh),
      })),
    []
  );

  return (
    <div>
      <PageHeader
        title="Integrated Value Optimization"
        subtitle="Lihat nilai produk secara menyeluruh — bukan sekadar harga jual, tapi yield, biaya, dan energi yang membentuk true margin."
        breadcrumbs={[{ label: "FISH Operations", href: "/app/overview" }, { label: "Value Optimization" }]}
      />

      <Tabs defaultValue="yield">
        <TabsList>
          <TabsTrigger value="yield">Yield</TabsTrigger>
          <TabsTrigger value="cost">Cost</TabsTrigger>
          <TabsTrigger value="sku-value">SKU Value</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
        </TabsList>

        {/* YIELD TAB */}
        <TabsContent value="yield">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <KPICard label="Whole Fish Input" value={formatKg(WHOLE_FISH_INPUT_KG)} icon={Fish} />
            <KPICard label="Loin Yield" value={formatPercent(WF_TO_LOIN_YIELD_PCT)} icon={Layers} helperText="dari whole fish" />
            <KPICard label="FG Yield" value={formatPercent((fgKg / WHOLE_FISH_INPUT_KG) * 100)} icon={TrendingUp} helperText="dari whole fish" />
            <KPICard label="Side Product" value={formatKg(sideProductKg)} icon={Package} />
            <KPICard label="Loss" value={formatKg(lossKg)} icon={Trash2} deltaTone="negative" />
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Alur Konversi Whole Fish &rarr; Finished Goods</CardTitle>
              <CardDescription>Volume ilustratif tiap tahap proses, berdasarkan yield rata-rata tertimbang seluruh SKU.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                {flowStages.map((stage, i) => (
                  <div key={stage.name} className="flex flex-1 items-center gap-3">
                    <div className="flex-1 rounded-xl border border-aruna-border bg-aruna-light1/50 p-4 text-center">
                      <stage.icon className="mx-auto h-5 w-5 text-aruna-primary" />
                      <p className="mt-2 text-xs font-medium text-aruna-textSecondary">{stage.name}</p>
                      <p className="mt-1 font-display text-lg font-bold text-aruna-text">{formatKg(stage.kg)}</p>
                    </div>
                    {i < flowStages.length - 1 && (
                      <ArrowRight className="hidden h-5 w-5 shrink-0 text-aruna-textSecondary sm:block" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="mt-6">
            <ChartCard title="Volume Waterfall" description="Reduksi volume dari Whole Fish hingga Finished Goods, ditambah loss dan sisa proses.">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={waterfallData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3EAF0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} domain={[0, flowMax]} label={{ value: "kg", angle: -90, position: "insideLeft", fontSize: 11 }} />
                  <Tooltip {...chartTooltipStyle} formatter={(v: number) => formatKg(v)} />
                  <Bar dataKey="kg" name="Volume (kg)" radius={[4, 4, 0, 0]}>
                    {waterfallData.map((_, i) => (
                      <Cell key={i} fill={i === waterfallData.length - 1 ? "#D8342A" : CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </TabsContent>

        {/* COST TAB */}
        <TabsContent value="cost">
          <ChartCard
            title="Struktur Biaya per SKU"
            description="Komposisi biaya (Rp/kg) yang membentuk total cost sebelum margin — Raw Material, Joint Cost, Processing, Energy, Packaging, Handling."
          >
            <ResponsiveContainer width="100%" height={380}>
              <BarChart data={COST_STRUCTURE} margin={{ top: 8, right: 16, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3EAF0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={70} />
                <YAxis tick={{ fontSize: 11 }} label={{ value: "Rp / kg", angle: -90, position: "insideLeft", fontSize: 11 }} />
                <Tooltip {...chartTooltipStyle} formatter={(v: number) => formatRupiah(v)} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="rawMaterial" stackId="cost" name="Raw Material" fill={CHART_COLORS[0]} />
                <Bar dataKey="jointCost" stackId="cost" name="Joint Cost" fill={CHART_COLORS[1]} />
                <Bar dataKey="processing" stackId="cost" name="Processing" fill={CHART_COLORS[2]} />
                <Bar dataKey="energyCost" stackId="cost" name="Energy" fill={CHART_COLORS[3]} />
                <Bar dataKey="packaging" stackId="cost" name="Packaging" fill={CHART_COLORS[4]} />
                <Bar dataKey="handling" stackId="cost" name="Handling" fill={CHART_COLORS[5]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Rincian Biaya vs Harga Jual</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Raw Material</TableHead>
                    <TableHead>Joint Cost</TableHead>
                    <TableHead>Processing</TableHead>
                    <TableHead>Energy</TableHead>
                    <TableHead>Packaging</TableHead>
                    <TableHead>Handling</TableHead>
                    <TableHead>Total Cost</TableHead>
                    <TableHead>Harga Jual</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {COST_STRUCTURE.map((c) => (
                    <TableRow key={c.code}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>{formatRupiah(c.rawMaterial)}</TableCell>
                      <TableCell>{formatRupiah(c.jointCost)}</TableCell>
                      <TableCell>{formatRupiah(c.processing)}</TableCell>
                      <TableCell>{formatRupiah(c.energyCost)}</TableCell>
                      <TableCell>{formatRupiah(c.packaging)}</TableCell>
                      <TableCell>{formatRupiah(c.handling)}</TableCell>
                      <TableCell className="font-semibold">{formatRupiah(c.totalCost)}</TableCell>
                      <TableCell className="font-semibold text-aruna-primary">{formatRupiah(c.priceRp)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SKU VALUE TAB */}
        <TabsContent value="sku-value">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-aruna-primary" /> True Margin Analysis
              </CardTitle>
              <CardDescription>
                Margin sesungguhnya setelah memperhitungkan yield-adjusted cost dan biaya energi — bukan sekadar selisih harga jual.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Harga (USD)</TableHead>
                    <TableHead>Harga (Rp)</TableHead>
                    <TableHead>Yield-Adjusted Cost</TableHead>
                    <TableHead>Energy Cost</TableHead>
                    <TableHead>True Margin</TableHead>
                    <TableHead>Margin %</TableHead>
                    <TableHead>Profit/kWh</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trueMarginData
                    .slice()
                    .sort((a, b) => b.trueMargin - a.trueMargin)
                    .map((d) => (
                      <TableRow key={d.code}>
                        <TableCell className="font-medium">{d.name}</TableCell>
                        <TableCell>{formatUSD(d.priceUsd)}</TableCell>
                        <TableCell>{formatRupiah(d.priceRp)}</TableCell>
                        <TableCell>{formatRupiah(d.yieldAdjustedCost)}</TableCell>
                        <TableCell>{formatRupiah(d.energyCost)}</TableCell>
                        <TableCell className="font-semibold text-aruna-success">{formatRupiah(d.trueMargin)}</TableCell>
                        <TableCell>{formatPercent(d.marginPct)}</TableCell>
                        <TableCell>{formatRupiah(d.profitPerKwh)}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PORTFOLIO TAB */}
        <TabsContent value="portfolio">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Matrix — Margin % vs Efisiensi Energi</CardTitle>
              <CardDescription>
                Setiap SKU diklasifikasikan berdasarkan margin % (sumbu horizontal, median split) dan profit per kWh (sumbu vertikal, median split).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {QUADRANTS.map((q) => {
                  const members = skuQuadrants.filter((s) => s.quadrant === q.key);
                  return (
                    <div key={q.key} className="rounded-xl border border-aruna-border p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="font-display text-sm font-bold text-aruna-text">{q.title}</p>
                        <Badge variant={q.tone}>{members.length} SKU</Badge>
                      </div>
                      <p className="mb-3 text-xs text-aruna-textSecondary">{q.description}</p>
                      <div className="space-y-1.5">
                        {members.map((m) => (
                          <div key={m.code} className="flex items-center justify-between rounded-lg bg-aruna-light1/60 px-3 py-1.5 text-xs">
                            <span className="font-medium text-aruna-text">{m.name}</span>
                            <span className="text-aruna-textSecondary">
                              {formatPercent(m.marginPct)} · {formatRupiah(m.profitPerKwh)}/kWh
                            </span>
                          </div>
                        ))}
                        {members.length === 0 && <p className="text-xs italic text-aruna-textSecondary">Tidak ada SKU di kuadran ini.</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
