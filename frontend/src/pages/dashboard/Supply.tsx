import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Ship, Filter, X } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { PageHeader } from "@/components/cards/PageHeader";
import { ChartCard } from "@/components/charts/ChartCard";
import { CHART_COLORS, chartTooltipStyle } from "@/components/charts/chart-theme";
import { Button } from "@/components/ui/button";
import { Input, Select, Label } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge-status";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatKg, formatDate, formatRupiah } from "@/utils/format";
import { supplyBatches as initialBatches } from "@/data/supply";
import type { SupplyBatch } from "@/types";

const PAGE_SIZE = 5;

const SIZE_GRADES = ["14 UP", "20 UP", "30 UP"] as const;
const QUALITY_GRADES = ["Grade B", "Grade C"] as const;
const FRESHNESS_OPTIONS = ["Prima", "Baik", "Perlu Perhatian"] as const;
const STATUS_OPTIONS = ["Diterima", "Diproses", "Selesai Diproses", "Menunggu QC"] as const;

export default function Supply() {
  const [batches, setBatches] = useState<SupplyBatch[]>(initialBatches);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);

  const [filterVessel, setFilterVessel] = useState("");
  const [filterSize, setFilterSize] = useState("");
  const [filterGrade, setFilterGrade] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const vessels = useMemo(() => Array.from(new Set(initialBatches.map((b) => b.vessel))), []);

  const filtered = useMemo(() => {
    return batches.filter((b) => {
      if (filterVessel && b.vessel !== filterVessel) return false;
      if (filterSize && b.sizeGrade !== filterSize) return false;
      if (filterGrade && b.qualityGrade !== filterGrade) return false;
      if (filterStatus && b.status !== filterStatus) return false;
      if (filterDate && b.arrivalDate !== filterDate) return false;
      return true;
    });
  }, [batches, filterVessel, filterSize, filterGrade, filterStatus, filterDate]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const distributionData = SIZE_GRADES.map((grade) => ({
    grade,
    weightKg: batches.filter((b) => b.sizeGrade === grade).reduce((a, b) => a + b.totalWeightKg, 0),
  }));

  function resetFilters() {
    setFilterVessel("");
    setFilterSize("");
    setFilterGrade("");
    setFilterStatus("");
    setFilterDate("");
    setPage(1);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const vessel = String(form.get("vessel") || "Kapal Baru");
    const newBatch: SupplyBatch = {
      id: `BT-2408-${String(batches.length + 1).padStart(2, "0")}`,
      vessel,
      arrivalDate: String(form.get("arrivalDate") || new Date().toISOString().slice(0, 10)),
      sizeGrade: (String(form.get("sizeGrade") || "20 UP") as SupplyBatch["sizeGrade"]),
      qualityGrade: (String(form.get("qualityGrade") || "Grade C") as SupplyBatch["qualityGrade"]),
      totalWeightKg: Number(form.get("totalWeightKg") || 0),
      availableStockKg: Number(form.get("totalWeightKg") || 0),
      purchasePricePerKg: Number(form.get("purchasePricePerKg") || 0),
      freshness: (String(form.get("freshness") || "Baik") as SupplyBatch["freshness"]),
      supplier: String(form.get("supplier") || "Supplier Baru"),
      status: "Diterima",
    };
    setBatches((prev) => [newBatch, ...prev]);
    toast.success(`Batch ${newBatch.id} berhasil ditambahkan.`);
    setOpen(false);
    setPage(1);
  }

  return (
    <div>
      <PageHeader
        title="Supply Intake"
        subtitle="Catat dan pantau seluruh batch supply tuna yang masuk dari kapal nelayan."
        breadcrumbs={[{ label: "FISH Operations", href: "/app/overview" }, { label: "Supply Intake" }]}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" />
                Tambah Batch Supply
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Batch Supply</DialogTitle>
                <DialogDescription>Masukkan detail batch supply yang baru diterima dari kapal.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="vessel">Kapal</Label>
                    <Input id="vessel" name="vessel" placeholder="KM Samudra Jaya 2" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="arrivalDate">Tanggal Tiba</Label>
                    <Input id="arrivalDate" name="arrivalDate" type="date" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="totalWeightKg">Total Berat (kg)</Label>
                    <Input id="totalWeightKg" name="totalWeightKg" type="number" min={0} placeholder="4200" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="purchasePricePerKg">Harga Beli (Rp/kg)</Label>
                    <Input id="purchasePricePerKg" name="purchasePricePerKg" type="number" min={0} placeholder="42000" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="sizeGrade">Size Grade</Label>
                    <Select id="sizeGrade" name="sizeGrade" defaultValue="20 UP">
                      {SIZE_GRADES.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="qualityGrade">Quality Grade</Label>
                    <Select id="qualityGrade" name="qualityGrade" defaultValue="Grade C">
                      {QUALITY_GRADES.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="freshness">Freshness</Label>
                    <Select id="freshness" name="freshness" defaultValue="Baik">
                      {FRESHNESS_OPTIONS.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="supplier">Supplier / Nelayan</Label>
                    <Input id="supplier" name="supplier" placeholder="Koperasi Nelayan Bungus" required />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
                  <Button type="submit">Simpan Batch</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard title="Distribusi Supply Hari Ini" description="Total berat berdasarkan grade ukuran" className="lg:col-span-1">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E3EAF0" vertical={false} />
                <XAxis dataKey="grade" tick={{ fontSize: 12, fill: "#64748B" }} axisLine={{ stroke: "#E3EAF0" }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
                <Tooltip {...chartTooltipStyle} formatter={(v: number) => formatKg(v)} />
                <Bar dataKey="weightKg" name="Berat (kg)" radius={[6, 6, 0, 0]} fill={CHART_COLORS[0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <Card className="p-5 lg:col-span-2">
          <div className="mb-3 flex items-center gap-2">
            <Filter className="h-4 w-4 text-aruna-primary" />
            <p className="text-sm font-semibold text-aruna-text">Filter Batch</p>
            {(filterVessel || filterSize || filterGrade || filterStatus || filterDate) && (
              <Button variant="ghost" size="sm" className="ml-auto" onClick={resetFilters}>
                <X className="h-3.5 w-3.5" />
                Reset
              </Button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <Label className="text-xs">Kapal</Label>
              <Select value={filterVessel} onChange={(e) => { setFilterVessel(e.target.value); setPage(1); }}>
                <option value="">Semua</option>
                {vessels.map((v) => <option key={v} value={v}>{v}</option>)}
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Size Grade</Label>
              <Select value={filterSize} onChange={(e) => { setFilterSize(e.target.value); setPage(1); }}>
                <option value="">Semua</option>
                {SIZE_GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Quality Grade</Label>
              <Select value={filterGrade} onChange={(e) => { setFilterGrade(e.target.value); setPage(1); }}>
                <option value="">Semua</option>
                {QUALITY_GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Status</Label>
              <Select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}>
                <option value="">Semua</option>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-xs">Tanggal Tiba</Label>
              <Input type="date" value={filterDate} onChange={(e) => { setFilterDate(e.target.value); setPage(1); }} />
            </div>
          </div>
        </Card>
      </div>

      <Card>
        {filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={Ship}
              title="Tidak ada batch yang cocok"
              description="Ubah atau reset filter untuk melihat batch supply lainnya."
              action={<Button variant="outline" onClick={resetFilters}>Reset Filter</Button>}
            />
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch ID</TableHead>
                  <TableHead>Kapal</TableHead>
                  <TableHead>Tanggal Tiba</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Total Berat</TableHead>
                  <TableHead>Stok Tersedia</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageItems.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-semibold text-aruna-primary">{b.id}</TableCell>
                    <TableCell>{b.vessel}</TableCell>
                    <TableCell>{formatDate(b.arrivalDate)}</TableCell>
                    <TableCell>{b.sizeGrade}</TableCell>
                    <TableCell>{b.qualityGrade}</TableCell>
                    <TableCell>{formatKg(b.totalWeightKg)}</TableCell>
                    <TableCell>{formatKg(b.availableStockKg)}</TableCell>
                    <TableCell><StatusBadge status={b.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} totalItems={filtered.length} pageSize={PAGE_SIZE} />
          </>
        )}
      </Card>

      <p className="mt-3 text-xs text-aruna-textSecondary">
        Contoh harga beli acuan: {formatRupiah(42000)}/kg untuk 30 UP Grade C, bervariasi menurut ukuran dan kesegaran.
      </p>
    </div>
  );
}
