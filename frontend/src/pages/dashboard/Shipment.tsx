import { useMemo } from "react";
import { Package, Percent, Warehouse, DollarSign, AlertTriangle, Ship } from "lucide-react";
import { PageHeader } from "@/components/cards/PageHeader";
import { KPICard } from "@/components/cards/KPICard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/badge-status";
import { Progress } from "@/components/ui/progress";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { shipments, CONTAINER_CAPACITY_KG } from "@/data/shipment";
import { skuByCode } from "@/data/skus";
import { formatKg, formatPercent, formatUSD, usdToIdr, formatRupiah, formatDate } from "@/utils/format";

export default function Shipment() {
  const totalWeight = useMemo(() => shipments.reduce((a, s) => a + s.totalWeightKg, 0), []);
  const totalValueUsd = useMemo(
    () => shipments.reduce((a, s) => a + s.items.reduce((b, it) => b + it.valueUsd, 0), 0),
    []
  );
  const avgUtilization = useMemo(
    () => (shipments.reduce((a, s) => a + s.totalWeightKg / s.capacityKg, 0) / shipments.length) * 100,
    []
  );
  const remainingCapacity = useMemo(
    () => shipments.reduce((a, s) => a + Math.max(0, s.capacityKg - s.totalWeightKg), 0),
    []
  );

  const nearCapacityShipments = shipments.filter((s) => s.totalWeightKg / s.capacityKg > 0.95);

  return (
    <div>
      <PageHeader
        title="Shipment Planner"
        subtitle={`Rencanakan pengiriman finished goods dengan batas kapasitas ${formatKg(CONTAINER_CAPACITY_KG)} per kontainer.`}
        breadcrumbs={[{ label: "FISH Operations", href: "/app/overview" }, { label: "Shipment Planner" }]}
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard label="Finished Goods Terencana" value={formatKg(totalWeight)} icon={Package} helperText={`${shipments.length} shipment aktif`} />
        <KPICard label="Utilisasi Kontainer Rata-rata" value={formatPercent(avgUtilization)} icon={Percent} helperText={`Kapasitas ${formatKg(CONTAINER_CAPACITY_KG)}`} />
        <KPICard label="Sisa Kapasitas Tersedia" value={formatKg(remainingCapacity)} icon={Warehouse} helperText="Total lintas shipment" />
        <KPICard label="Estimasi Nilai Pengiriman" value={formatUSD(totalValueUsd)} icon={DollarSign} helperText={formatRupiah(Math.round(usdToIdr(totalValueUsd)))} />
      </div>

      {nearCapacityShipments.length > 0 && (
        <Card className="mb-6 border-aruna-warning/40 bg-aruna-warningBg/40 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-aruna-warning" />
            <div>
              <p className="text-sm font-semibold text-aruna-text">Kapasitas kontainer mendekati batas</p>
              <p className="mt-0.5 text-sm text-aruna-textSecondary">
                {nearCapacityShipments.map((s) => s.containerNo).join(", ")} telah mencapai lebih dari 95% dari kapasitas {formatKg(CONTAINER_CAPACITY_KG)}. Tinjau kembali alokasi SKU sebelum penjadwalan final.
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {shipments.map((s) => {
          const utilizationPct = (s.totalWeightKg / s.capacityKg) * 100;
          const variant = utilizationPct > 95 ? "error" : utilizationPct > 80 ? "warning" : "default";
          const shipmentValueUsd = s.items.reduce((a, it) => a + it.valueUsd, 0);
          return (
            <Card key={s.id} className="flex flex-col">
              <CardHeader className="flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Ship className="h-4 w-4 text-aruna-primary" />
                    {s.containerNo}
                  </CardTitle>
                  <CardDescription className="mt-1">{s.buyer} &middot; Rencana kirim {formatDate(s.plannedDate)}</CardDescription>
                </div>
                <StatusBadge status={s.status} />
              </CardHeader>
              <CardContent className="pt-0">
                <div className="mb-4">
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="text-aruna-textSecondary">Utilisasi Kontainer</span>
                    <span className="font-semibold text-aruna-text">
                      {formatKg(s.totalWeightKg)} / {formatKg(s.capacityKg)}
                    </span>
                  </div>
                  <Progress value={utilizationPct} variant={variant} />
                  <p className="mt-1 text-right text-xs text-aruna-textSecondary">{formatPercent(utilizationPct)} terisi</p>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>Berat</TableHead>
                      <TableHead>Karton</TableHead>
                      <TableHead>Nilai</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {s.items.map((it, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{skuByCode(it.skuCode)?.name ?? it.skuCode}</TableCell>
                        <TableCell>{formatKg(it.weightKg)}</TableCell>
                        <TableCell>{it.cartons}</TableCell>
                        <TableCell>{formatUSD(it.valueUsd)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="mt-3 flex items-center justify-between rounded-lg bg-aruna-light1/50 px-3 py-2">
                  <span className="text-xs text-aruna-textSecondary">Total nilai shipment</span>
                  <Badge variant="primary">{formatUSD(shipmentValueUsd)}</Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
