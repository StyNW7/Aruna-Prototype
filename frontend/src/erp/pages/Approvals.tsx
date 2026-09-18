import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { CheckSquare, Check, X, ShoppingCart, CalendarOff, Handshake, Inbox, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useErp, fmtRp, fmtUsd } from "../ErpContext";
import { ErpPageHeader, SectionCard, TeamChip, ActivityFeed, fmtDate } from "../components/shared";
import type { ErpTeam } from "../types";
import { cn } from "@/lib/utils";

type Kind = "PO" | "Cuti" | "Quotation";

interface ApprovalItem {
  id: string;
  kind: Kind;
  team: ErpTeam;
  approver: ErpTeam;
  title: string;
  subtitle: string;
  amount?: string;
  date: string;
  approve: () => void;
  reject: () => void;
}

const KIND_META: Record<Kind, { icon: typeof Check; label: string }> = {
  PO: { icon: ShoppingCart, label: "Purchase Order" },
  Cuti: { icon: CalendarOff, label: "Cuti & Izin" },
  Quotation: { icon: Handshake, label: "Quotation" },
};

export default function Approvals() {
  const { state, dispatch, supplierName, employeeName, customerName } = useErp();
  const [filter, setFilter] = useState<"Semua" | Kind>("Semua");

  const items = useMemo<ApprovalItem[]>(() => {
    const po: ApprovalItem[] = state.purchaseOrders
      .filter((p) => p.status === "Menunggu Approval")
      .map((p) => ({
        id: p.id,
        kind: "PO",
        team: "Procurement",
        approver: "Finance",
        title: `${p.id} — ${supplierName(p.supplierId)}`,
        subtitle: `${p.lines.length} item · diminta ${employeeName(p.requestedBy)}${p.note ? ` · ${p.note}` : ""}`,
        amount: fmtRp(p.total),
        date: p.date,
        approve: () => dispatch({ type: "SET_PO_STATUS", id: p.id, status: "Disetujui" }),
        reject: () => dispatch({ type: "SET_PO_STATUS", id: p.id, status: "Ditolak" }),
      }));
    const lv: ApprovalItem[] = state.leaves
      .filter((l) => l.status === "Menunggu")
      .map((l) => {
        const emp = state.employees.find((e) => e.id === l.employeeId);
        return {
          id: l.id,
          kind: "Cuti",
          team: emp?.team ?? "HR",
          approver: "HR",
          title: `${employeeName(l.employeeId)} — ${l.type}`,
          subtitle: `${fmtDate(l.from)} s.d. ${fmtDate(l.to)} (${l.days} hari) · ${l.reason}`,
          date: l.from,
          approve: () => dispatch({ type: "SET_LEAVE_STATUS", id: l.id, status: "Disetujui" }),
          reject: () => dispatch({ type: "SET_LEAVE_STATUS", id: l.id, status: "Ditolak" }),
        };
      });
    const so: ApprovalItem[] = state.salesOrders
      .filter((s) => s.status === "Quotation")
      .map((s) => ({
        id: s.id,
        kind: "Quotation",
        team: "Sales",
        approver: "Sales",
        title: `${s.id} — ${customerName(s.customerId)}`,
        subtitle: `${s.lines.length} SKU · jatuh tempo ${fmtDate(s.dueDate)}`,
        amount: fmtUsd(s.totalUsd),
        date: s.date,
        approve: () => dispatch({ type: "SET_SO_STATUS", id: s.id, status: "Dikonfirmasi" }),
        reject: () => dispatch({ type: "SET_SO_STATUS", id: s.id, status: "Dibatalkan" }),
      }));
    return [...po, ...lv, ...so].sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [state, dispatch, supplierName, employeeName, customerName]);

  const visible = items.filter((i) => filter === "Semua" || i.kind === filter);
  const counts = { PO: items.filter((i) => i.kind === "PO").length, Cuti: items.filter((i) => i.kind === "Cuti").length, Quotation: items.filter((i) => i.kind === "Quotation").length };

  function approveAll() {
    visible.forEach((i) => i.approve());
    toast.success(`${visible.length} item disetujui.`);
  }

  const recentDecisions = state.activities.filter((a) => /disetujui|ditolak|dikonfirmasi|dibatalkan/i.test(a.text)).slice(0, 8);

  return (
    <div>
      <ErpPageHeader
        title="Approval Center"
        subtitle="Satu antrean untuk seluruh persetujuan lintas tim: PO (Finance), cuti (HR), dan quotation (Sales). Keputusan langsung mengubah data modul terkait."
        actions={
          <Button variant="outline" disabled={visible.length === 0} onClick={approveAll}>
            <CheckCheck className="h-4 w-4" /> Setujui semua ({visible.length})
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(["Semua", "PO", "Cuti", "Quotation"] as const).map((k) => {
          const n = k === "Semua" ? items.length : counts[k];
          const Icon = k === "Semua" ? CheckSquare : KIND_META[k].icon;
          return (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={cn(
                "flex items-center gap-3 rounded-xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-soft",
                filter === k ? "border-aruna-primary bg-aruna-light1" : "border-aruna-border bg-white"
              )}
            >
              <span className={cn("flex h-10 w-10 items-center justify-center rounded-lg", filter === k ? "aruna-gradient text-white" : "bg-aruna-light1 text-aruna-primary")}>
                <Icon className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-display text-xl font-bold text-aruna-text">{n}</span>
                <span className="block text-xs text-aruna-textSecondary">{k === "Semua" ? "Semua antrean" : KIND_META[k].label}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-3 xl:col-span-2">
          {visible.length === 0 ? (
            <EmptyState icon={Inbox} title="Antrean kosong" description="Tidak ada item yang menunggu persetujuan pada kategori ini." />
          ) : (
            visible.map((i) => {
              const Icon = KIND_META[i.kind].icon;
              return (
                <Card key={i.id} className="flex flex-col gap-4 p-5 animate-fade-in sm:flex-row sm:items-center">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-aruna-light1 text-aruna-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-aruna-text">{i.title}</p>
                      <Badge variant="outline">{KIND_META[i.kind].label}</Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-aruna-textSecondary">{i.subtitle}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-aruna-textSecondary">
                      <span>Dari</span> <TeamChip team={i.team} /> <span>→ disetujui oleh</span> <TeamChip team={i.approver} />
                      <span>· {fmtDate(i.date)}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    {i.amount && <span className="font-display text-base font-bold text-aruna-text">{i.amount}</span>}
                    <div className="flex gap-1.5">
                      <Button size="sm" variant="outline" className="text-aruna-error hover:bg-aruna-errorBg" onClick={() => { i.reject(); toast(`${i.id} ditolak.`, { icon: "🚫" }); }}>
                        <X className="h-3.5 w-3.5" /> Tolak
                      </Button>
                      <Button size="sm" onClick={() => { i.approve(); toast.success(`${i.id} disetujui.`); }}>
                        <Check className="h-3.5 w-3.5" /> Setujui
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        <SectionCard title="Keputusan Terakhir" description="Riwayat approval lintas tim">
          <ActivityFeed activities={recentDecisions} limit={8} compact />
        </SectionCard>
      </div>
    </div>
  );
}
