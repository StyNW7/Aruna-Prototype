import { useMemo, useState } from "react";
import {
  Percent,
  Coins,
  TrendingDown,
  RefreshCw,
  ArrowRight,
  Calculator,
} from "lucide-react";
import { PageHeader } from "@/components/cards/PageHeader";
import { KPICard } from "@/components/cards/KPICard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input, Select, Label } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { inventoryItems } from "@/data/inventory";
import { performanceMetrics } from "@/data/performance";
import { formatKg, formatPercent, formatRupiah, formatNumber } from "@/utils/format";

interface ResidualRow {
  sourceBatch: string;
  material: string;
  volumeKg: number;
  alternativeUse: string;
  expectedValueRp: number;
  recommendation: string;
}

const groundMeatPriceRp = 65000; // ~ setara harga Ground Meat SKU dalam Rupiah/kg
const localSalePriceRp = 18000;

const sideProductItems = inventoryItems.filter((i) => i.category === "Side Product");

const sideProductRows: ResidualRow[] = sideProductItems.map((i) => {
  const isPremium = i.productCode === "SIDE-BL";
  return {
    sourceBatch: i.batchId,
    material: i.productName,
    volumeKg: i.weightKg,
    alternativeUse: isPremium ? "Penjualan lokal premium (Toro)" : "Pengolahan by-product / pakan",
    expectedValueRp: i.weightKg * (isPremium ? 45000 : 3200),
    recommendation: isPremium ? "Prioritaskan penjualan lokal segar dalam 2 hari" : "Salurkan ke mitra pengolahan by-product",
  };
});

const excessRows: ResidualRow[] = [
  {
    sourceBatch: "BT-2408-09",
    material: "Trim Fresh Loin 30 UP Grade C (excess alokasi Steak 6 OZ)",
    volumeKg: 340,
    alternativeUse: "Realokasi ke Ground Meat",
    expectedValueRp: 340 * groundMeatPriceRp,
    recommendation: "Proses ke Ground Meat dalam 24 jam sebelum penurunan freshness",
  },
  {
    sourceBatch: "BT-2408-13",
    material: "Fresh Loin 30 UP Grade C excess (melebihi demand Steak)",
    volumeKg: 480,
    alternativeUse: "Alihkan ke line Poke / Cube",
    expectedValueRp: 480 * 32000,
    recommendation: "Realokasi ke Poke sebelum batas usia simpan chiller",
  },
  {
    sourceBatch: "BT-2408-05",
    material: "Fresh Loin 20 UP Grade C excess",
    volumeKg: 210,
    alternativeUse: "Alihkan ke Medallion",
    expectedValueRp: 210 * 24000,
    recommendation: "Jadwalkan di Trimming Station B pada slot berikut",
  },
];

const lossRows: ResidualRow[] = [
  {
    sourceBatch: "BT-2408-12",
    material: "Reject freshness \"Perlu Perhatian\" — tidak layak Finished Goods",
    volumeKg: 150,
    alternativeUse: "Tidak dapat diproses (waste)",
    expectedValueRp: 0,
    recommendation: "Catat sebagai loss, evaluasi rantai dingin dari supplier",
  },
  {
    sourceBatch: "BT-2408-01",
    material: "Trimming loss pada Bandsaw Line 2",
    volumeKg: 95,
    alternativeUse: "Waste",
    expectedValueRp: 0,
    recommendation: "Pantau tren loss mingguan, evaluasi kalibrasi mesin",
  },
];

