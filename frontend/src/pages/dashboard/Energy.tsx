import { useMemo, useState } from "react";
import { Zap, Flame, Gauge, TrendingUp, Award, Calculator, AlertTriangle } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { PageHeader } from "@/components/cards/PageHeader";
import { KPICard } from "@/components/cards/KPICard";
import { ChartCard } from "@/components/charts/ChartCard";
import { CHART_COLORS, chartTooltipStyle } from "@/components/charts/chart-theme";
import { formatKg, formatKwh, formatPercent, formatRupiah, formatNumber } from "@/utils/format";
import { skuByCode } from "@/data/skus";
import { energyProcesses, totalEnergyKwh, totalEnergyCostRupiah, skuEnergyProfiles, ENERGY_TARIFF_RUPIAH_PER_KWH } from "@/data/energy";

const FG_OUTPUT_KG = 10980; // volume finished goods ilustratif (mengacu pada volume proses Freezing/Packaging)

export default function Energy() {
  const [calcRuntime, setCalcRuntime] = useState(12);
  const [calcPower, setCalcPower] = useState(9.6);
  const [calcVolume, setCalcVolume] = useState(5000);
  const [calcTariff, setCalcTariff] = useState(ENERGY_TARIFF_RUPIAH_PER_KWH);

  const calcKwh = calcRuntime * calcPower;
  const calcCost = calcKwh * calcTariff;
  const calcKwhPerKg = calcVolume > 0 ? calcKwh / calcVolume : 0;

  const kwhPerKgFg = totalEnergyKwh / FG_OUTPUT_KG;

  const bestProfitPerKwh = useMemo(
    () => [...skuEnergyProfiles].sort((a, b) => b.profitPerKwh - a.profitPerKwh)[0],
    []
  );
  const highestEnergySku = useMemo(
    () => [...skuEnergyProfiles].sort((a, b) => b.totalKwh - a.totalKwh)[0],
    []
  );
  const ranking = useMemo(
    () => [...skuEnergyProfiles].sort((a, b) => b.profitPerKwh - a.profitPerKwh),
    []
  );

  const freezingProcess = energyProcesses.find((p) => p.name === "Freezing");
  const freezingSharePct = freezingProcess ? (freezingProcess.kwh / totalEnergyKwh) * 100 : 0;

  const processChartData = [...energyProcesses]
    .sort((a, b) => b.kwh - a.kwh)
    .map((p) => ({ name: p.name, kwh: p.kwh, cost: p.costRupiah }));

  return (
    <div>
      <PageHeader
        title="Factory Energy Intelligence"
        subtitle="Petakan konsumsi energi dari proses hingga SKU untuk mengetahui energy intensity dan true energy cost."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <KPICard label="Total Energi" value={formatKwh(totalEnergyKwh)} icon={Zap} helperText="per batch produksi" />
        <KPICard label="Biaya Energi" value={formatRupiah(totalEnergyCostRupiah)} icon={Calculator} helperText="per batch produksi" />
        <KPICard label="kWh / kg FG" value={formatNumber(kwhPerKgFg, 3)} icon={Gauge} helperText={`atas ${formatKg(FG_OUTPUT_KG)} output`} />
        <KPICard
          label="Profit / kWh Tertinggi"
          value={formatRupiah(bestProfitPerKwh.profitPerKwh)}
          icon={TrendingUp}
          helperText={skuByCode(bestProfitPerKwh.skuCode)?.name}
        />
        <KPICard
          label="SKU Paling Boros Energi"
          value={skuByCode(highestEnergySku.skuCode)?.name ?? highestEnergySku.skuCode}
          icon={Flame}
          helperText={`${formatKwh(highestEnergySku.totalKwh)}/kg`}
        />
      </div>

      <div className="mt-4 flex items-start gap-3 rounded-xl border border-aruna-warning/30 bg-aruna-warningBg px-4 py-3 text-sm text-aruna-warning">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          <span className="font-semibold">Energy Alert:</span> Proses <span className="font-semibold">Freezing</span> menyumbang{" "}
          {formatPercent(freezingSharePct)} dari total energi batch ini — proses dengan kontribusi energi terbesar di seluruh lini produksi.
        </span>
      </div>

      <div className="mt-6">
        <ChartCard title="Energy Process Map" description="Konsumsi energi (kWh) per tahapan proses, diurutkan dari yang terbesar.">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={processChartData} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E3EAF0" />
              <XAxis type="number" tick={{ fontSize: 11 }} label={{ value: "kWh", position: "insideBottom", offset: -4, fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={110} />
              <Tooltip {...chartTooltipStyle} formatter={(v: number) => `${formatNumber(v, 1)} kWh`} />
              <Bar dataKey="kwh" name="Konsumsi Energi (kWh)" radius={[0, 4, 4, 0]}>
                {processChartData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Detail Proses Energi</CardTitle>
          <CardDescription>Power, runtime, volume, konsumsi, dan biaya untuk seluruh 7 tahapan proses.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proses</TableHead>
                <TableHead>Power (kW)</TableHead>
                <TableHead>Runtime (jam)</TableHead>
                <TableHead>Volume (kg)</TableHead>
                <TableHead>Energi (kWh)</TableHead>
                <TableHead>Biaya (Rp)</TableHead>
                <TableHead>Share</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {energyProcesses.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{formatNumber(p.powerKw, 1)}</TableCell>
                  <TableCell>{formatNumber(p.runtimeHours, 1)}</TableCell>
                  <TableCell>{formatKg(p.volumeKg)}</TableCell>
                  <TableCell>{formatKwh(p.kwh)}</TableCell>
                  <TableCell>{formatRupiah(p.costRupiah)}</TableCell>
                  <TableCell>{formatPercent(p.sharePct)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>SKU Energy Profile</CardTitle>
          <CardDescription>Konsumsi energi per tahap proses dan biaya energi untuk setiap SKU finished goods.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Cutting</TableHead>
                <TableHead>Trimming</TableHead>
                <TableHead>Freezing</TableHead>
                <TableHead>Storage</TableHead>
                <TableHead>Total kWh</TableHead>
                <TableHead>kWh/kg</TableHead>
                <TableHead>Energy Cost/kg</TableHead>
                <TableHead>Profit/kWh</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {skuEnergyProfiles.map((e) => (
                <TableRow key={e.skuCode}>
                  <TableCell className="font-medium">{skuByCode(e.skuCode)?.name ?? e.skuCode}</TableCell>
                  <TableCell>{formatKwh(e.cuttingKwh)}</TableCell>
                  <TableCell>{formatKwh(e.trimmingKwh)}</TableCell>
                  <TableCell>{formatKwh(e.freezingKwh)}</TableCell>
                  <TableCell>{formatKwh(e.storageKwh)}</TableCell>
                  <TableCell>{formatKwh(e.totalKwh)}</TableCell>
                  <TableCell>{formatNumber(e.kwhPerKg, 2)}</TableCell>
                  <TableCell>{formatRupiah(e.energyCostPerKg)}</TableCell>
                  <TableCell>{formatRupiah(e.profitPerKwh)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-4 w-4 text-aruna-primary" /> Energy Efficiency Ranking
            </CardTitle>
            <CardDescription>SKU diurutkan berdasarkan profit per kWh — makin tinggi, makin efisien secara energi.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {ranking.map((e, i) => {
                const sku = skuByCode(e.skuCode);
                const isTop3 = i < 3;
                return (
                  <div
                    key={e.skuCode}
                    className={`flex items-center justify-between rounded-lg border px-3.5 py-2.5 ${
                      isTop3 ? "border-aruna-primary/30 bg-aruna-light1" : "border-aruna-border"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                          isTop3 ? "aruna-gradient text-white" : "bg-slate-100 text-aruna-textSecondary"
                        }`}
                      >
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-aruna-text">{sku?.name ?? e.skuCode}</p>
                        <p className="text-xs text-aruna-textSecondary">{formatKwh(e.kwhPerKg)}/kg</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-aruna-text">{formatRupiah(e.profitPerKwh)}</p>
                      <p className="text-xs text-aruna-textSecondary">per kWh</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-aruna-primary" /> Energy Cost Calculator
            </CardTitle>
            <CardDescription>Hitung cepat biaya energi untuk skenario proses tertentu.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="mb-1.5 block text-xs">Runtime (jam)</Label>
              <Input type="number" min={0} step={0.5} value={calcRuntime} onChange={(e) => setCalcRuntime(Number(e.target.value) || 0)} />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs">Power (kW)</Label>
              <Input type="number" min={0} step={0.1} value={calcPower} onChange={(e) => setCalcPower(Number(e.target.value) || 0)} />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs">Volume Output (kg)</Label>
              <Input type="number" min={1} step={10} value={calcVolume} onChange={(e) => setCalcVolume(Number(e.target.value) || 0)} />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs">Tarif Energi (Rp/kWh)</Label>
              <Input type="number" min={0} step={1} value={calcTariff} onChange={(e) => setCalcTariff(Number(e.target.value) || 0)} />
            </div>
            <div className="space-y-2 rounded-lg bg-aruna-light1 p-3.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-aruna-textSecondary">Total kWh</span>
                <span className="font-semibold text-aruna-text">{formatKwh(calcKwh)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-aruna-textSecondary">Biaya Energi</span>
                <span className="font-semibold text-aruna-text">{formatRupiah(calcCost)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-aruna-textSecondary">kWh / kg</span>
                <span className="font-semibold text-aruna-text">{formatNumber(calcKwhPerKg, 3)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
