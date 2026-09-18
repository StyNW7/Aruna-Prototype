import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Users, UserCheck, CalendarOff, Plus, Search, Check, X, Mail } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { KPICard } from "@/components/cards/KPICard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/badge-status";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { chartTooltipStyle, CHART_AXIS_COLOR, CHART_GRID_COLOR } from "@/components/charts/chart-theme";
import { useErp } from "../ErpContext";
import { TEAM_META } from "../config";
import { ErpPageHeader, SectionCard, Field, TeamChip, fmtDate } from "../components/shared";
import { ExportMenu } from "../components/ExportMenu";
import { buildErpReport } from "../reports";
import type { Employee, ErpTeam, LeaveRequest } from "../types";
import { cn } from "@/lib/utils";

const ATTENDANCE: Employee["status"][] = ["Hadir", "Cuti", "Sakit", "Izin", "Belum Absen"];

export default function HR() {
  const { state, dispatch, employeeName, derived } = useErp();
  const [q, setQ] = useState("");
  const [team, setTeam] = useState<"Semua" | ErpTeam>("Semua");
  const [openLeave, setOpenLeave] = useState(false);
  const [lv, setLv] = useState<Omit<LeaveRequest, "id" | "status">>({ employeeId: state.employees[0]?.id ?? "", type: "Cuti Tahunan", from: new Date().toISOString().slice(0, 10), to: new Date().toISOString().slice(0, 10), days: 1, reason: "" });

  const list = state.employees.filter(
    (e) => (team === "Semua" || e.team === team) && (q === "" || e.name.toLowerCase().includes(q.toLowerCase()) || e.position.toLowerCase().includes(q.toLowerCase()))
  );

  const headcount = useMemo(
    () => (Object.keys(TEAM_META) as ErpTeam[]).map((t) => ({ name: t, total: state.employees.filter((e) => e.team === t).length, hadir: state.employees.filter((e) => e.team === t && e.status === "Hadir").length })),
    [state.employees]
  );

  const pendingLeaves = state.leaves.filter((l) => l.status === "Menunggu");
  const attendanceRate = Math.round((derived.presentToday / state.employees.length) * 100);

  function submitLeave(e: React.FormEvent) {
    e.preventDefault();
    const days = Math.max(1, Math.round((new Date(lv.to).getTime() - new Date(lv.from).getTime()) / 86400000) + 1);
    if (!lv.reason.trim()) return toast.error("Isi alasan pengajuan.");
    dispatch({ type: "SUBMIT_LEAVE", payload: { ...lv, days } });
    toast.success("Pengajuan cuti dikirim ke atasan untuk persetujuan.");
    setOpenLeave(false);
    setLv({ ...lv, reason: "" });
  }

  return (
    <div>
      <ErpPageHeader
        team="HR"
        title="HR & People"
        subtitle="Direktori karyawan lintas tim, kehadiran hari ini, roster shift, dan pengajuan cuti yang terhubung ke Approval Center."
        actions={
          <>
            <ExportMenu label="Export" size="default" getDoc={() => buildErpReport("hr", state, "Hari ini")} />
            <Button onClick={() => setOpenLeave(true)}>
              <Plus className="h-4 w-4" /> Ajukan Cuti
            </Button>
          </>
        }
      />

      <div className="stagger mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard label="Total Karyawan" value={String(state.employees.length)} icon={Users} helperText="8 tim" />
        <KPICard label="Hadir Hari Ini" value={`${derived.presentToday}`} icon={UserCheck} accent="success" helperText={`${attendanceRate}% tingkat kehadiran`} sparkline={[88, 91, 86, 92, 90, attendanceRate]} />
        <KPICard label="Cuti / Sakit / Izin" value={String(state.employees.filter((e) => ["Cuti", "Sakit", "Izin"].includes(e.status)).length)} icon={CalendarOff} accent="warning" helperText="tidak di tempat" />
        <KPICard label="Pengajuan Menunggu" value={String(pendingLeaves.length)} icon={CalendarOff} accent={pendingLeaves.length ? "error" : "success"} helperText="perlu persetujuan" />
      </div>

      <Tabs defaultValue="direktori">
        <TabsList>
          <TabsTrigger value="direktori">Direktori</TabsTrigger>
          <TabsTrigger value="cuti">Pengajuan Cuti</TabsTrigger>
          <TabsTrigger value="headcount">Headcount</TabsTrigger>
        </TabsList>

        <TabsContent value="direktori">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-aruna-textSecondary" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama atau posisi..." className="h-9 pl-9" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(["Semua", ...(Object.keys(TEAM_META) as ErpTeam[])] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTeam(t)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-all",
                    team === t ? "border-aruna-primary bg-aruna-primary text-white" : "border-aruna-border bg-white text-aruna-textSecondary hover:border-aruna-medium"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="stagger grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {list.map((e) => {
              const m = TEAM_META[e.team];
              return (
                <Card key={e.id} interactive className="p-4">
                  <div className="flex items-start gap-3">
                    <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white shadow-sm", m.solid)}>{e.initials}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-aruna-text">{e.name}</p>
                      <p className="truncate text-xs text-aruna-textSecondary">{e.position}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <TeamChip team={e.team} />
                        <Badge variant="outline">{e.shift}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2 border-t border-aruna-border pt-3">
                    <a href={`mailto:${e.email}`} className="inline-flex items-center gap-1 truncate text-[11px] text-aruna-textSecondary hover:text-aruna-primary">
                      <Mail className="h-3 w-3" /> {e.email}
                    </a>
                    <Select
                      value={e.status}
                      onChange={(ev) => { dispatch({ type: "SET_ATTENDANCE", employeeId: e.id, status: ev.target.value as Employee["status"] }); toast.success(`${e.name}: ${ev.target.value}`); }}
                      className="h-7 w-32 px-2 py-0 text-xs"
                      aria-label={`Status kehadiran ${e.name}`}
                    >
                      {ATTENDANCE.map((s) => <option key={s}>{s}</option>)}
                    </Select>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="cuti">
          <SectionCard title="Pengajuan Cuti & Izin" description="Persetujuan juga dapat dilakukan dari Approval Center">
            <div className="divide-y divide-aruna-border">
              {state.leaves.map((l) => {
                const emp = state.employees.find((e) => e.id === l.employeeId);
                return (
                  <div key={l.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
                    <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white", emp ? TEAM_META[emp.team].solid : "bg-slate-400")}>{emp?.initials ?? "?"}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-aruna-text">{employeeName(l.employeeId)}</p>
                        <Badge variant="outline">{l.type}</Badge>
                        <StatusBadge status={l.status} />
                      </div>
                      <p className="mt-0.5 text-xs text-aruna-textSecondary">{fmtDate(l.from)} – {fmtDate(l.to)} · {l.days} hari · {l.reason}</p>
                    </div>
                    {l.status === "Menunggu" ? (
                      <div className="flex shrink-0 gap-1.5">
                        <Button size="sm" variant="outline" className="text-aruna-error hover:bg-aruna-errorBg" onClick={() => { dispatch({ type: "SET_LEAVE_STATUS", id: l.id, status: "Ditolak" }); toast(`Pengajuan ${l.id} ditolak.`, { icon: "🚫" }); }}>
                          <X className="h-3.5 w-3.5" /> Tolak
                        </Button>
                        <Button size="sm" onClick={() => { dispatch({ type: "SET_LEAVE_STATUS", id: l.id, status: "Disetujui" }); toast.success(`Pengajuan ${l.id} disetujui.`); }}>
                          <Check className="h-3.5 w-3.5" /> Setujui
                        </Button>
                      </div>
                    ) : (
                      <span className="font-mono text-[11px] text-aruna-textSecondary">{l.id}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="headcount">
          <SectionCard title="Headcount & Kehadiran per Tim" description="Total anggota vs hadir hari ini">
            <div className="h-72 px-3 py-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={headcount} margin={{ left: -16, right: 12 }}>
                  <CartesianGrid stroke={CHART_GRID_COLOR} vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: CHART_AXIS_COLOR }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: CHART_AXIS_COLOR }} axisLine={false} tickLine={false} />
                  <Tooltip {...chartTooltipStyle} />
                  <Bar dataKey="total" name="Total" radius={[6, 6, 0, 0]} fill="#D7ECF6" />
                  <Bar dataKey="hadir" name="Hadir" radius={[6, 6, 0, 0]}>
                    {headcount.map((h) => <Cell key={h.name} fill={TEAM_META[h.name as ErpTeam].hex} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>

      <Dialog open={openLeave} onOpenChange={setOpenLeave}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajukan Cuti / Izin</DialogTitle>
            <DialogDescription>Pengajuan masuk ke antrean Approval Center dan status kehadiran diperbarui otomatis saat disetujui.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submitLeave} className="space-y-3">
            <Field label="Karyawan">
              <Select value={lv.employeeId} onChange={(e) => setLv({ ...lv, employeeId: e.target.value })}>
                {state.employees.map((e) => <option key={e.id} value={e.id}>{e.name} — {e.team}</option>)}
              </Select>
            </Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Jenis">
                <Select value={lv.type} onChange={(e) => setLv({ ...lv, type: e.target.value as LeaveRequest["type"] })}>
                  <option>Cuti Tahunan</option><option>Sakit</option><option>Izin</option><option>Cuti Khusus</option>
                </Select>
              </Field>
              <Field label="Dari"><Input type="date" value={lv.from} onChange={(e) => setLv({ ...lv, from: e.target.value })} required /></Field>
              <Field label="Sampai"><Input type="date" value={lv.to} min={lv.from} onChange={(e) => setLv({ ...lv, to: e.target.value })} required /></Field>
            </div>
            <Field label="Alasan"><Input value={lv.reason} onChange={(e) => setLv({ ...lv, reason: e.target.value })} placeholder="Mis. acara keluarga" required /></Field>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenLeave(false)}>Batal</Button>
              <Button type="submit"><Plus className="h-4 w-4" /> Kirim Pengajuan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
