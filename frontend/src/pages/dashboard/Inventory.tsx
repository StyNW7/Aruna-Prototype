import { useMemo, useState } from "react";
import { Boxes, PackageCheck, PackageOpen, AlertTriangle, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/cards/PageHeader";
import { KPICard } from "@/components/cards/KPICard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/badge-status";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/ui/empty-state";
import { formatKg, formatPercent } from "@/utils/format";
import { inventoryItems } from "@/data/inventory";
import type { ProductStage } from "@/types";

const CATEGORIES: ProductStage[] = ["Whole Fish", "Fresh Loin", "WIP", "Finished Goods", "Side Product"];

export default function Inventory() {
  const [tab, setTab] = useState<ProductStage>("Whole Fish");

  const totals = useMemo(() => {
    const totalStock = inventoryItems.reduce((a, b) => a + b.weightKg, 0);
    const reserved = inventoryItems.reduce((a, b) => a + b.reservedKg, 0);
    const available = totalStock - reserved;
    const agingRisk = inventoryItems.filter((i) => i.status === "Risiko Aging").length;
    return { totalStock, reserved, available, agingRisk };
  }, []);

  const fefoCandidates = useMemo(
    () =>
      [...inventoryItems]
        .filter((i) => i.status === "Risiko Aging" || i.ageDays >= 6)
        .sort((a, b) => b.ageDays - a.ageDays)
        .slice(0, 4),
    []
  );

  return (
    <div>
      <PageHeader
        title="Inventory Management"
        subtitle="Pantau stok pada setiap tahap proses, dari whole fish hingga finished goods."
        breadcrumbs={[{ label: "FISH Operations", href: "/app/overview" }, { label: "Inventory" }]}
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard label="Total Stok" value={formatKg(totals.totalStock)} icon={Boxes} helperText="Seluruh tahap proses" />
        <KPICard label="Reserved" value={formatKg(totals.reserved)} icon={PackageCheck} helperText="Dialokasikan untuk PO / produksi" />
        <KPICard label="Available" value={formatKg(totals.available)} icon={PackageOpen} helperText="Belum dialokasikan" />
        <KPICard
          label="Risiko Aging"
          value={`${totals.agingRisk} item`}
          icon={AlertTriangle}
          deltaLabel="Perlu diproses segera"
          deltaDirection="up"
          deltaTone="negative"
        />
      </div>

      <Card className="mb-6 border-aruna-warning/40 bg-aruna-warningBg/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-aruna-warning">
            <AlertTriangle className="h-4 w-4" />
            Rekomendasi FEFO (First-Expired-First-Out)
          </CardTitle>
          <CardDescription>Item dengan umur stok tertinggi — prioritaskan untuk diproses atau dikirim lebih dulu.</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {fefoCandidates.length === 0 ? (
            <p className="text-sm text-aruna-textSecondary">Tidak ada item dengan risiko aging saat ini.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {fefoCandidates.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg border border-aruna-border bg-white p-3">
                  <div>
                    <p className="text-sm font-semibold text-aruna-text">{item.productName}</p>
                    <p className="text-xs text-aruna-textSecondary">
                      {item.batchId} &bull; {item.ageDays} hari &bull; {formatKg(item.weightKg)}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-aruna-warning" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs value={tab} onValueChange={(v) => setTab(v as ProductStage)}>
        <TabsList className="flex-wrap">
          {CATEGORIES.map((c) => (
            <TabsTrigger key={c} value={c}>{c}</TabsTrigger>
          ))}
        </TabsList>

        {CATEGORIES.map((cat) => {
          const items = inventoryItems.filter((i) => i.category === cat);
          return (
            <TabsContent key={cat} value={cat}>
              <Card>
                {items.length === 0 ? (
                  <div className="p-6">
                    <EmptyState title="Tidak ada item" description={`Belum ada stok pada kategori ${cat}.`} />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produk / Batch</TableHead>
                        <TableHead>Berat</TableHead>
                        <TableHead>Umur</TableHead>
                        <TableHead>Storage</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Alokasi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => {
                        const allocPct = item.weightKg > 0 ? (item.reservedKg / item.weightKg) * 100 : 0;
                        return (
                          <TableRow key={item.id}>
                            <TableCell>
                              <p className="font-medium text-aruna-text">{item.productName}</p>
                              <p className="text-xs text-aruna-textSecondary">{item.batchId}</p>
                            </TableCell>
                            <TableCell>{formatKg(item.weightKg)}</TableCell>
                            <TableCell>{item.ageDays} hari</TableCell>
                            <TableCell>{item.storage}</TableCell>
                            <TableCell><StatusBadge status={item.status} /></TableCell>
                            <TableCell>
                              <div className="w-32">
                                <Progress value={allocPct} />
                                <p className="mt-1 text-xs text-aruna-textSecondary">
                                  {formatKg(item.reservedKg)} / {formatKg(item.weightKg)} ({formatPercent(allocPct)})
                                </p>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
