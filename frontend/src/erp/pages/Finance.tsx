import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Wallet, ArrowDownToLine, ArrowUpFromLine, AlertCircle, BellRing, BadgeCheck, Search, FileDown } from "lucide-react";
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { KPICard } from "@/components/cards/KPICard";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/ui/badge-status";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { chartTooltipStyle, CHART_AXIS_COLOR, CHART_GRID_COLOR, CHART_COLORS, CHART_SUCCESS } from "@/components/charts/chart-theme";
import { useErp, fmtRp, fmtRpShort, effectiveInvoiceStatus } from "../ErpContext";
import { ErpPageHeader, SectionCard, TeamChip, fmtDate } from "../components/shared";
import { ExportMenu } from "../components/ExportMenu";
import { ReportPreview } from "../components/ReportPreview";
import { buildErpReport } from "../reports";
import { exportInvoicePdf, type ExportDoc } from "../export";
import type { ErpState } from "../types";
import type { ErpTeam, Invoice } from "../types";
import { cn } from "@/lib/utils";

const cashflow = [
  { bulan: "Apr", masuk: 2.41, keluar: 1.98 },
  { bulan: "Mei", masuk: 2.63, keluar: 2.12 },
  { bulan: "Jun", masuk: 2.35, keluar: 2.04 },
  { bulan: "Jul", masuk: 2.88, keluar: 2.31 },
  { bulan: "Agu", masuk: 3.02, keluar: 2.44 },
  { bulan: "Sep", masuk: 3.19, keluar: 2.5 },
].map((d) => ({ ...d, net: +(d.masuk - d.keluar).toFixed(2) }));

function daysDiff(a: string, b: string): number {
  return Math.round((new Date(a).getTime() - new Date(b).getTime()) / 86400000);
}

