import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Sparkles, Factory, Clock } from "lucide-react";
import { PageHeader } from "@/components/cards/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge-status";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { productionPlans } from "@/data/production";
import { skuByCode } from "@/data/skus";
import { formatKg, formatDate } from "@/utils/format";
import { cn } from "@/lib/utils";

const TIMELINE_START_MIN = 6 * 60; // 06:00
const TIMELINE_END_MIN = 16 * 60; // 16:00
const TIMELINE_SPAN = TIMELINE_END_MIN - TIMELINE_START_MIN;

const STATUS_BAR_COLOR: Record<string, string> = {
  Selesai: "bg-aruna-success",
  "Dalam Proses": "bg-aruna-primary",
  "Belum Dimulai": "bg-aruna-medium",
  Tertunda: "bg-aruna-error",
};

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export default function Production() {
  const [plans] = useState(productionPlans);

  const groupedByDate = useMemo(() => {
    const map = new Map<string, typeof productionPlans>();
    for (const p of plans) {
      const list = map.get(p.date) ?? [];
      list.push(p);
      map.set(p.date, list);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [plans]);

  function handleOptimize() {
    toast.success("Jadwal produksi telah dioptimalkan berdasarkan ketersediaan mesin dan target output.");
  }

  return (
    <div>
      <PageHeader
        title="Production Plan"
        subtitle="Jadwal produksi harian per batch, mesin, dan target output untuk setiap SKU."
        breadcrumbs={[{ label: "FISH Operations", href: "/app/overview" }, { label: "Production Plan" }]}
        actions={
          <Button onClick={handleOptimize}>
            <Sparkles className="h-4 w-4" />
            Optimalkan Jadwal
          </Button>
        }
      />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-aruna-primary" />
            Timeline Produksi
          </CardTitle>
          <CardDescription>Visualisasi jam mulai &ndash; selesai per batch, dikelompokkan per tanggal (rentang 06:00&ndash;16:00).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 pt-0">
          {groupedByDate.map(([date, items]) => (
            <div key={date}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-aruna-textSecondary">{formatDate(date)}</p>
              <div className="space-y-2">
                {items.map((p) => {
                  const startMin = toMinutes(p.start);
                  const finishMin = toMinutes(p.finish);
                  const left = ((startMin - TIMELINE_START_MIN) / TIMELINE_SPAN) * 100;
                  const width = ((finishMin - startMin) / TIMELINE_SPAN) * 100;
                  return (
                    <div key={p.id} className="flex items-center gap-3">
                      <div className="w-32 shrink-0 truncate text-xs font-medium text-aruna-text" title={p.batchId}>
                        {p.batchId}
                      </div>
                      <div className="relative h-6 flex-1 rounded-md bg-aruna-light1/60">
                        <div
                          className={cn("absolute top-0 h-6 rounded-md text-[10px] font-medium text-white shadow-sm flex items-center justify-center px-1", STATUS_BAR_COLOR[p.status])}
                          style={{ left: `${Math.max(0, left)}%`, width: `${Math.max(3, width)}%` }}
                          title={`${p.start} - ${p.finish}`}
                        >
                          <span className="truncate">{skuByCode(p.skuCode)?.name ?? p.skuCode}</span>
                        </div>
                      </div>
                      <div className="w-24 shrink-0 text-right text-xs text-aruna-textSecondary">
                        {p.start}&ndash;{p.finish}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="flex flex-wrap items-center gap-4 border-t border-aruna-border pt-3 text-xs text-aruna-textSecondary">
            {Object.entries(STATUS_BAR_COLOR).map(([status, color]) => (
              <span key={status} className="flex items-center gap-1.5">
                <span className={cn("h-2.5 w-2.5 rounded-full", color)} />
                {status}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Factory className="h-4 w-4 text-aruna-primary" />
            Daftar Rencana Produksi
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Input</TableHead>
                <TableHead>Target Output</TableHead>
                <TableHead>Realisasi</TableHead>
                <TableHead>Mesin</TableHead>
                <TableHead>Waktu</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{formatDate(p.date)}</TableCell>
                  <TableCell className="font-semibold text-aruna-primary">{p.batchId}</TableCell>
                  <TableCell>{skuByCode(p.skuCode)?.name ?? p.skuCode}</TableCell>
                  <TableCell>{formatKg(p.inputKg)}</TableCell>
                  <TableCell>{formatKg(p.targetOutputKg)}</TableCell>
                  <TableCell>{p.actualOutputKg !== undefined ? formatKg(p.actualOutputKg) : "—"}</TableCell>
                  <TableCell>{p.machine}</TableCell>
                  <TableCell>{p.start}&ndash;{p.finish}</TableCell>
                  <TableCell><StatusBadge status={p.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
