import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Boxes, AlertTriangle, PackagePlus, ArrowLeftRight, Search, Snowflake, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { KPICard } from "@/components/cards/KPICard";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { chartTooltipStyle, CHART_COLORS } from "@/components/charts/chart-theme";
import { useErp, fmtRpShort } from "../ErpContext";
import { ErpPageHeader, SectionCard, Field } from "../components/shared";
import type { InventoryItem, StockMovementType } from "../types";
import { cn } from "@/lib/utils";

const CATS = ["Semua", "Bahan Baku", "Kemasan", "Finished Goods", "Consumable"];

function stockTone(it: InventoryItem): { label: string; variant: "success" | "warning" | "error" } {
  if (it.stock < it.minStock) return { label: "Kritis", variant: "error" };
  if (it.stock < it.minStock * 1.25) return { label: "Rendah", variant: "warning" };
  return { label: "Aman", variant: "success" };
}

export default function Inventory() {
  const { state, dispatch, derived, itemName } = useErp();
  const [cat, setCat] = useState("Semua");
  const [q, setQ] = useState("");
  const [adjust, setAdjust] = useState<InventoryItem | null>(null);
  const [kind, setKind] = useState<StockMovementType>("Penyesuaian");
  const [qty, setQty] = useState(0);
  const [note, setNote] = useState("");

  const list = state.items.filter(
    (i) => (cat === "Semua" || i.category === cat) && (q === "" || i.name.toLowerCase().includes(q.toLowerCase()) || i.location.toLowerCase().includes(q.toLowerCase()))
  );

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    state.items.forEach((i) => map.set(i.category, (map.get(i.category) ?? 0) + i.stock * i.unitCost));
    return [...map.entries()].map(([name, value]) => ({ name, value }));
  }, [state.items]);

  const fgKg = state.items.filter((i) => i.category === "Finished Goods").reduce((a, i) => a + i.stock, 0);

  function submitAdjust(e: React.FormEvent) {
    e.preventDefault();
    if (!adjust || qty === 0) {
      toast.error("Masukkan jumlah yang valid.");
      return;
    }
    dispatch({ type: "ADJUST_STOCK", itemId: adjust.id, qty, kind, by: "Sari Dewi", note });
    toast.success(`Stok ${adjust.name} diperbarui.`);
    setAdjust(null);
    setQty(0);
    setNote("");
  }

  return (
    <div>
      <ErpPageHeader
        team="Warehouse"
        title="Warehouse & Inventory"
        subtitle="Stok bahan baku, kemasan, dan finished goods. Bertambah saat PO diterima atau WO selesai; berkurang saat produksi dan pengiriman."
        actions={
          <Button asChild variant="outline">
            <Link to="/erp/procurement">
              <ShoppingCart className="h-4 w-4" />
              Ajukan Restock
            </Link>
          </Button>
        }
      />

      <div className="stagger mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard label="Nilai Persediaan" value={fmtRpShort(derived.inventoryValue)} icon={Boxes} helperText={`${state.items.length} item aktif`} />
        <KPICard label="Finished Goods" value={`${fgKg.toLocaleString("id-ID")} kg`} icon={Snowflake} accent="success" helperText="di cold storage" />
        <KPICard label="Item Kritis" value={String(derived.lowStockItems.length)} icon={AlertTriangle} accent={derived.lowStockItems.length ? "error" : "success"} helperText="di bawah stok minimum" />
        <KPICard label="Mutasi 7 Hari" value={String(state.movements.length)} icon={ArrowLeftRight} helperText="masuk, keluar, penyesuaian" />
      </div>

      {derived.lowStockItems.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-aruna-warning/30 bg-aruna-warningBg px-4 py-3 text-sm text-aruna-warning">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span className="font-medium">Stok di bawah minimum:</span>
          {derived.lowStockItems.map((i) => (
            <span key={i.id} className="rounded-full bg-white/70 px-2.5 py-0.5 text-xs font-semibold">
              {i.name} · {i.stock.toLocaleString("id-ID")}/{i.minStock.toLocaleString("id-ID")} {i.unit}
            </span>
          ))}
          <Link to="/erp/procurement" className="ml-auto text-xs font-semibold underline">Buat PO →</Link>
        </div>
      )}

      <Tabs defaultValue="stok">
        <TabsList>
          <TabsTrigger value="stok">Stok</TabsTrigger>
          <TabsTrigger value="mutasi">Mutasi Stok</TabsTrigger>
          <TabsTrigger value="nilai">Komposisi Nilai</TabsTrigger>
        </TabsList>

        <TabsContent value="stok">
          <SectionCard
            title="Daftar Stok"
            description="Level stok terhadap batas minimum dan maksimum per lokasi"
            action={
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-aruna-textSecondary" />
                  <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari item / lokasi" className="h-9 w-48 pl-9" />
                </div>
                <Select value={cat} onChange={(e) => setCat(e.target.value)} className="h-9 w-40">
                  {CATS.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </Select>
              </div>
            }
          >
            <Table wrapperClassName="rounded-none border-0">
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Lokasi</TableHead>
                  <TableHead className="text-right">Stok</TableHead>
                  <TableHead className="w-48">Level (min–max)</TableHead>
                  <TableHead className="text-right">Nilai</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((it) => {
                  const tone = stockTone(it);
                  const pct = Math.min(100, Math.round((it.stock / it.maxStock) * 100));
                  return (
                    <TableRow key={it.id}>
                      <TableCell>
                        <p className="font-medium">{it.name}</p>
                        <p className="font-mono text-[10px] text-aruna-textSecondary">{it.id}{it.skuCode ? ` · ${it.skuCode}` : ""}</p>
                      </TableCell>
                      <TableCell><Badge variant="outline">{it.category}</Badge></TableCell>
                      <TableCell className="text-xs">{it.location}</TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">{it.stock.toLocaleString("id-ID")} <span className="text-xs font-normal text-aruna-textSecondary">{it.unit}</span></TableCell>
                      <TableCell>
                        <Progress value={pct} variant={tone.variant === "error" ? "error" : tone.variant === "warning" ? "warning" : "default"} className="h-1.5" />
                        <p className="mt-1 text-[10px] text-aruna-textSecondary">{it.minStock.toLocaleString("id-ID")} – {it.maxStock.toLocaleString("id-ID")} {it.unit}</p>
                      </TableCell>
                      <TableCell className="text-right text-xs tabular-nums">{fmtRpShort(it.stock * it.unitCost)}</TableCell>
                      <TableCell><Badge variant={tone.variant}>{tone.label}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={() => { setAdjust(it); setKind("Penyesuaian"); setQty(0); }}>
                          <PackagePlus className="h-3.5 w-3.5" /> Sesuaikan
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </SectionCard>
        </TabsContent>

        <TabsContent value="mutasi">
          <SectionCard title="Riwayat Mutasi Stok" description="Setiap pergerakan tercatat dengan referensi PO / WO / SO / penyesuaian">
            <Table wrapperClassName="rounded-none border-0">
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Waktu</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead>Referensi</TableHead>
                  <TableHead>Oleh</TableHead>
                  <TableHead>Catatan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {state.movements.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-mono text-xs">{m.id}</TableCell>
                    <TableCell className="text-xs">{new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(m.date))}</TableCell>
                    <TableCell className="font-medium">{itemName(m.itemId)}</TableCell>
                    <TableCell>
                      <Badge variant={m.type === "Masuk" ? "success" : m.type === "Keluar" ? "error" : m.type === "Transfer" ? "primary" : "warning"}>{m.type}</Badge>
                    </TableCell>
                    <TableCell className={cn("text-right font-semibold tabular-nums", m.qty > 0 ? "text-aruna-success" : "text-aruna-error")}>
                      {m.qty > 0 ? "+" : ""}{m.qty.toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{m.ref}</TableCell>
                    <TableCell className="text-xs">{m.by}</TableCell>
                    <TableCell className="text-xs text-aruna-textSecondary">{m.note ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </SectionCard>
        </TabsContent>

        <TabsContent value="nilai">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <SectionCard title="Komposisi Nilai Persediaan" description="Berdasarkan kategori (stok × harga pokok)">
              <div className="h-72 p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={byCategory} dataKey="value" nameKey="name" innerRadius={62} outerRadius={100} paddingAngle={2}>
                      {byCategory.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip {...chartTooltipStyle} formatter={(v: number) => fmtRpShort(v)} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>
            <SectionCard title="Finished Goods per SKU" description="Stok siap kirim yang dapat dialokasikan Sales">
              <div className="divide-y divide-aruna-border">
                {state.items.filter((i) => i.category === "Finished Goods").map((i) => (
                  <div key={i.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-aruna-text">{i.name}</p>
                      <p className="text-[11px] text-aruna-textSecondary">{i.location}</p>
                    </div>
                    <div className="w-32">
                      <Progress value={Math.round((i.stock / i.maxStock) * 100)} className="h-1.5" />
                    </div>
                    <span className="w-24 text-right text-sm font-semibold tabular-nums text-aruna-text">{i.stock.toLocaleString("id-ID")} kg</span>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!adjust} onOpenChange={(o) => !o && setAdjust(null)}>
        <DialogContent>
          {adjust && (
            <>
              <DialogHeader>
                <DialogTitle>Sesuaikan Stok — {adjust.name}</DialogTitle>
                <DialogDescription>Stok saat ini {adjust.stock.toLocaleString("id-ID")} {adjust.unit} di {adjust.location}. Mutasi akan tercatat di riwayat dan aktivitas.</DialogDescription>
              </DialogHeader>
              <form onSubmit={submitAdjust} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Jenis mutasi">
                    <Select value={kind} onChange={(e) => setKind(e.target.value as StockMovementType)}>
                      <option>Penyesuaian</option>
                      <option>Masuk</option>
                      <option>Keluar</option>
                      <option>Transfer</option>
                    </Select>
                  </Field>
                  <Field label={`Jumlah (${adjust.unit})`} hint={kind === "Penyesuaian" || kind === "Transfer" ? "Gunakan angka negatif untuk mengurangi" : undefined}>
                    <Input type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} required />
                  </Field>
                </div>
                <Field label="Catatan">
                  <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Mis. hasil stock opname, susut, transfer ke Cold Storage 2" />
                </Field>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setAdjust(null)}>Batal</Button>
                  <Button type="submit">Simpan Mutasi</Button>
                </DialogFooter>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
