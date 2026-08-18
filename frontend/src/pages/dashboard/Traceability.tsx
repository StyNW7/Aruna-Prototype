import { useMemo, useState } from "react";
import {
  Search,
  Ship,
  Anchor,
  Scissors,
  Factory,
  PackageCheck,
  Truck,
  ChevronRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/cards/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/badge-status";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import { formatKg, formatDate, formatPercent } from "@/utils/format";
import { supplyBatches } from "@/data/supply";
import { inventoryItems } from "@/data/inventory";
import { skuByCode } from "@/data/skus";
import { shipments } from "@/data/shipment";

const EXAMPLE_BATCH_ID = "BT-2408-14";
const exampleBatch = supplyBatches.find((b) => b.id === EXAMPLE_BATCH_ID)!;
const exampleWip = inventoryItems.find((i) => i.id === "INV-007")!;
const exampleSku = skuByCode("SAKU-16OZ")!;
const exampleShipment = shipments.find((s) => s.id === "SH-001")!;
const exampleShipmentItem = exampleShipment.items.find((it) => it.skuCode === "SAKU-16OZ")!;

const loinYieldPct = 59;
const loinKg = Math.round(exampleBatch.totalWeightKg * (loinYieldPct / 100));
const finishedKg = Math.round(exampleWip.weightKg * (exampleSku.yieldFromLoinPct / 100));

interface ChainNode {
  key: string;
  label: string;
  icon: LucideIcon;
  fields: { label: string; value: string }[];
}

const chain: ChainNode[] = [
  {
    key: "vessel",
    label: "Vessel",
    icon: Ship,
    fields: [
      { label: "Nama Kapal", value: exampleBatch.vessel },
      { label: "Supplier / Nelayan", value: exampleBatch.supplier },
      { label: "Tanggal Tiba", value: formatDate(exampleBatch.arrivalDate) },
    ],
  },
  {
    key: "receiving",
    label: "Receiving Batch",
    icon: Anchor,
    fields: [
      { label: "Batch ID", value: exampleBatch.id },
      { label: "Total Berat (WGG)", value: formatKg(exampleBatch.totalWeightKg) },
      { label: "Size / Quality Grade", value: `${exampleBatch.sizeGrade} / ${exampleBatch.qualityGrade}` },
      { label: "Freshness", value: exampleBatch.freshness },
      { label: "Status", value: exampleBatch.status },
    ],
  },
  {
    key: "loin",
    label: "Loin Batch",
    icon: Scissors,
    fields: [
      { label: "Batch Asal", value: exampleBatch.id },
      { label: "Yield WGG → Loin", value: formatPercent(loinYieldPct) },
      { label: "Berat Fresh Loin", value: formatKg(loinKg) },
      { label: "Storage", value: "Chiller" },
    ],
  },
  {
    key: "wip",
    label: "WIP",
    icon: Factory,
    fields: [
      { label: "Item WIP", value: exampleWip.productName },
      { label: "Berat WIP", value: formatKg(exampleWip.weightKg) },
      { label: "Reserved untuk Produksi", value: formatKg(exampleWip.reservedKg) },
      { label: "Batch Asal", value: exampleWip.batchId },
    ],
  },
  {
    key: "finished",
    label: "Finished Product",
    icon: PackageCheck,
    fields: [
      { label: "SKU", value: exampleSku.name },
      { label: "Yield Loin → Finished", value: formatPercent(exampleSku.yieldFromLoinPct) },
      { label: "Estimasi Berat Jadi", value: formatKg(finishedKg) },
      { label: "Export Eligible", value: exampleSku.exportEligible ? "Ya" : "Tidak" },
    ],
  },
  {
    key: "shipment",
    label: "Shipment",
    icon: Truck,
    fields: [
      { label: "Container", value: exampleShipment.containerNo },
      { label: "Buyer", value: exampleShipment.buyer },
      { label: "Kontribusi SKU dalam Shipment", value: formatKg(exampleShipmentItem.weightKg) },
      { label: "Tanggal Rencana Kirim", value: formatDate(exampleShipment.plannedDate) },
      { label: "Status Shipment", value: exampleShipment.status },
    ],
  },
];

export default function Traceability() {
  const [selected, setSelected] = useState<string>(chain[1].key);
  const [query, setQuery] = useState("");

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    const batchMatches = supplyBatches.filter(
      (b) => b.id.toLowerCase().includes(q) || b.vessel.toLowerCase().includes(q) || b.supplier.toLowerCase().includes(q)
    );
    const inventoryMatches = inventoryItems.filter(
      (i) => i.productName.toLowerCase().includes(q) || i.batchId.toLowerCase().includes(q) || i.id.toLowerCase().includes(q)
    );
    const shipmentMatches = shipments.filter(
      (s) => s.id.toLowerCase().includes(q) || s.containerNo.toLowerCase().includes(q) || s.buyer.toLowerCase().includes(q)
    );
    return { batchMatches, inventoryMatches, shipmentMatches };
  }, [query]);

  const activeNode = chain.find((n) => n.key === selected) ?? chain[1];

  return (
    <div>
      <PageHeader
        title="Traceability"
        subtitle="Telusuri perjalanan produk dari kapal hingga shipment untuk setiap batch."
        breadcrumbs={[{ label: "FISH Operations", href: "/app/overview" }, { label: "Traceability" }]}
      />

      <Card className="mb-6 p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-aruna-textSecondary" />
          <Input
            placeholder="Cari berdasarkan Batch ID, Vessel, SKU, Shipment, atau Buyer..."
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {searchResults && (
          <div className="mt-4 space-y-3">
            {searchResults.batchMatches.length === 0 &&
            searchResults.inventoryMatches.length === 0 &&
            searchResults.shipmentMatches.length === 0 ? (
              <EmptyState title="Tidak ditemukan" description="Coba kata kunci lain, misalnya nama kapal atau kode batch." />
            ) : (
              <>
                {searchResults.batchMatches.map((b) => (
                  <div key={b.id} className="flex items-center justify-between rounded-lg border border-aruna-border p-3 text-sm">
                    <span><span className="font-semibold text-aruna-primary">{b.id}</span> &bull; {b.vessel} &bull; {formatKg(b.totalWeightKg)}</span>
                    <StatusBadge status={b.status} />
                  </div>
                ))}
                {searchResults.inventoryMatches.map((i) => (
                  <div key={i.id} className="flex items-center justify-between rounded-lg border border-aruna-border p-3 text-sm">
                    <span><span className="font-semibold text-aruna-primary">{i.productName}</span> &bull; {i.batchId} &bull; {formatKg(i.weightKg)}</span>
                    <StatusBadge status={i.status} />
                  </div>
                ))}
                {searchResults.shipmentMatches.map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded-lg border border-aruna-border p-3 text-sm">
                    <span><span className="font-semibold text-aruna-primary">{s.containerNo}</span> &bull; {s.buyer}</span>
                    <StatusBadge status={s.status} />
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Alur Contoh: Batch {exampleBatch.id}</CardTitle>
          <CardDescription>Klik setiap tahap untuk melihat detail ilustratif alur produk secara konsisten.</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-0 sm:overflow-x-auto">
            {chain.map((node, i) => {
              const isActive = node.key === selected;
              return (
                <div key={node.key} className="flex items-center sm:shrink-0">
                  <button
                    onClick={() => setSelected(node.key)}
                    className={cn(
                      "flex min-w-[150px] flex-col items-center gap-2 rounded-xl border p-4 text-center transition-colors",
                      isActive
                        ? "border-aruna-primary bg-aruna-light1 shadow-sm"
                        : "border-aruna-border bg-white hover:bg-aruna-light1/50"
                    )}
                  >
                    <div className={cn("flex h-10 w-10 items-center justify-center rounded-full", isActive ? "bg-aruna-primary text-white" : "bg-aruna-light2 text-aruna-primary")}>
                      <node.icon className="h-5 w-5" />
                    </div>
                    <p className={cn("text-sm font-semibold", isActive ? "text-aruna-primary" : "text-aruna-text")}>{node.label}</p>
                  </button>
                  {i < chain.length - 1 && (
                    <ChevronRight className="mx-1 hidden h-5 w-5 shrink-0 text-aruna-border sm:block" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 rounded-xl border border-aruna-border bg-aruna-bg p-5">
            <div className="mb-3 flex items-center gap-2">
              <Badge variant="primary">{activeNode.label}</Badge>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {activeNode.fields.map((f) => (
                <div key={f.label}>
                  <p className="text-xs uppercase tracking-wide text-aruna-textSecondary">{f.label}</p>
                  <p className="mt-0.5 text-sm font-medium text-aruna-text">{f.value}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
