import { useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { Factory, Play, CheckCircle2, PauseCircle, Plus, Wrench, CalendarClock, Gauge, RotateCcw, ExternalLink } from "lucide-react";
import { KPICard } from "@/components/cards/KPICard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/badge-status";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { skus } from "@/data/skus";
import { useErp } from "../ErpContext";
import { ErpPageHeader, SectionCard, Field, TeamChip, fmtDate } from "../components/shared";
import { ExportMenu } from "../components/ExportMenu";
import { buildErpReport } from "../reports";
import type { WorkOrder, WorkOrderStatus, MaintenanceTicket } from "../types";
import { cn } from "@/lib/utils";

const COLUMNS: { status: WorkOrderStatus; tone: string }[] = [
  { status: "Terjadwal", tone: "border-t-aruna-secondary" },
  { status: "Berjalan", tone: "border-t-aruna-primary" },
  { status: "Selesai", tone: "border-t-aruna-success" },
  { status: "Tertunda", tone: "border-t-aruna-error" },
];

const LINES = ["Bandsaw Line 1", "Bandsaw Line 2", "Trimming Station A", "Trimming Station B", "Grinding Line", "Vacuum Packing"];

export default function Operations() {
  const { state, dispatch, employeeName, skuName } = useErp();
  const [openWo, setOpenWo] = useState(false);
  const [complete, setComplete] = useState<WorkOrder | null>(null);
  const [actualKg, setActualKg] = useState(0);
  const [openTicket, setOpenTicket] = useState(false);

  // WO form
  const [skuCode, setSkuCode] = useState<string>(skus[0]?.code ?? "");
  const [plannedKg, setPlannedKg] = useState(1000);
  const [shift, setShift] = useState<WorkOrder["shift"]>("Shift 1");
  const [line, setLine] = useState(LINES[0]);
  const [supervisorId, setSupervisorId] = useState("EMP-005");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  // Ticket form
  const [machine, setMachine] = useState(LINES[0]);
  const [issue, setIssue] = useState("");
  const [priority, setPriority] = useState<MaintenanceTicket["priority"]>("Sedang");

  const sku = skus.find((s) => s.code === skuCode);
  const rawNeed = sku ? Math.round(plannedKg / (sku.yieldFromLoinPct / 100)) : plannedKg;
  const loinStock = state.items.find((i) => i.id === "ITM-003")?.stock ?? 0;

  const running = state.workOrders.filter((w) => w.status === "Berjalan");
  const done = state.workOrders.filter((w) => w.status === "Selesai");
  const avgYield = done.length ? done.reduce((a, w) => a + (w.actualKg ?? 0) / w.plannedKg, 0) / done.length : 0;
  const openTickets = state.tickets.filter((t) => t.status !== "Selesai");
  const operators = state.employees.filter((e) => ["Operations", "Quality", "Engineering"].includes(e.team));

  function createWo(e: React.FormEvent) {
    e.preventDefault();
    dispatch({ type: "CREATE_WO", payload: { skuCode, plannedKg, rawMaterialKg: rawNeed, shift, line, supervisorId, date } });
    toast.success(`Work order ${skuName(skuCode)} ${plannedKg} kg dijadwalkan.`);
    setOpenWo(false);
  }

  function start(wo: WorkOrder) {
    if (loinStock < wo.rawMaterialKg) {
      toast.error(`Stok Fresh Loin tidak cukup (${loinStock.toLocaleString("id-ID")} kg < ${wo.rawMaterialKg.toLocaleString("id-ID")} kg). Koordinasikan dengan Warehouse.`);
      return;
    }
    dispatch({ type: "START_WO", id: wo.id });
    toast.success(`${wo.id} dimulai — ${wo.rawMaterialKg.toLocaleString("id-ID")} kg loin dikonsumsi dari stok.`);
  }

  function finish(e: React.FormEvent) {
    e.preventDefault();
    if (!complete || actualKg <= 0) return;
    dispatch({ type: "COMPLETE_WO", id: complete.id, actualKg });
    toast.success(`${complete.id} selesai — ${actualKg.toLocaleString("id-ID")} kg masuk cold storage & jurnal produksi tercatat.`);
    setComplete(null);
  }

  function createTicket(e: React.FormEvent) {
    e.preventDefault();
    if (!issue.trim()) return;
    dispatch({ type: "CREATE_TICKET", payload: { machine, issue, priority, reportedBy: "Dedi Pratama" } });
    toast.success("Tiket maintenance dibuat dan diteruskan ke Engineering.");
    setOpenTicket(false);
    setIssue("");
  }

  return (
    <div>
      <ErpPageHeader
        team="Operations"
        title="Operations"
        subtitle="Work order terhubung ke Production Plan FISH; memulai WO mengonsumsi Fresh Loin dan menyelesaikannya menambah stok finished goods."
        actions={
          <>
            <ExportMenu label="Export" size="default" getDoc={() => buildErpReport("production", state, "Bulan berjalan")} />
            <Button variant="outline" onClick={() => setOpenTicket(true)}>
              <Wrench className="h-4 w-4" />
              Lapor Kerusakan
            </Button>
            <Button onClick={() => setOpenWo(true)}>
              <Plus className="h-4 w-4" />
              Work Order Baru
            </Button>
          </>
        }
      />

      <div className="stagger mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard label="WO Berjalan" value={String(running.length)} icon={Factory} helperText={`${running.reduce((a, w) => a + w.plannedKg, 0).toLocaleString("id-ID")} kg target`} />
        <KPICard label="Yield vs Plan" value={`${(avgYield * 100).toFixed(1).replace(".", ",")}%`} icon={Gauge} accent="success" helperText={`${done.length} WO selesai`} />
        <KPICard label="Stok Fresh Loin" value={`${loinStock.toLocaleString("id-ID")} kg`} icon={CalendarClock} accent={loinStock < 1500 ? "error" : "primary"} helperText="siap diproses" />
        <KPICard label="Tiket Maintenance" value={String(openTickets.length)} icon={Wrench} accent={openTickets.some((t) => t.priority === "Tinggi") ? "error" : "warning"} helperText="terbuka / dikerjakan" />
      </div>

      <Tabs defaultValue="board">
        <TabsList>
          <TabsTrigger value="board">Papan Work Order</TabsTrigger>
          <TabsTrigger value="maint">Maintenance</TabsTrigger>
          <TabsTrigger value="shift">Roster Shift</TabsTrigger>
        </TabsList>

        <TabsContent value="board">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {COLUMNS.map((col) => {
              const items = state.workOrders.filter((w) => w.status === col.status);
              return (
                <div key={col.status} className={cn("rounded-xl border border-aruna-border border-t-4 bg-aruna-bg/60 p-3", col.tone)}>
                  <div className="mb-3 flex items-center justify-between px-1">
                    <p className="font-display text-sm font-semibold text-aruna-text">{col.status}</p>
                    <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-aruna-textSecondary ring-1 ring-aruna-border">{items.length}</span>
                  </div>
                  <div className="space-y-3">
                    {items.length === 0 && <p className="rounded-lg border border-dashed border-aruna-border px-3 py-6 text-center text-xs text-aruna-textSecondary">Kosong</p>}
                    {items.map((wo) => {
                      const pct = wo.actualKg ? Math.round((wo.actualKg / wo.plannedKg) * 100) : wo.status === "Berjalan" ? 55 : 0;
                      return (
                        <Card key={wo.id} className="p-3.5 hover-lift">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-aruna-text">{skuName(wo.skuCode)}</p>
                              <p className="font-mono text-[10px] text-aruna-textSecondary">{wo.id}{wo.linkedPlanId ? ` · ${wo.linkedPlanId}` : ""}</p>
                            </div>
                            <Badge variant="outline" className="shrink-0">{wo.shift}</Badge>
                          </div>
                          <p className="mt-2 text-xs text-aruna-textSecondary">{wo.line} · {fmtDate(wo.date)}</p>
                          <div className="mt-2 flex items-center justify-between text-xs">
                            <span className="text-aruna-textSecondary">Target</span>
                            <span className="font-semibold text-aruna-text">{wo.plannedKg.toLocaleString("id-ID")} kg</span>
                          </div>
                          {(wo.status === "Berjalan" || wo.status === "Selesai") && (
                            <div className="mt-1.5">
                              <Progress value={pct} variant={wo.status === "Selesai" ? "success" : "default"} className="h-1.5" />
                              <p className="mt-1 text-[10px] text-aruna-textSecondary">
                                {wo.status === "Selesai" ? `Aktual ${wo.actualKg?.toLocaleString("id-ID")} kg (${pct}%)` : "Sedang diproses"}
                              </p>
                            </div>
                          )}
                          <p className="mt-2 text-[11px] text-aruna-textSecondary">PIC: {employeeName(wo.supervisorId)}</p>
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {wo.status === "Terjadwal" && (
                              <>
                                <Button size="sm" onClick={() => start(wo)}><Play className="h-3.5 w-3.5" /> Mulai</Button>
                                <Button size="sm" variant="outline" onClick={() => { dispatch({ type: "SET_WO_STATUS", id: wo.id, status: "Tertunda" }); toast(`${wo.id} ditunda.`, { icon: "⏸️" }); }}>
                                  <PauseCircle className="h-3.5 w-3.5" />
                                </Button>
                              </>
                            )}
                            {wo.status === "Berjalan" && (
                              <Button size="sm" onClick={() => { setComplete(wo); setActualKg(Math.round(wo.plannedKg * 0.97)); }}>
                                <CheckCircle2 className="h-3.5 w-3.5" /> Selesaikan
                              </Button>
                            )}
                            {wo.status === "Tertunda" && (
                              <Button size="sm" variant="outline" onClick={() => { dispatch({ type: "SET_WO_STATUS", id: wo.id, status: "Terjadwal" }); toast.success(`${wo.id} dijadwalkan ulang.`); }}>
                                <RotateCcw className="h-3.5 w-3.5" /> Jadwalkan ulang
                              </Button>
                            )}
                            {wo.status === "Selesai" && wo.linkedPlanId && (
                              <Button asChild size="sm" variant="ghost">
                                <Link to="/app/performance"><ExternalLink className="h-3.5 w-3.5" /> Plan vs Actual</Link>
                              </Button>
                            )}
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="maint">
          <SectionCard title="Tiket Maintenance" description="Laporan kerusakan dari Operations ditindaklanjuti tim Engineering">
            <div className="divide-y divide-aruna-border">
              {state.tickets.map((t) => (
                <div key={t.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-aruna-textSecondary">{t.id}</span>
                      <p className="text-sm font-semibold text-aruna-text">{t.machine}</p>
                      <StatusBadge status={t.priority} />
                      <StatusBadge status={t.status} />
                    </div>
                    <p className="mt-1 text-sm text-aruna-textSecondary">{t.issue}</p>
                    <p className="mt-1 text-[11px] text-aruna-textSecondary">Dilaporkan {t.reportedBy} · {fmtDate(t.date)} · <TeamChip team="Engineering" /></p>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    {t.status === "Terbuka" && (
                      <Button size="sm" variant="outline" onClick={() => { dispatch({ type: "SET_TICKET_STATUS", id: t.id, status: "Dikerjakan" }); toast.success(`${t.id} mulai dikerjakan Engineering.`); }}>
                        <Wrench className="h-3.5 w-3.5" /> Kerjakan
                      </Button>
                    )}
                    {t.status === "Dikerjakan" && (
                      <Button size="sm" onClick={() => { dispatch({ type: "SET_TICKET_STATUS", id: t.id, status: "Selesai" }); toast.success(`${t.id} selesai diperbaiki.`); }}>
                        <CheckCircle2 className="h-3.5 w-3.5" /> Selesai
                      </Button>
                    )}
                    {t.status === "Selesai" && <span className="text-xs text-aruna-success">✓ Diperbaiki</span>}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="shift">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {(["Shift 1", "Shift 2", "Shift 3"] as const).map((s) => {
              const crew = operators.filter((e) => e.shift === s);
              const wos = state.workOrders.filter((w) => w.shift === s && w.status !== "Selesai");
              return (
                <SectionCard key={s} title={s} description={s === "Shift 1" ? "06.00–14.00" : s === "Shift 2" ? "14.00–22.00" : "22.00–06.00"} action={<Badge variant="outline">{crew.length} personel</Badge>}>
                  <div className="p-4">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-aruna-textSecondary">Personel</p>
                    {crew.length === 0 && <p className="text-xs text-aruna-textSecondary">Belum ada personel terjadwal.</p>}
                    <ul className="space-y-1.5">
                      {crew.map((e) => (
                        <li key={e.id} className="flex items-center gap-2 text-sm">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-aruna-light1 text-[10px] font-semibold text-aruna-primary">{e.initials}</span>
                          <span className="flex-1 truncate text-aruna-text">{e.name}</span>
                          <StatusBadge status={e.status} />
                        </li>
                      ))}
                    </ul>
                    <p className="mb-2 mt-4 text-[10px] font-semibold uppercase tracking-wide text-aruna-textSecondary">Work order aktif</p>
                    {wos.length === 0 ? (
                      <p className="text-xs text-aruna-textSecondary">Tidak ada.</p>
                    ) : (
                      <ul className="space-y-1">
                        {wos.map((w) => (
                          <li key={w.id} className="flex items-center justify-between rounded-md bg-aruna-bg px-2.5 py-1.5 text-xs">
                            <span className="text-aruna-text">{skuName(w.skuCode)}</span>
                            <StatusBadge status={w.status} />
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </SectionCard>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create WO */}
      <Dialog open={openWo} onOpenChange={setOpenWo}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Work Order Baru</DialogTitle>
            <DialogDescription>Kebutuhan Fresh Loin dihitung otomatis dari yield SKU. Stok loin saat ini {loinStock.toLocaleString("id-ID")} kg.</DialogDescription>
          </DialogHeader>
          <form onSubmit={createWo} className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="SKU">
                <Select value={skuCode} onChange={(e) => setSkuCode(e.target.value)}>
                  {skus.map((s) => (
                    <option key={s.code} value={s.code}>{s.name} — yield {s.yieldFromLoinPct}%</option>
                  ))}
                </Select>
              </Field>
              <Field label="Target output (kg)">
                <Input type="number" min={50} value={plannedKg} onChange={(e) => setPlannedKg(Number(e.target.value))} required />
              </Field>
              <Field label="Shift">
                <Select value={shift} onChange={(e) => setShift(e.target.value as WorkOrder["shift"])}>
                  <option>Shift 1</option><option>Shift 2</option><option>Shift 3</option>
                </Select>
              </Field>
              <Field label="Lini / Mesin">
                <Select value={line} onChange={(e) => setLine(e.target.value)}>
                  {LINES.map((l) => <option key={l}>{l}</option>)}
                </Select>
              </Field>
              <Field label="Supervisor">
                <Select value={supervisorId} onChange={(e) => setSupervisorId(e.target.value)}>
                  {state.employees.filter((e) => e.team === "Operations").map((e) => (
                    <option key={e.id} value={e.id}>{e.name} — {e.position}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Tanggal">
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </Field>
            </div>
            <div className={cn("flex items-center justify-between rounded-lg px-4 py-3", rawNeed > loinStock ? "bg-aruna-errorBg text-aruna-error" : "bg-aruna-bg text-aruna-text")}>
              <span className="text-sm">Kebutuhan Fresh Loin</span>
              <span className="font-display text-lg font-bold">{rawNeed.toLocaleString("id-ID")} kg</span>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenWo(false)}>Batal</Button>
              <Button type="submit"><Plus className="h-4 w-4" /> Jadwalkan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Complete WO */}
      <Dialog open={!!complete} onOpenChange={(o) => !o && setComplete(null)}>
        <DialogContent>
          {complete && (
            <>
              <DialogHeader>
                <DialogTitle>Selesaikan {complete.id}</DialogTitle>
                <DialogDescription>{skuName(complete.skuCode)} · target {complete.plannedKg.toLocaleString("id-ID")} kg. Output aktual akan masuk ke stok finished goods dan jurnal produksi.</DialogDescription>
              </DialogHeader>
              <form onSubmit={finish} className="space-y-4">
                <Field label="Output aktual (kg)">
                  <Input type="number" min={1} value={actualKg} onChange={(e) => setActualKg(Number(e.target.value))} required />
                </Field>
                <div className="rounded-lg bg-aruna-bg px-4 py-3 text-sm">
                  Yield vs plan:{" "}
                  <strong className={actualKg / complete.plannedKg >= 0.95 ? "text-aruna-success" : "text-aruna-warning"}>
                    {((actualKg / complete.plannedKg) * 100).toFixed(1).replace(".", ",")}%
                  </strong>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setComplete(null)}>Batal</Button>
                  <Button type="submit"><CheckCircle2 className="h-4 w-4" /> Konfirmasi Selesai</Button>
                </DialogFooter>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Ticket */}
      <Dialog open={openTicket} onOpenChange={setOpenTicket}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lapor Kerusakan Mesin</DialogTitle>
            <DialogDescription>Tiket diteruskan ke tim Engineering dan tampil di aktivitas terintegrasi.</DialogDescription>
          </DialogHeader>
          <form onSubmit={createTicket} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Mesin">
                <Select value={machine} onChange={(e) => setMachine(e.target.value)}>
                  {[...LINES, "Freezer Tunnel 1", "Freezer Tunnel 2", "Chiller A", "Chiller B", "Vacuum Packer A"].map((m) => <option key={m}>{m}</option>)}
                </Select>
              </Field>
              <Field label="Prioritas">
                <Select value={priority} onChange={(e) => setPriority(e.target.value as MaintenanceTicket["priority"])}>
                  <option>Rendah</option><option>Sedang</option><option>Tinggi</option>
                </Select>
              </Field>
            </div>
            <Field label="Deskripsi masalah">
              <Input value={issue} onChange={(e) => setIssue(e.target.value)} placeholder="Mis. suhu freezer tidak stabil" required />
            </Field>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenTicket(false)}>Batal</Button>
              <Button type="submit"><Wrench className="h-4 w-4" /> Kirim Tiket</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
