import { useMemo, useState } from "react";
import { Calculator, DollarSign, Lightbulb, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input, Label, Select, Slider } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/badge-status";
import { PageHeader } from "@/components/cards/PageHeader";
import { KPICard } from "@/components/cards/KPICard";
import { formatKg, formatPercent, formatRupiah, formatUSD, KURS_USD_IDR } from "@/utils/format";
import { skus, skuByCode } from "@/data/skus";
import { skuEnergyProfiles, ENERGY_TARIFF_RUPIAH_PER_KWH } from "@/data/energy";
import type { SKUCode, PricingRecommendation } from "@/types";

const PROCESSING_COST_PER_KG = 3200; // Rupiah, biaya proses non-energi ilustratif (selaras dengan engine optimizer)

export default function Pricing() {
  const [skuCode, setSkuCode] = useState<SKUCode>(skus[0].code);
  const [buyerPriceUsd, setBuyerPriceUsd] = useState(skus[0].priceUsdPerKg * 0.95);
  const [volumeKg, setVolumeKg] = useState(2000);
  const [energyTariff, setEnergyTariff] = useState(ENERGY_TARIFF_RUPIAH_PER_KWH);
  const [targetMarginPct, setTargetMarginPct] = useState(28);

  const sku = skuByCode(skuCode)!;
  const energy = skuEnergyProfiles.find((e) => e.skuCode === skuCode)!;

  const result: PricingRecommendation = useMemo(() => {
    const energyCostPerKg = energy.totalKwh * energyTariff;
    const costFloorRp = PROCESSING_COST_PER_KG + energyCostPerKg;
    const minimumProfitablePriceUsdCalc = costFloorRp / (1 - 0.08) / KURS_USD_IDR; // margin minimal 8% di atas cost floor
    const targetPriceRp = costFloorRp / (1 - targetMarginPct / 100);
    const targetPriceUsdCalc = targetPriceRp / KURS_USD_IDR;

    const buyerPriceRp = buyerPriceUsd * KURS_USD_IDR;
    const expectedMarginPct = buyerPriceRp > 0 ? ((buyerPriceRp - costFloorRp) / buyerPriceRp) * 100 : 0;
    const incrementalMarginRupiah = (buyerPriceRp - costFloorRp) * volumeKg;

    let recommendation: PricingRecommendation["recommendation"];
    let reason: string;

    const gapVsFloorPct = ((buyerPriceUsd - minimumProfitablePriceUsdCalc) / minimumProfitablePriceUsdCalc) * 100;

    if (buyerPriceUsd >= targetPriceUsdCalc) {
      recommendation = "Terima";
      reason = `Harga buyer ${formatUSD(buyerPriceUsd)}/kg berada ${formatPercent(
        ((buyerPriceUsd - targetPriceUsdCalc) / targetPriceUsdCalc) * 100
      )} di atas target price — margin yang diharapkan (${formatPercent(expectedMarginPct)}) sudah memenuhi target margin ${formatPercent(
        targetMarginPct
      )}.`;
    } else if (buyerPriceUsd >= minimumProfitablePriceUsdCalc * 1.05) {
      recommendation = "Negosiasikan";
      reason = `Harga buyer masih ${formatPercent(
        ((targetPriceUsdCalc - buyerPriceUsd) / targetPriceUsdCalc) * 100
      )} di bawah target price. Negosiasikan naik menuju ${formatUSD(targetPriceUsdCalc)}/kg agar margin mencapai target.`;
    } else if (buyerPriceUsd >= minimumProfitablePriceUsdCalc) {
      recommendation = "Produksi Selektif";
      reason = `Harga buyer hanya ${formatPercent(Math.abs(gapVsFloorPct))} di atas pricing floor — terima hanya bila kapasitas produksi sedang longgar dan tidak menggeser SKU bermargin lebih tinggi.`;
    } else {
      recommendation = "Tolak";
      reason = `Harga buyer saat ini berada ${formatPercent(Math.abs(gapVsFloorPct))} di bawah pricing floor (${formatUSD(
        minimumProfitablePriceUsdCalc
      )}/kg) — memproses pada harga ini akan merugikan setelah memperhitungkan energi dan biaya proses.`;
    }

    return {
      skuCode,
      buyerPriceUsd,
      volumeKg,
      energyTariffRupiah: energyTariff,
      targetMarginPct,
      currentPriceUsd: sku.priceUsdPerKg,
      minimumProfitablePriceUsd: minimumProfitablePriceUsdCalc,
      targetPriceUsd: targetPriceUsdCalc,
      expectedMarginPct,
      incrementalMarginRupiah,
      recommendation,
      reason,
    };
  }, [skuCode, buyerPriceUsd, volumeKg, energyTariff, targetMarginPct, sku, energy]);

  return (
    <div>
      <PageHeader
        title="Pricing Advisor"
        subtitle="Evaluasi tawaran harga buyer terhadap pricing floor dan target margin secara real-time."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-aruna-primary" /> Input Penawaran
              </CardTitle>
              <CardDescription>Masukkan detail penawaran buyer untuk dievaluasi.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label className="mb-1.5 block">SKU</Label>
                <Select
                  value={skuCode}
                  onChange={(e) => {
                    const next = e.target.value as SKUCode;
                    setSkuCode(next);
                    const nextSku = skuByCode(next)!;
                    setBuyerPriceUsd(Number((nextSku.priceUsdPerKg * 0.95).toFixed(2)));
                  }}
                >
                  {skus.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label className="mb-1.5 block">Harga Buyer (USD/kg)</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.05}
                  value={buyerPriceUsd}
                  onChange={(e) => setBuyerPriceUsd(Number(e.target.value) || 0)}
                />
                <p className="mt-1 text-xs text-aruna-textSecondary">Harga acuan SKU saat ini: {formatUSD(sku.priceUsdPerKg)}/kg</p>
              </div>

              <div>
                <Label className="mb-1.5 block">Volume (kg)</Label>
                <Input type="number" min={0} step={50} value={volumeKg} onChange={(e) => setVolumeKg(Number(e.target.value) || 0)} />
              </div>

              <div>
                <Label className="mb-1.5 block">Tarif Energi (Rp/kWh)</Label>
                <Input
                  type="number"
                  min={0}
                  step={1}
                  value={energyTariff}
                  onChange={(e) => setEnergyTariff(Number(e.target.value) || 0)}
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <Label>Target Margin</Label>
                  <span className="text-sm font-semibold text-aruna-primary">{formatPercent(targetMarginPct)}</span>
                </div>
                <Slider min={5} max={60} step={1} value={targetMarginPct} onChange={(e) => setTargetMarginPct(Number(e.target.value))} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-7">
          <Card className="border-aruna-primary/30 bg-gradient-to-r from-aruna-light1 to-white">
            <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl aruna-gradient text-white">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-lg font-bold text-aruna-text">Rekomendasi Pricing</p>
                  <p className="text-sm text-aruna-textSecondary">{sku.name} &middot; {formatKg(volumeKg)}</p>
                </div>
              </div>
              <StatusBadge status={result.recommendation} />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <KPICard label="Harga Saat Ini" value={`${formatUSD(result.currentPriceUsd)}/kg`} icon={DollarSign} />
            <KPICard label="Minimum Profitable Price" value={`${formatUSD(result.minimumProfitablePriceUsd)}/kg`} icon={ArrowRight} />
            <KPICard label="Target Price" value={`${formatUSD(result.targetPriceUsd)}/kg`} icon={ArrowRight} />
            <KPICard
              label="Margin yang Diharapkan"
              value={formatPercent(result.expectedMarginPct)}
              icon={Calculator}
              deltaTone={result.expectedMarginPct >= targetMarginPct ? "positive" : "negative"}
              deltaDirection={result.expectedMarginPct >= targetMarginPct ? "up" : "down"}
              deltaLabel={`target ${formatPercent(targetMarginPct)}`}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Incremental Margin</CardTitle>
              <CardDescription>Total margin tambahan (Rp) dari volume yang ditawarkan pada harga buyer saat ini.</CardDescription>
            </CardHeader>
            <CardContent>
              <p
                className={`font-display text-3xl font-bold ${
                  result.incrementalMarginRupiah >= 0 ? "text-aruna-success" : "text-aruna-error"
                }`}
              >
                {formatRupiah(result.incrementalMarginRupiah)}
              </p>
              <p className="mt-1 text-xs text-aruna-textSecondary">
                = (Harga buyer &minus; pricing floor) &times; volume, dengan pricing floor mencakup biaya proses dan energi.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-aruna-primary" /> Alasan Rekomendasi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-aruna-text">{result.reason}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