function InvoiceTable({ list, onPay, kind, state }: { list: Invoice[]; onPay: (id: string) => void; kind: "AR" | "AP"; state: ErpState }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("Semua");
  const filtered = list.filter((i) => {
    const st = effectiveInvoiceStatus(i);
    return (status === "Semua" || st === status) && (q === "" || i.counterparty.toLowerCase().includes(q.toLowerCase()) || i.id.toLowerCase().includes(q.toLowerCase()) || i.refId.toLowerCase().includes(q.toLowerCase()));
  });
  const today = new Date().toISOString().slice(0, 10);

  function remind(inv: Invoice) {
    toast.success(`Pengingat ${kind === "AR" ? "tagihan" : "pembayaran"} ${inv.id} dikirim ke ${inv.counterparty}.`);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 border-b border-aruna-border px-4 py-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-aruna-textSecondary" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Cari ${kind === "AR" ? "customer" : "supplier"}, nomor invoice, referensi...`} className="h-9 pl-9" />
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="h-9 w-48">
          {["Semua", "Belum Jatuh Tempo", "Jatuh Tempo", "Terlambat", "Lunas"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </Select>
        <ExportMenu
          getDoc={() => ({
            name: kind === "AR" ? "Daftar Piutang (AR)" : "Daftar Hutang (AP)",
            subtitle: `${filtered.length} invoice · filter: ${status}${q ? ` · "${q}"` : ""}`,
            summary: [
              { label: "Jumlah invoice", value: String(filtered.length) },
              { label: "Total nilai", value: fmtRpShort(filtered.reduce((a, i) => a + i.amount, 0)) },
              { label: "Belum lunas", value: fmtRpShort(filtered.filter((i) => i.status !== "Lunas").reduce((a, i) => a + i.amount, 0)) },
              { label: "Terlambat", value: String(filtered.filter((i) => effectiveInvoiceStatus(i) === "Terlambat").length) },
            ],
            tables: [{
              title: kind === "AR" ? "Piutang usaha" : "Hutang usaha",
              columns: [{ key: "id", label: "Invoice" }, { key: "c", label: kind === "AR" ? "Customer" : "Supplier" }, { key: "r", label: "Referensi" }, { key: "a", label: "Nilai (Rp)", numeric: true }, { key: "i", label: "Terbit" }, { key: "d", label: "Jatuh tempo" }, { key: "s", label: "Status" }],
              rows: filtered.map((i) => [i.id, i.counterparty, i.refId, i.amount, i.issuedDate, i.dueDate, effectiveInvoiceStatus(i)]),
            }],
          })}
        />
      </div>
      {filtered.length === 0 ? (
        <div className="p-6"><EmptyState title="Tidak ada invoice" description="Ubah filter atau kata kunci pencarian." /></div>
      ) : (
        <Table wrapperClassName="rounded-none border-0">
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>{kind === "AR" ? "Customer" : "Supplier"}</TableHead>
              <TableHead>Referensi</TableHead>
              <TableHead className="text-right">Nilai</TableHead>
              <TableHead className="hidden 2xl:table-cell">Terbit</TableHead>
              <TableHead>Jatuh Tempo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((inv) => {
              const st = effectiveInvoiceStatus(inv);
              const late = st === "Terlambat" ? daysDiff(today, inv.dueDate) : 0;
              return (
                <TableRow key={inv.id}>
                  <TableCell className="font-mono text-xs font-medium">{inv.id}</TableCell>
                  <TableCell className="font-medium">{inv.counterparty}</TableCell>
                  <TableCell className="font-mono text-xs text-aruna-textSecondary">{inv.refId}</TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">{fmtRp(inv.amount)}</TableCell>
                  <TableCell className="hidden text-xs 2xl:table-cell">{fmtDate(inv.issuedDate)}</TableCell>
                  <TableCell className="text-xs">
                    {fmtDate(inv.dueDate)}
                    {late > 0 && <span className="ml-1.5 rounded bg-aruna-errorBg px-1 py-0.5 text-[10px] font-semibold text-aruna-error">+{late} hr</span>}
                  </TableCell>
                  <TableCell><StatusBadge status={st} /></TableCell>
                  <TableCell className="text-right">
                    {st === "Lunas" ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="text-xs text-aruna-textSecondary">Lunas {inv.paidDate ? fmtDate(inv.paidDate) : ""}</span>
                        <Button size="sm" variant="ghost" onClick={() => { exportInvoicePdf(inv, state); toast.success(`${inv.id}.pdf diunduh.`); }} title="Unduh PDF invoice">
                          <FileDown className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-1.5">
                        <Button size="sm" variant="outline" onClick={() => { exportInvoicePdf(inv, state); toast.success(`${inv.id}.pdf diunduh.`); }} title="Unduh PDF invoice">
                          <FileDown className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => remind(inv)} title="Kirim pengingat">
                          <BellRing className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" onClick={() => onPay(inv.id)}>
                          <BadgeCheck className="h-3.5 w-3.5" />
                          {kind === "AR" ? "Terima" : "Bayar"}
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

export default function Finance() {
  const { state, derived, dispatch } = useErp();
  const [journalTeam, setJournalTeam] = useState<"Semua" | ErpTeam>("Semua");
  const [preview, setPreview] = useState<ExportDoc | null>(null);

  const ar = state.invoices.filter((i) => i.kind === "AR");
  const ap = state.invoices.filter((i) => i.kind === "AP");

  const aging = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const buckets = [
      { label: "Belum jatuh tempo", min: -Infinity, max: 0, amount: 0 },
      { label: "1–30 hari", min: 1, max: 30, amount: 0 },
      { label: "31–60 hari", min: 31, max: 60, amount: 0 },
      { label: "> 60 hari", min: 61, max: Infinity, amount: 0 },
    ];
    ar.filter((i) => i.status !== "Lunas").forEach((i) => {
      const d = daysDiff(today, i.dueDate);
      const b = buckets.find((x) => d >= x.min && d <= x.max) ?? buckets[0];
      b.amount += i.amount;
    });
    const total = buckets.reduce((a, b) => a + b.amount, 0) || 1;
    return buckets.map((b) => ({ ...b, pct: Math.round((b.amount / total) * 100) }));
  }, [ar]);

  function pay(id: string) {
    const inv = state.invoices.find((i) => i.id === id);
    dispatch({ type: "PAY_INVOICE", id });
    if (inv) toast.success(`${inv.id} ${inv.kind === "AR" ? "diterima" : "dibayar"} — kas & jurnal diperbarui.`);
  }

  const journalRows = state.journal.filter((j) => journalTeam === "Semua" || j.source === journalTeam);

  return (
    <div>
      <ErpPageHeader
        team="Finance"
        title="Finance"
        subtitle="Piutang, hutang, jurnal otomatis, dan anggaran — setiap transaksi dari tim lain langsung tercatat di sini."
        actions={
          <ExportMenu
            label="Laporan Keuangan"
            variant="default"
            size="default"
            getDoc={() => buildErpReport("finance-summary", state, "Bulan berjalan")}
            onPreview={() => setPreview(buildErpReport("finance-summary", state, "Bulan berjalan"))}
          />
        }
      />

      <div className="stagger mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard label="Posisi Kas & Bank" value={fmtRpShort(state.cashRp)} icon={Wallet} accent="success" helperText="saldo saat ini" />
        <KPICard label="Piutang Outstanding" value={fmtRpShort(derived.arOutstanding)} icon={ArrowDownToLine} helperText={`${ar.filter((i) => i.status !== "Lunas").length} invoice AR`} />
        <KPICard label="Hutang Outstanding" value={fmtRpShort(derived.apOutstanding)} icon={ArrowUpFromLine} accent="warning" helperText={`${ap.filter((i) => i.status !== "Lunas").length} tagihan AP`} />
        <KPICard label="Invoice Terlambat" value={String(derived.overdueCount)} icon={AlertCircle} accent={derived.overdueCount > 0 ? "error" : "success"} helperText="AR + AP melewati jatuh tempo" />
      </div>

      <Tabs defaultValue="ringkasan">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="ringkasan">Ringkasan</TabsTrigger>
          <TabsTrigger value="ar">Piutang (AR)</TabsTrigger>
          <TabsTrigger value="ap">Hutang (AP)</TabsTrigger>
          <TabsTrigger value="jurnal">Jurnal Umum</TabsTrigger>
          <TabsTrigger value="anggaran">Anggaran</TabsTrigger>
        </TabsList>

        <TabsContent value="ringkasan">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <SectionCard title="Arus Kas 6 Bulan" description="Pemasukan vs pengeluaran (Rp miliar), ilustratif" className="xl:col-span-2">
              <div className="h-72 px-3 py-4">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={cashflow} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                    <CartesianGrid stroke={CHART_GRID_COLOR} vertical={false} />
                    <XAxis dataKey="bulan" tick={{ fontSize: 12, fill: CHART_AXIS_COLOR }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: CHART_AXIS_COLOR }} axisLine={false} tickLine={false} />
                    <Tooltip {...chartTooltipStyle} formatter={(v: number) => `Rp${v.toFixed(2).replace(".", ",")} M`} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="masuk" name="Pemasukan" fill={CHART_COLORS[1]} radius={[6, 6, 0, 0]} />
                    <Bar dataKey="keluar" name="Pengeluaran" fill={CHART_COLORS[5]} radius={[6, 6, 0, 0]} />
                    <Line type="monotone" dataKey="net" name="Arus kas bersih" stroke={CHART_SUCCESS} strokeWidth={2.5} dot={{ r: 3 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>
            <SectionCard title="Aging Piutang" description="Distribusi piutang belum lunas berdasarkan keterlambatan">
              <div className="space-y-4 p-5">
                {aging.map((b, i) => (
                  <div key={b.label}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium text-aruna-text">{b.label}</span>
                      <span className="text-aruna-textSecondary">{fmtRpShort(b.amount)} · {b.pct}%</span>
                    </div>
                    <Progress value={b.pct} variant={i === 0 ? "success" : i === 1 ? "default" : i === 2 ? "warning" : "error"} />
                  </div>
                ))}
                <p className="border-t border-aruna-border pt-3 text-[11px] text-aruna-textSecondary">
                  Total piutang belum lunas {fmtRpShort(derived.arOutstanding)}. Tindak lanjut pengingat dapat dikirim dari tab Piutang.
                </p>
              </div>
            </SectionCard>
          </div>
        </TabsContent>

        <TabsContent value="ar">
          <SectionCard title="Piutang Usaha (Accounts Receivable)" description="Invoice ke customer — otomatis dibuat saat Sales menagih pengiriman">
            <InvoiceTable list={ar} onPay={pay} kind="AR" state={state} />
          </SectionCard>
        </TabsContent>

        <TabsContent value="ap">
          <SectionCard title="Hutang Usaha (Accounts Payable)" description="Tagihan supplier — otomatis dibuat saat Warehouse menerima PO">
            <InvoiceTable list={ap} onPay={pay} kind="AP" state={state} />
          </SectionCard>
        </TabsContent>

        <TabsContent value="jurnal">
          <SectionCard
            title="Jurnal Umum"
            description="Entri jurnal double-entry yang dihasilkan otomatis oleh transaksi lintas tim"
            action={
              <div className="flex gap-2">
                <Select value={journalTeam} onChange={(e) => setJournalTeam(e.target.value as "Semua" | ErpTeam)} className="h-9 w-44">
                  {["Semua", "Finance", "Warehouse", "Operations", "Sales", "Procurement"].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </Select>
                <ExportMenu getDoc={() => ({ ...buildErpReport("journal", state, "Semua"), tables: [{ ...buildErpReport("journal", state, "").tables[0], rows: journalRows.map((j) => [j.id, j.date, j.description, j.debit, j.credit, j.amount, j.ref, j.source]) }] })} />
              </div>
            }
          >
            <Table wrapperClassName="rounded-none border-0">
              <TableHeader>
                <TableRow>
                  <TableHead>No.</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Debit</TableHead>
                  <TableHead>Kredit</TableHead>
                  <TableHead className="text-right">Nilai</TableHead>
                  <TableHead>Sumber</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {journalRows.map((j) => (
                  <TableRow key={j.id}>
                    <TableCell className="font-mono text-xs">{j.id}</TableCell>
                    <TableCell className="text-xs">{fmtDate(j.date)}</TableCell>
                    <TableCell className="max-w-[260px] whitespace-normal">
                      {j.description}
                      <span className="ml-1.5 rounded bg-aruna-bg px-1 py-0.5 font-mono text-[10px] text-aruna-textSecondary">{j.ref}</span>
                    </TableCell>
                    <TableCell className="text-xs">{j.debit}</TableCell>
                    <TableCell className="text-xs">{j.credit}</TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">{fmtRp(j.amount)}</TableCell>
                    <TableCell><TeamChip team={j.source} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </SectionCard>
        </TabsContent>

        <TabsContent value="anggaran">
          <SectionCard title="Anggaran vs Realisasi" description="Bulan berjalan per departemen" action={<ExportMenu getDoc={() => buildErpReport("budget", state, "Bulan berjalan")} onPreview={() => setPreview(buildErpReport("budget", state, "Bulan berjalan"))} />}>
            <div className="divide-y divide-aruna-border">
              {state.budgets.map((b) => {
                const pct = Math.round((b.actual / b.budget) * 100);
                return (
                  <div key={b.department} className="grid grid-cols-1 items-center gap-3 px-5 py-3.5 sm:grid-cols-[180px_1fr_200px]">
                    <TeamChip team={b.department} className="w-fit" />
                    <div>
                      <Progress value={pct} variant={pct > 90 ? "error" : pct > 75 ? "warning" : "default"} />
                    </div>
                    <div className="text-right text-xs">
                      <span className={cn("font-semibold", pct > 90 ? "text-aruna-error" : "text-aruna-text")}>{pct}%</span>
                      <span className="text-aruna-textSecondary"> · {fmtRpShort(b.actual)} / {fmtRpShort(b.budget)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>
      <ReportPreview doc={preview} onClose={() => setPreview(null)} />
    </div>
  );
}