function ResidualTable({ rows }: { rows: ResidualRow[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Batch Sumber</TableHead>
          <TableHead>Material</TableHead>
          <TableHead>Volume</TableHead>
          <TableHead>Penggunaan Alternatif</TableHead>
          <TableHead>Estimasi Nilai</TableHead>
          <TableHead>Rekomendasi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r, i) => (
          <TableRow key={i}>
            <TableCell className="font-semibold text-aruna-primary">{r.sourceBatch}</TableCell>
            <TableCell className="max-w-[220px] whitespace-normal">{r.material}</TableCell>
            <TableCell>{formatKg(r.volumeKg)}</TableCell>
            <TableCell className="max-w-[180px] whitespace-normal">{r.alternativeUse}</TableCell>
            <TableCell className="font-medium">{r.expectedValueRp > 0 ? formatRupiah(r.expectedValueRp) : "—"}</TableCell>
            <TableCell className="max-w-[220px] whitespace-normal text-xs text-aruna-textSecondary">{r.recommendation}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

const CALC_OPTIONS = [
  { key: "primary", label: "SKU Sekunder (Poke/Medallion)", ratePerKg: 26000 },
  { key: "ground", label: "Ground Meat", ratePerKg: groundMeatPriceRp },
  { key: "local", label: "Penjualan Lokal", ratePerKg: localSalePriceRp },
  { key: "waste", label: "Waste (Tidak Bernilai)", ratePerKg: 0 },
];

export default function Excess() {
  const [calcVolume, setCalcVolume] = useState<number>(500);
  const [calcOption, setCalcOption] = useState(CALC_OPTIONS[1].key);

  const excessRatio = performanceMetrics.find((m) => m.kpi === "Excess Product Ratio");
  const sideProductValue = useMemo(() => sideProductRows.reduce((a, r) => a + r.expectedValueRp, 0), []);
  const lossRatio = 2.1;
  const recoveryRate = 78.4;

  const selectedRate = CALC_OPTIONS.find((o) => o.key === calcOption)?.ratePerKg ?? 0;
  const calculatedValue = Math.max(0, calcVolume) * selectedRate;

  return (
    <div>
      <PageHeader
        title="Excess & Side Product Management"
        subtitle="Kelola alokasi ulang produk berlebih, side product, dan loss agar bahan baku residual tetap memberi nilai maksimal."
        breadcrumbs={[{ label: "FISH Operations", href: "/app/overview" }, { label: "Excess & Side Product" }]}
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard label="Excess Product Ratio" value={formatPercent(excessRatio?.actual ?? 6.3)} icon={TrendingDown} helperText={`Target ${formatPercent(excessRatio?.planned ?? 4)}`} deltaLabel={`+${formatPercent((excessRatio?.variancePct ?? 0), 1)}`} deltaDirection="up" deltaTone="negative" />
        <KPICard label="Nilai Side Product" value={formatRupiah(sideProductValue)} icon={Coins} helperText={`${sideProductItems.length} item aktif`} />
        <KPICard label="Loss Ratio" value={formatPercent(lossRatio)} icon={Percent} helperText="Terhadap total input produksi" />
        <KPICard label="Recovery Rate" value={formatPercent(recoveryRate)} icon={RefreshCw} helperText="Residual terkonversi menjadi nilai" />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Hierarki Rekomendasi Alokasi Residual</CardTitle>
          <CardDescription>Urutan prioritas penyaluran bahan baku residual, dari nilai tertinggi ke terendah.</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { label: "SKU Primer (SAKU / Steak)", variant: "primary" as const },
              { label: "SKU Sekunder (Poke / Medallion)", variant: "default" as const },
              { label: "Ground Meat", variant: "outline" as const },
              { label: "Penjualan Lokal", variant: "warning" as const },
              { label: "Waste", variant: "error" as const },
            ].map((step, i, arr) => (
              <span key={step.label} className="flex items-center gap-2">
                <Badge variant={step.variant} className="px-3 py-1.5 text-xs">{step.label}</Badge>
                {i < arr.length - 1 && <ArrowRight className="h-4 w-4 text-aruna-secondary" />}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <Tabs defaultValue="excess">
          <CardHeader className="pb-0">
            <TabsList>
              <TabsTrigger value="excess">Excess Product</TabsTrigger>
              <TabsTrigger value="side">Side Product</TabsTrigger>
              <TabsTrigger value="loss">Loss</TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent>
            <TabsContent value="excess"><ResidualTable rows={excessRows} /></TabsContent>
            <TabsContent value="side"><ResidualTable rows={sideProductRows} /></TabsContent>
            <TabsContent value="loss"><ResidualTable rows={lossRows} /></TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-4 w-4 text-aruna-primary" />
            Kalkulator Nilai Residual
          </CardTitle>
          <CardDescription>Estimasi nilai residual secara instan berdasarkan volume dan alternatif penggunaan.</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="calcVolume">Volume (kg)</Label>
              <Input
                id="calcVolume"
                type="number"
                min={0}
                value={calcVolume}
                onChange={(e) => setCalcVolume(Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="calcOption">Alternatif Penggunaan</Label>
              <Select id="calcOption" value={calcOption} onChange={(e) => setCalcOption(e.target.value)}>
                {CALC_OPTIONS.map((o) => (
                  <option key={o.key} value={o.key}>{o.label}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Estimasi Nilai</Label>
              <div className="flex h-10 items-center rounded-lg border border-aruna-border bg-aruna-light1/50 px-3">
                <span className="font-display text-sm font-bold text-aruna-primary">{formatRupiah(calculatedValue)}</span>
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs text-aruna-textSecondary">
            Estimasi menggunakan harga acuan Rp{formatNumber(selectedRate)}/kg untuk {CALC_OPTIONS.find((o) => o.key === calcOption)?.label.toLowerCase()}. Nilai bersifat ilustratif untuk kebutuhan prototype.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
