import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Handshake, TrendingUp, Globe2, Receipt, Check, Truck, FileText, X, Trash2, UserPlus, Eye, FileDown } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { KPICard } from "@/components/cards/KPICard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/badge-status";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { chartTooltipStyle, CHART_AXIS_COLOR, CHART_GRID_COLOR, CHART_COLORS } from "@/components/charts/chart-theme";
import { skus } from "@/data/skus";
import { useErp, fmtUsd, fmtRpShort } from "../ErpContext";
import { KURS_USD } from "../seed";
import { ErpPageHeader, SectionCard, Field, fmtDate } from "../components/shared";
import { ExportMenu } from "../components/ExportMenu";
import { buildErpReport } from "../reports";
import { exportSalesOrderPdf } from "../export";
import type { Customer, SalesOrder, SalesOrderLine } from "../types";
import { cn } from "@/lib/utils";

const PIPELINE: SalesOrder["status"][] = ["Quotation", "Dikonfirmasi", "Dikirim", "Ditagih", "Lunas"];

export default function Sales() {
  const { state, dispatch, customerName, employeeName, skuName, derived } = useErp();
  const [openSo, setOpenSo] = useState(false);
  const [openCus, setOpenCus] = useState(false);
  const [detail, setDetail] = useState<SalesOrder | null>(null);
  const [status, setStatus] = useState("Semua");

  // SO form
  const [customerId, setCustomerId] = useState(state.customers[0]?.id ?? "");
  const [lines, setLines] = useState<SalesOrderLine[]>([{ skuCode: skus[0].code, qtyKg: 1000, priceUsdPerKg: skus[0].priceUsdPerKg }]);
  const [dueDate, setDueDate] = useState(() => { const d = new Date(); d.setDate(d.getDate() + 45); return d.toISOString().slice(0, 10); });

  // Customer form
  const [cus, setCus] = useState<Omit<Customer, "id">>({ name: "", country: "Indonesia", segment: "Domestik", creditLimitUsd: 20000, contact: "", paymentTermDays: 14 });

  const fgStock = (code: string) => state.items.find((i) => i.skuCode === code)?.stock ?? 0;
  const totalUsd = lines.reduce((a, l) => a + l.qtyKg * l.priceUsdPerKg, 0);
  const list = state.salesOrders.filter((s) => status === "Semua" || s.status === status);

  const byCustomer = useMemo(
    () =>
      state.customers
        .map((c) => ({ name: c.name.split(" ")[0], value: state.salesOrders.filter((s) => s.customerId === c.id && s.status !== "Dibatalkan").reduce((a, s) => a + s.totalUsd, 0) }))
        .sort((a, b) => b.value - a.value),
    [state.customers, state.salesOrders]
  );

  function updateLine(i: number, patch: Partial<SalesOrderLine>) {
    setLines((prev) =>
      prev.map((l, idx) => {
        if (idx !== i) return l;
        const next = { ...l, ...patch };
        if (patch.skuCode) next.priceUsdPerKg = skus.find((s) => s.code === patch.skuCode)?.priceUsdPerKg ?? next.priceUsdPerKg;
        return next;
      })
    );
  }

  function createSo(e: React.FormEvent) {
    e.preventDefault();
    if (lines.some((l) => l.qtyKg <= 0)) return toast.error("Jumlah harus > 0.");
    const c = state.customers.find((x) => x.id === customerId);
    if (c && totalUsd > c.creditLimitUsd) {
      toast.error(`Melebihi credit limit ${c.name} (${fmtUsd(c.creditLimitUsd)}). Kurangi nilai order atau minta approval Finance.`);
      return;
    }
    dispatch({ type: "CREATE_SO", payload: { customerId, lines, salesRepId: "EMP-006", dueDate } });
    toast.success(`Quotation untuk ${customerName(customerId)} dibuat (${fmtUsd(totalUsd)}).`);
    setOpenSo(false);
    setLines([{ skuCode: skus[0].code, qtyKg: 1000, priceUsdPerKg: skus[0].priceUsdPerKg }]);
  }

  function act(so: SalesOrder, action: "confirm" | "ship" | "invoice" | "cancel") {
    if (action === "confirm") {
      dispatch({ type: "SET_SO_STATUS", id: so.id, status: "Dikonfirmasi" });
      toast.success(`${so.id} dikonfirmasi — Warehouse menyiapkan stok.`);
    } else if (action === "ship") {
      const short = so.lines.find((l) => fgStock(l.skuCode) < l.qtyKg);
      if (short) {
        toast.error(`Stok ${skuName(short.skuCode)} tidak cukup (${fgStock(short.skuCode).toLocaleString("id-ID")} kg < ${short.qtyKg.toLocaleString("id-ID")} kg). Jadwalkan WO di Operations.`);
        return;
      }
      dispatch({ type: "SHIP_SO", id: so.id, by: "Sari Dewi" });
      toast.success(`${so.id} dikirim — stok FG berkurang & HPP dijurnal.`);
    } else if (action === "invoice") {
      dispatch({ type: "INVOICE_SO", id: so.id });
      toast.success(`Invoice AR untuk ${so.id} diterbitkan di Finance.`);
    } else {
      dispatch({ type: "SET_SO_STATUS", id: so.id, status: "Dibatalkan" });
      toast(`${so.id} dibatalkan.`, { icon: "🚫" });
    }
    setDetail(null);
  }

  function addCustomer(e: React.FormEvent) {
    e.preventDefault();
    if (!cus.name.trim()) return;
    dispatch({ type: "ADD_CUSTOMER", payload: cus });
    toast.success(`Customer ${cus.name} ditambahkan.`);
    setOpenCus(false);
    setCus({ name: "", country: "Indonesia", segment: "Domestik", creditLimitUsd: 20000, contact: "", paymentTermDays: 14 });
  }

  return (
    <div>
      <ErpPageHeader
        team="Sales"
        title="Sales & Commercial"
        subtitle="Quotation → konfirmasi → pengiriman (stok Warehouse) → invoice (piutang Finance) → lunas. Credit limit customer divalidasi otomatis."
        actions={
          <>
            <ExportMenu label="Export" size="default" getDoc={() => buildErpReport("sales", state, "Bulan berjalan")} />
            <Button variant="outline" onClick={() => setOpenCus(true)}>
              <UserPlus className="h-4 w-4" /> Customer Baru
            </Button>
            <Button onClick={() => setOpenSo(true)}>
              <Plus className="h-4 w-4" /> Buat Quotation
            </Button>
          </>
        }
      />

      <div className="stagger mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard label="Revenue Bulan Ini" value={fmtUsd(derived.revenueMtdUsd)} icon={TrendingUp} accent="success" helperText={`≈ ${fmtRpShort(derived.revenueMtdUsd * KURS_USD)}`} />
        <KPICard label="Pipeline" value={fmtUsd(derived.pipelineUsd)} icon={Handshake} helperText={`${state.salesOrders.filter((s) => ["Quotation", "Dikonfirmasi"].includes(s.status)).length} order aktif`} />
        <KPICard label="Customer" value={String(state.customers.length)} icon={Globe2} helperText={`${state.customers.filter((c) => c.segment === "Ekspor").length} ekspor · ${state.customers.filter((c) => c.segment === "Domestik").length} domestik`} />
        <KPICard label="Menunggu Tagihan" value={String(state.salesOrders.filter((s) => s.status === "Dikirim").length)} icon={Receipt} accent="warning" helperText="sudah dikirim, belum ditagih" />
      </div>

      {/* Pipeline strip */}
      <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {PIPELINE.map((p, i) => {
          const so = state.salesOrders.filter((s) => s.status === p);
          const val = so.reduce((a, s) => a + s.totalUsd, 0);
          return (
            <button
              key={p}
              onClick={() => setStatus(status === p ? "Semua" : p)}
              className={cn(
                "rounded-xl border p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-soft",
                status === p ? "border-aruna-primary bg-aruna-light1" : "border-aruna-border bg-white"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-aruna-textSecondary">{i + 1}. {p}</span>
                <span className="rounded-full bg-aruna-bg px-1.5 text-[10px] font-semibold text-aruna-text">{so.length}</span>
              </div>
              <p className="mt-1.5 font-display text-base font-bold text-aruna-text">{fmtUsd(val)}</p>
            </button>
          );
        })}
      </div>

      <Tabs defaultValue="orders">
        <TabsList>
          <TabsTrigger value="orders">Sales Orders</TabsTrigger>
          <TabsTrigger value="customers">Customer</TabsTrigger>
          <TabsTrigger value="insight">Insight Penjualan</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <SectionCard
            title="Daftar Sales Order"
            description={status === "Semua" ? "Semua status" : `Filter: ${status}`}
            action={
              <Select value={status} onChange={(e) => setStatus(e.target.value)} className="h-9 w-44">
                {["Semua", ...PIPELINE, "Dibatalkan"].map((s) => <option key={s}>{s}</option>)}
              </Select>
            }
          >
            <Table wrapperClassName="rounded-none border-0">
              <TableHeader>
                <TableRow>
                  <TableHead>SO</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden 2xl:table-cell">Item</TableHead>
                  <TableHead className="text-right">Nilai</TableHead>
                  <TableHead>Sales</TableHead>
                  <TableHead>Jatuh Tempo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((so) => (
                  <TableRow key={so.id}>
                    <TableCell className="font-mono text-xs font-medium">{so.id}</TableCell>
                    <TableCell className="font-medium">{customerName(so.customerId)}</TableCell>
                    <TableCell className="hidden max-w-[220px] truncate text-xs text-aruna-textSecondary 2xl:table-cell">{so.lines.map((l) => `${skuName(l.skuCode)} ${l.qtyKg.toLocaleString("id-ID")} kg`).join(", ")}</TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">{fmtUsd(so.totalUsd)}</TableCell>
                    <TableCell className="text-xs">{employeeName(so.salesRepId)}</TableCell>
                    <TableCell className="text-xs">{fmtDate(so.dueDate)}</TableCell>
                    <TableCell><StatusBadge status={so.status} /></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button size="sm" variant="outline" onClick={() => setDetail(so)} title="Detail"><Eye className="h-3.5 w-3.5" /></Button>
                        {so.status === "Quotation" && <Button size="sm" onClick={() => act(so, "confirm")}><Check className="h-3.5 w-3.5" /> Konfirmasi</Button>}
                        {so.status === "Dikonfirmasi" && <Button size="sm" onClick={() => act(so, "ship")}><Truck className="h-3.5 w-3.5" /> Kirim</Button>}
                        {so.status === "Dikirim" && <Button size="sm" onClick={() => act(so, "invoice")}><FileText className="h-3.5 w-3.5" /> Tagih</Button>}
                        {(so.status === "Quotation" || so.status === "Dikonfirmasi") && (
                          <Button size="sm" variant="outline" className="text-aruna-error hover:bg-aruna-errorBg" onClick={() => act(so, "cancel")} title="Batalkan"><X className="h-3.5 w-3.5" /></Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </SectionCard>
        </TabsContent>

        <TabsContent value="customers">
          <div className="stagger grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {state.customers.map((c) => {
              const orders = state.salesOrders.filter((s) => s.customerId === c.id && s.status !== "Dibatalkan");
              const exposure = orders.filter((s) => ["Dikonfirmasi", "Dikirim", "Ditagih"].includes(s.status)).reduce((a, s) => a + s.totalUsd, 0);
              const pct = Math.min(100, Math.round((exposure / c.creditLimitUsd) * 100));
              return (
                <Card key={c.id} interactive className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-display text-sm font-semibold text-aruna-text">{c.name}</p>
                      <p className="text-xs text-aruna-textSecondary">{c.country} · termin {c.paymentTermDays} hari</p>
                    </div>
                    <Badge variant={c.segment === "Ekspor" ? "primary" : "outline"}>{c.segment}</Badge>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-[11px] text-aruna-textSecondary">
                      <span>Eksposur kredit</span>
                      <span className={cn("font-semibold", pct > 85 ? "text-aruna-error" : "text-aruna-text")}>{fmtUsd(exposure)} / {fmtUsd(c.creditLimitUsd)}</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-aruna-light1">
                      <div className={cn("h-full rounded-full", pct > 85 ? "bg-aruna-error" : pct > 60 ? "bg-aruna-warning" : "aruna-gradient")} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span className="text-aruna-textSecondary">{orders.length} order · {fmtUsd(orders.reduce((a, s) => a + s.totalUsd, 0))}</span>
                    <Button size="sm" variant="outline" onClick={() => { setCustomerId(c.id); setOpenSo(true); }}><Plus className="h-3.5 w-3.5" /> Quotation</Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="insight">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <SectionCard title="Nilai Order per Customer" description="Akumulasi seluruh SO aktif & selesai (USD)">
              <div className="h-72 px-3 py-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byCustomer} margin={{ left: -8, right: 12 }}>
                    <CartesianGrid stroke={CHART_GRID_COLOR} vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: CHART_AXIS_COLOR }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: CHART_AXIS_COLOR }} axisLine={false} tickLine={false} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                    <Tooltip {...chartTooltipStyle} formatter={(v: number) => fmtUsd(v)} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {byCustomer.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>
            <SectionCard title="Ketersediaan FG untuk Penjualan" description="Stok finished goods vs komitmen order yang dikonfirmasi">
              <div className="divide-y divide-aruna-border">
                {state.items.filter((i) => i.category === "Finished Goods").map((i) => {
                  const committed = state.salesOrders.filter((s) => s.status === "Dikonfirmasi").flatMap((s) => s.lines).filter((l) => l.skuCode === i.skuCode).reduce((a, l) => a + l.qtyKg, 0);
                  const free = i.stock - committed;
                  return (
                    <div key={i.id} className="flex items-center gap-3 px-5 py-3 text-sm">
                      <span className="min-w-0 flex-1 truncate text-aruna-text">{i.name}</span>
                      <span className="text-xs text-aruna-textSecondary">komit {committed.toLocaleString("id-ID")} kg</span>
                      <span className={cn("w-28 text-right font-semibold tabular-nums", free < 0 ? "text-aruna-error" : "text-aruna-success")}>{free.toLocaleString("id-ID")} kg bebas</span>
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create SO */}
      <Dialog open={openSo} onOpenChange={setOpenSo}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Buat Quotation</DialogTitle>
            <DialogDescription>Harga terisi dari master SKU FISH (USD/kg). Nilai divalidasi terhadap credit limit customer.</DialogDescription>
          </DialogHeader>
          <form onSubmit={createSo} className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Customer">
                <Select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                  {state.customers.map((c) => <option key={c.id} value={c.id}>{c.name} — {c.segment}</option>)}
                </Select>
              </Field>
              <Field label="Jatuh tempo pembayaran">
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
              </Field>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-aruna-text">Item</label>
                <Button type="button" size="sm" variant="outline" disabled={lines.length >= 4} onClick={() => setLines((p) => [...p, { skuCode: skus[0].code, qtyKg: 500, priceUsdPerKg: skus[0].priceUsdPerKg }])}>
                  <Plus className="h-3.5 w-3.5" /> Tambah baris
                </Button>
              </div>
              {lines.map((l, i) => (
                <div key={i} className="grid grid-cols-[1fr_90px_100px_36px] items-center gap-2">
                  <Select value={l.skuCode} onChange={(e) => updateLine(i, { skuCode: e.target.value })} className="h-9">
                    {skus.map((s) => <option key={s.code} value={s.code}>{s.name} · stok {fgStock(s.code).toLocaleString("id-ID")} kg</option>)}
                  </Select>
                  <Input type="number" min={1} value={l.qtyKg} onChange={(e) => updateLine(i, { qtyKg: Number(e.target.value) })} className="h-9" />
                  <Input type="number" min={0.1} step={0.01} value={l.priceUsdPerKg} onChange={(e) => updateLine(i, { priceUsdPerKg: Number(e.target.value) })} className="h-9" />
                  <button type="button" onClick={() => setLines((p) => p.filter((_, idx) => idx !== i))} disabled={lines.length === 1} className="flex h-9 w-9 items-center justify-center rounded-lg text-aruna-textSecondary hover:bg-aruna-errorBg hover:text-aruna-error disabled:opacity-40">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <p className="text-[11px] text-aruna-textSecondary">Kolom: SKU · kg · harga USD/kg.</p>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-aruna-bg px-4 py-3">
              <span className="text-sm text-aruna-textSecondary">Total quotation</span>
              <span className="font-display text-lg font-bold text-aruna-primary">{fmtUsd(totalUsd)} <span className="text-xs font-normal text-aruna-textSecondary">≈ {fmtRpShort(totalUsd * KURS_USD)}</span></span>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenSo(false)}>Batal</Button>
              <Button type="submit"><Plus className="h-4 w-4" /> Simpan Quotation</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Customer */}
      <Dialog open={openCus} onOpenChange={setOpenCus}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Customer Baru</DialogTitle>
            <DialogDescription>Data customer dipakai bersama oleh Sales dan Finance (termin & credit limit).</DialogDescription>
          </DialogHeader>
          <form onSubmit={addCustomer} className="space-y-3">
            <Field label="Nama perusahaan"><Input value={cus.name} onChange={(e) => setCus({ ...cus, name: e.target.value })} required /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Negara"><Input value={cus.country} onChange={(e) => setCus({ ...cus, country: e.target.value })} required /></Field>
              <Field label="Segmen">
                <Select value={cus.segment} onChange={(e) => setCus({ ...cus, segment: e.target.value as Customer["segment"] })}><option>Domestik</option><option>Ekspor</option></Select>
              </Field>
              <Field label="Credit limit (USD)"><Input type="number" min={0} value={cus.creditLimitUsd} onChange={(e) => setCus({ ...cus, creditLimitUsd: Number(e.target.value) })} /></Field>
              <Field label="Termin (hari)"><Input type="number" min={0} value={cus.paymentTermDays} onChange={(e) => setCus({ ...cus, paymentTermDays: Number(e.target.value) })} /></Field>
            </div>
            <Field label="Email kontak"><Input type="email" value={cus.contact} onChange={(e) => setCus({ ...cus, contact: e.target.value })} required /></Field>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenCus(false)}>Batal</Button>
              <Button type="submit"><UserPlus className="h-4 w-4" /> Simpan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail */}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-xl">
          {detail && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2"><DialogTitle>{detail.id}</DialogTitle><StatusBadge status={detail.status} /></div>
                <DialogDescription>{customerName(detail.customerId)} · sales {employeeName(detail.salesRepId)} · dibuat {fmtDate(detail.date)}{detail.linkedShipmentId ? ` · shipment ${detail.linkedShipmentId}` : ""}</DialogDescription>
              </DialogHeader>
              <div className="overflow-hidden rounded-lg border border-aruna-border">
                <table className="w-full text-xs">
                  <thead className="bg-aruna-light1 text-aruna-dark"><tr><th className="px-3 py-2 text-left">SKU</th><th className="px-3 py-2 text-right">kg</th><th className="px-3 py-2 text-right">USD/kg</th><th className="px-3 py-2 text-right">Subtotal</th></tr></thead>
                  <tbody className="divide-y divide-aruna-border">
                    {detail.lines.map((l, i) => (
                      <tr key={i}><td className="px-3 py-2">{skuName(l.skuCode)}</td><td className="px-3 py-2 text-right tabular-nums">{l.qtyKg.toLocaleString("id-ID")}</td><td className="px-3 py-2 text-right tabular-nums">{l.priceUsdPerKg.toFixed(2)}</td><td className="px-3 py-2 text-right font-semibold tabular-nums">{fmtUsd(l.qtyKg * l.priceUsdPerKg)}</td></tr>
                    ))}
                  </tbody>
                  <tfoot><tr className="bg-aruna-bg"><td colSpan={3} className="px-3 py-2 text-right font-medium">Total</td><td className="px-3 py-2 text-right font-bold text-aruna-primary">{fmtUsd(detail.totalUsd)}</td></tr></tfoot>
                </table>
              </div>
              <div className="mt-4 grid grid-cols-5 gap-1.5 text-[10px]">
                {PIPELINE.map((s, i) => {
                  const cur = PIPELINE.indexOf(detail.status);
                  const done = detail.status !== "Dibatalkan" && i <= cur;
                  return (
                    <div key={s} className="text-center">
                      <div className={cn("mx-auto mb-1 h-1.5 rounded-full", done ? "bg-aruna-primary" : "bg-aruna-light2")} />
                      <span className={done ? "font-medium text-aruna-text" : "text-aruna-textSecondary"}>{s}</span>
                    </div>
                  );
                })}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { exportSalesOrderPdf(detail, state, skuName); toast.success(`${detail.id}.pdf diunduh.`); }}><FileDown className="h-4 w-4" /> PDF {detail.status === "Quotation" ? "Quotation" : "SO"}</Button>
                {detail.status === "Quotation" && <Button onClick={() => act(detail, "confirm")}><Check className="h-4 w-4" /> Konfirmasi</Button>}
                {detail.status === "Dikonfirmasi" && <Button onClick={() => act(detail, "ship")}><Truck className="h-4 w-4" /> Kirim</Button>}
                {detail.status === "Dikirim" && <Button onClick={() => act(detail, "invoice")}><FileText className="h-4 w-4" /> Terbitkan Invoice</Button>}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
