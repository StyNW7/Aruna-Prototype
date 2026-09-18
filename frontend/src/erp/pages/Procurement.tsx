import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Plus, ShoppingCart, Clock, Star, PackageCheck, Send, Check, X, Trash2, Eye, Truck } from "lucide-react";
import { KPICard } from "@/components/cards/KPICard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/badge-status";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { useErp, fmtRp, fmtRpShort } from "../ErpContext";
import { ErpPageHeader, SectionCard, Field, fmtDate } from "../components/shared";
import type { PurchaseOrder, PurchaseOrderLine } from "../types";
import { cn } from "@/lib/utils";

const STATUSES = ["Semua", "Draft", "Menunggu Approval", "Disetujui", "Diterima", "Ditolak"];

export default function Procurement() {
  const { state, dispatch, supplierName, itemName, employeeName } = useErp();
  const [status, setStatus] = useState("Semua");
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<PurchaseOrder | null>(null);

  // form state
  const [supplierId, setSupplierId] = useState(state.suppliers[0]?.id ?? "");
  const [lines, setLines] = useState<PurchaseOrderLine[]>([{ itemId: state.items[0]?.id ?? "", qty: 100, unitPrice: state.items[0]?.unitCost ?? 0 }]);
  const [expected, setExpected] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().slice(0, 10);
  });
  const [note, setNote] = useState("");

  const list = state.purchaseOrders.filter((p) => status === "Semua" || p.status === status);
  const formTotal = lines.reduce((a, l) => a + l.qty * l.unitPrice, 0);

  const stats = useMemo(() => {
    const open = state.purchaseOrders.filter((p) => ["Draft", "Menunggu Approval", "Disetujui"].includes(p.status));
    const value = state.purchaseOrders.filter((p) => p.status !== "Ditolak").reduce((a, p) => a + p.total, 0);
    const lead = state.suppliers.reduce((a, s) => a + s.leadTimeDays, 0) / Math.max(1, state.suppliers.length);
    return { open: open.length, value, lead: lead.toFixed(1).replace(".", ","), received: state.purchaseOrders.filter((p) => p.status === "Diterima").length };
  }, [state.purchaseOrders, state.suppliers]);

  function updateLine(i: number, patch: Partial<PurchaseOrderLine>) {
    setLines((prev) =>
      prev.map((l, idx) => {
        if (idx !== i) return l;
        const next = { ...l, ...patch };
        if (patch.itemId) next.unitPrice = state.items.find((it) => it.id === patch.itemId)?.unitCost ?? next.unitPrice;
        return next;
      })
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (lines.some((l) => l.qty <= 0 || l.unitPrice <= 0)) {
      toast.error("Jumlah dan harga harus lebih dari 0.");
      return;
    }
    dispatch({ type: "CREATE_PO", payload: { supplierId, lines, requestedBy: "EMP-003", expectedDate: expected, note: note || undefined } });
    toast.success(`PO diajukan ke ${supplierName(supplierId)} — menunggu approval Finance.`);
    setOpen(false);
    setLines([{ itemId: state.items[0]?.id ?? "", qty: 100, unitPrice: state.items[0]?.unitCost ?? 0 }]);
    setNote("");
  }

  function act(po: PurchaseOrder, action: "submit" | "approve" | "reject" | "receive") {
    if (action === "submit") {
      dispatch({ type: "SET_PO_STATUS", id: po.id, status: "Menunggu Approval" });
      toast.success(`${po.id} diajukan untuk approval.`);
    } else if (action === "approve") {
      dispatch({ type: "SET_PO_STATUS", id: po.id, status: "Disetujui" });
      toast.success(`${po.id} disetujui.`);
    } else if (action === "reject") {
      dispatch({ type: "SET_PO_STATUS", id: po.id, status: "Ditolak" });
      toast(`${po.id} ditolak.`, { icon: "🚫" });
    } else {
      dispatch({ type: "RECEIVE_PO", id: po.id, by: "Sari Dewi" });
      toast.success(`${po.id} diterima — stok gudang & hutang Finance diperbarui.`);
    }
    setDetail(null);
  }

  return (
    <div>
      <ErpPageHeader
        team="Procurement"
        title="Procurement"
        subtitle="Kelola purchase order dan supplier. PO yang disetujui Finance dapat diterima Warehouse, lalu otomatis menjadi hutang."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" />
            Buat Purchase Order
          </Button>
        }
      />

      <div className="stagger mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard label="PO Terbuka" value={String(stats.open)} icon={ShoppingCart} accent="warning" helperText="draft, menunggu, disetujui" />
        <KPICard label="Nilai PO Bulan Ini" value={fmtRpShort(stats.value)} icon={PackageCheck} helperText={`${stats.received} PO diterima`} />
        <KPICard label="Supplier Aktif" value={String(state.suppliers.length)} icon={Star} accent="success" helperText="rating rata-rata 4,3" />
        <KPICard label="Lead Time Rata-rata" value={`${stats.lead} hari`} icon={Clock} helperText="dari PO ke penerimaan" />
      </div>

      <Tabs defaultValue="po">
        <TabsList>
          <TabsTrigger value="po">Purchase Orders</TabsTrigger>
          <TabsTrigger value="supplier">Supplier</TabsTrigger>
        </TabsList>

        <TabsContent value="po">
          <SectionCard
            title="Daftar Purchase Order"
            description="Alur: Draft → Menunggu Approval (Finance) → Disetujui → Diterima (Warehouse)"
            action={
              <Select value={status} onChange={(e) => setStatus(e.target.value)} className="h-9 w-48">
                {STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </Select>
            }
          >
            {list.length === 0 ? (
              <div className="p-6"><EmptyState title="Tidak ada PO" description="Buat purchase order baru atau ubah filter status." /></div>
            ) : (
              <Table wrapperClassName="rounded-none border-0">
                <TableHeader>
                  <TableRow>
                    <TableHead>PO</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead className="hidden 2xl:table-cell">Item</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Diminta</TableHead>
                    <TableHead>Estimasi Tiba</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {list.map((po) => (
                    <TableRow key={po.id}>
                      <TableCell className="font-mono text-xs font-medium">{po.id}</TableCell>
                      <TableCell className="font-medium">{supplierName(po.supplierId)}</TableCell>
                      <TableCell className="hidden max-w-[220px] truncate text-xs text-aruna-textSecondary 2xl:table-cell">
                        {po.lines.map((l) => `${itemName(l.itemId)} ×${l.qty.toLocaleString("id-ID")}`).join(", ")}
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">{fmtRp(po.total)}</TableCell>
                      <TableCell className="text-xs">{employeeName(po.requestedBy)}<br /><span className="text-aruna-textSecondary">{fmtDate(po.date)}</span></TableCell>
                      <TableCell className="text-xs">{fmtDate(po.expectedDate)}</TableCell>
                      <TableCell><StatusBadge status={po.status} /></TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button size="sm" variant="outline" onClick={() => setDetail(po)} title="Detail">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          {po.status === "Draft" && (
                            <Button size="sm" onClick={() => act(po, "submit")}>
                              <Send className="h-3.5 w-3.5" /> Ajukan
                            </Button>
                          )}
                          {po.status === "Menunggu Approval" && (
                            <>
                              <Button size="sm" variant="outline" className="text-aruna-success hover:bg-aruna-successBg" onClick={() => act(po, "approve")} title="Setujui (Finance)">
                                <Check className="h-3.5 w-3.5" />
                              </Button>
                              <Button size="sm" variant="outline" className="text-aruna-error hover:bg-aruna-errorBg" onClick={() => act(po, "reject")} title="Tolak">
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          )}
                          {po.status === "Disetujui" && (
                            <Button size="sm" onClick={() => act(po, "receive")}>
                              <Truck className="h-3.5 w-3.5" /> Terima Barang
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </SectionCard>
        </TabsContent>

        <TabsContent value="supplier">
          <div className="stagger grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {state.suppliers.map((s) => {
              const pos = state.purchaseOrders.filter((p) => p.supplierId === s.id);
              const spend = pos.filter((p) => p.status !== "Ditolak").reduce((a, p) => a + p.total, 0);
              return (
                <Card key={s.id} interactive className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-display text-sm font-semibold text-aruna-text">{s.name}</p>
                      <p className="text-xs text-aruna-textSecondary">{s.category} · {s.city}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-aruna-warningBg px-2 py-0.5 text-xs font-semibold text-aruna-warning">
                      <Star className="h-3 w-3 fill-current" /> {s.rating.toFixed(1).replace(".", ",")}
                    </span>
                  </div>
                  <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-aruna-bg p-2">
                      <dt className="text-[10px] text-aruna-textSecondary">Lead time</dt>
                      <dd className="text-sm font-semibold text-aruna-text">{s.leadTimeDays} hr</dd>
                    </div>
                    <div className="rounded-lg bg-aruna-bg p-2">
                      <dt className="text-[10px] text-aruna-textSecondary">PO</dt>
                      <dd className="text-sm font-semibold text-aruna-text">{pos.length}</dd>
                    </div>
                    <div className="rounded-lg bg-aruna-bg p-2">
                      <dt className="text-[10px] text-aruna-textSecondary">Spend</dt>
                      <dd className="text-sm font-semibold text-aruna-text">{fmtRpShort(spend)}</dd>
                    </div>
                  </dl>
                  <div className="mt-4 flex items-center justify-between">
                    <a href={`mailto:${s.contact}`} className="truncate text-xs text-aruna-primary hover:underline">{s.contact}</a>
                    <Button size="sm" variant="outline" onClick={() => { setSupplierId(s.id); setOpen(true); }}>
                      <Plus className="h-3.5 w-3.5" /> PO
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create PO */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Buat Purchase Order</DialogTitle>
            <DialogDescription>PO akan dikirim ke Approval Center untuk disetujui Finance sebelum barang diterima Warehouse.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Supplier">
                <Select value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
                  {state.suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} — {s.category}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Estimasi Tiba">
                <Input type="date" value={expected} onChange={(e) => setExpected(e.target.value)} required />
              </Field>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-aruna-text">Item</label>
                <Button type="button" size="sm" variant="outline" disabled={lines.length >= 4} onClick={() => setLines((p) => [...p, { itemId: state.items[0].id, qty: 100, unitPrice: state.items[0].unitCost }])}>
                  <Plus className="h-3.5 w-3.5" /> Tambah baris
                </Button>
              </div>
              {lines.map((l, i) => (
                <div key={i} className="grid grid-cols-[1fr_90px_130px_36px] items-center gap-2">
                  <Select value={l.itemId} onChange={(e) => updateLine(i, { itemId: e.target.value })} className="h-9">
                    {state.items.filter((it) => it.category !== "Finished Goods").map((it) => (
                      <option key={it.id} value={it.id}>{it.name} ({it.unit})</option>
                    ))}
                  </Select>
                  <Input type="number" min={1} value={l.qty} onChange={(e) => updateLine(i, { qty: Number(e.target.value) })} className="h-9" />
                  <Input type="number" min={1} value={l.unitPrice} onChange={(e) => updateLine(i, { unitPrice: Number(e.target.value) })} className="h-9" />
                  <button type="button" onClick={() => setLines((p) => p.filter((_, idx) => idx !== i))} disabled={lines.length === 1} className="flex h-9 w-9 items-center justify-center rounded-lg text-aruna-textSecondary hover:bg-aruna-errorBg hover:text-aruna-error disabled:opacity-40">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <p className="text-[11px] text-aruna-textSecondary">Kolom: item · jumlah · harga satuan (Rp). Harga terisi otomatis dari master item, bisa diubah.</p>
            </div>
            <Field label="Catatan (opsional)">
              <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Mis. kebutuhan plan produksi minggu depan" />
            </Field>
            <div className="flex items-center justify-between rounded-lg bg-aruna-bg px-4 py-3">
              <span className="text-sm text-aruna-textSecondary">Total PO</span>
              <span className="font-display text-lg font-bold text-aruna-primary">{fmtRp(formTotal)}</span>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
              <Button type="submit">
                <Send className="h-4 w-4" /> Ajukan PO
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail PO */}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-xl">
          {detail && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <DialogTitle>{detail.id}</DialogTitle>
                  <StatusBadge status={detail.status} />
                </div>
                <DialogDescription>{supplierName(detail.supplierId)} · diminta {employeeName(detail.requestedBy)} · {fmtDate(detail.date)}</DialogDescription>
              </DialogHeader>
              <div className="overflow-hidden rounded-lg border border-aruna-border">
                <table className="w-full text-xs">
                  <thead className="bg-aruna-light1 text-aruna-dark">
                    <tr><th className="px-3 py-2 text-left">Item</th><th className="px-3 py-2 text-right">Qty</th><th className="px-3 py-2 text-right">Harga</th><th className="px-3 py-2 text-right">Subtotal</th></tr>
                  </thead>
                  <tbody className="divide-y divide-aruna-border">
                    {detail.lines.map((l, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2">{itemName(l.itemId)}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{l.qty.toLocaleString("id-ID")}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{fmtRp(l.unitPrice)}</td>
                        <td className="px-3 py-2 text-right font-semibold tabular-nums">{fmtRp(l.qty * l.unitPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot><tr className="bg-aruna-bg"><td colSpan={3} className="px-3 py-2 text-right font-medium">Total</td><td className="px-3 py-2 text-right font-bold text-aruna-primary">{fmtRp(detail.total)}</td></tr></tfoot>
                </table>
              </div>
              {detail.note && <p className="mt-3 rounded-lg bg-aruna-light1/60 px-3 py-2 text-xs text-aruna-textSecondary">Catatan: {detail.note}</p>}
              <div className={cn("mt-4 grid gap-2 text-[11px]", "grid-cols-4")}>
                {["Draft", "Menunggu Approval", "Disetujui", "Diterima"].map((s, i) => {
                  const order = ["Draft", "Menunggu Approval", "Disetujui", "Diterima"];
                  const cur = order.indexOf(detail.status);
                  const done = detail.status !== "Ditolak" && i <= cur;
                  return (
                    <div key={s} className="text-center">
                      <div className={cn("mx-auto mb-1 h-1.5 rounded-full", done ? "bg-aruna-primary" : "bg-aruna-light2")} />
                      <span className={done ? "font-medium text-aruna-text" : "text-aruna-textSecondary"}>{s}</span>
                    </div>
                  );
                })}
              </div>
              <DialogFooter>
                {detail.status === "Draft" && <Button onClick={() => act(detail, "submit")}><Send className="h-4 w-4" /> Ajukan</Button>}
                {detail.status === "Menunggu Approval" && (
                  <>
                    <Button variant="outline" className="text-aruna-error" onClick={() => act(detail, "reject")}><X className="h-4 w-4" /> Tolak</Button>
                    <Button onClick={() => act(detail, "approve")}><Check className="h-4 w-4" /> Setujui</Button>
                  </>
                )}
                {detail.status === "Disetujui" && <Button onClick={() => act(detail, "receive")}><Truck className="h-4 w-4" /> Terima Barang</Button>}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
