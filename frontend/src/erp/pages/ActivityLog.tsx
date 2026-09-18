import { useMemo, useState } from "react";
import { Activity as ActivityIcon, Search, Filter } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { Input, Select } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { chartTooltipStyle, CHART_AXIS_COLOR, CHART_GRID_COLOR } from "@/components/charts/chart-theme";
import { useErp } from "../ErpContext";
import { TEAM_META } from "../config";
import { buildErpReport } from "../reports";
import { ExportMenu } from "../components/ExportMenu";
import { ActivityFeed, ErpPageHeader, SectionCard } from "../components/shared";
import type { ErpTeam } from "../types";
import { cn } from "@/lib/utils";

const TONES = ["Semua", "info", "success", "warning", "error"] as const;
const TONE_LABEL: Record<string, string> = { Semua: "Semua jenis", info: "Informasi", success: "Sukses", warning: "Peringatan", error: "Kritis" };

export default function ActivityLog() {
  const { state } = useErp();
  const [team, setTeam] = useState<"Semua" | ErpTeam>("Semua");
  const [tone, setTone] = useState<(typeof TONES)[number]>("Semua");
  const [q, setQ] = useState("");

  const list = useMemo(
    () => state.activities.filter((a) => (team === "Semua" || a.team === team) && (tone === "Semua" || a.tone === tone) && (q === "" || a.text.toLowerCase().includes(q.toLowerCase()) || (a.ref ?? "").toLowerCase().includes(q.toLowerCase()))),
    [state.activities, team, tone, q]
  );

  const perTeam = (Object.keys(TEAM_META) as ErpTeam[]).map((t) => ({ name: t, n: state.activities.filter((a) => a.team === t).length }));

  return (
    <div>
      <ErpPageHeader
        title="Log Aktivitas"
        subtitle="Jejak audit seluruh peristiwa lintas tim — setiap aksi di modul manapun tercatat di sini secara otomatis."
        actions={<ExportMenu label="Export Log" getDoc={() => ({ ...buildErpReport("activity", state, "Semua waktu"), tables: [{ ...buildErpReport("activity", state, "").tables[0], rows: list.map((a) => [a.time.replace("T", " ").slice(0, 16), a.team, a.text, a.ref ?? "", a.tone]) }] })} />}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <SectionCard
          title="Peristiwa"
          description={`${list.length} dari ${state.activities.length} peristiwa`}
          className="xl:col-span-2"
          icon={<ActivityIcon className="mt-0.5 h-4 w-4 text-aruna-primary" />}
          action={
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-aruna-textSecondary" />
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari teks / referensi" className="h-9 w-48 pl-9" />
              </div>
              <Select value={tone} onChange={(e) => setTone(e.target.value as (typeof TONES)[number])} className="h-9 w-36">
                {TONES.map((t) => <option key={t} value={t}>{TONE_LABEL[t]}</option>)}
              </Select>
            </div>
          }
        >
          <div className="flex flex-wrap gap-1.5 border-b border-aruna-border px-5 py-3">
            <Filter className="mr-1 h-4 w-4 self-center text-aruna-textSecondary" />
            {(["Semua", ...(Object.keys(TEAM_META) as ErpTeam[])] as const).map((t) => (
              <button key={t} onClick={() => setTeam(t)} className={cn("rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-all", team === t ? "border-aruna-primary bg-aruna-primary text-white" : "border-aruna-border bg-white text-aruna-textSecondary hover:border-aruna-medium")}>{t}</button>
            ))}
          </div>
          {list.length === 0 ? <div className="p-6"><EmptyState title="Tidak ada peristiwa" description="Ubah filter tim, jenis, atau kata kunci." /></div> : <ActivityFeed activities={list} limit={60} />}
        </SectionCard>

        <SectionCard title="Aktivitas per Tim" description="Jumlah peristiwa tercatat">
          <div className="h-72 px-3 py-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={perTeam} layout="vertical" margin={{ left: 8, right: 20 }}>
                <CartesianGrid stroke={CHART_GRID_COLOR} horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: CHART_AXIS_COLOR }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={88} tick={{ fontSize: 11, fill: CHART_AXIS_COLOR }} axisLine={false} tickLine={false} />
                <Tooltip {...chartTooltipStyle} />
                <Bar dataKey="n" name="Peristiwa" radius={[0, 6, 6, 0]} barSize={14}>
                  {perTeam.map((d) => <Cell key={d.name} fill={TEAM_META[d.name as ErpTeam].hex} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
