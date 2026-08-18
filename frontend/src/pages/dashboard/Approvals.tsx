import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Check, X, RotateCcw, Inbox } from "lucide-react";
import { PageHeader } from "@/components/cards/PageHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge-status";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { approvalRequests as initialRequests } from "@/data/sop";
import { formatDate } from "@/utils/format";
import type { ApprovalRequest } from "@/types";

const TYPES: ApprovalRequest["type"][] = [
  "Production Plan",
  "Pricing Override",
  "Capacity Override",
  "Manual Optimization Override",
  "Quality Exception",
];

const STATUSES: ApprovalRequest["status"][] = ["Menunggu", "Disetujui", "Ditolak", "Revisi"];

export default function Approvals() {
  const [requests, setRequests] = useState<ApprovalRequest[]>(initialRequests);
  const [typeFilter, setTypeFilter] = useState<ApprovalRequest["type"] | "Semua">("Semua");
  const [statusFilter, setStatusFilter] = useState<ApprovalRequest["status"] | "Semua">("Semua");

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      if (typeFilter !== "Semua" && r.type !== typeFilter) return false;
      if (statusFilter !== "Semua" && r.status !== statusFilter) return false;
      return true;
    });
  }, [requests, typeFilter, statusFilter]);

  const pendingCount = requests.filter((r) => r.status === "Menunggu").length;

  function updateStatus(id: string, status: ApprovalRequest["status"]) {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    const request = requests.find((r) => r.id === id);
    const messages: Record<ApprovalRequest["status"], string> = {
      Disetujui: `Permintaan "${request?.title}" telah disetujui.`,
      Ditolak: `Permintaan "${request?.title}" telah ditolak.`,
      Revisi: `Permintaan "${request?.title}" dikembalikan untuk revisi.`,
      Menunggu: `Permintaan "${request?.title}" menunggu keputusan.`,
    };
    if (status === "Disetujui") toast.success(messages[status]);
    else if (status === "Ditolak") toast.error(messages[status]);
    else toast(messages[status]);
  }

  return (
    <div>
      <PageHeader
        title="Approval Center"
        subtitle="Kelola persetujuan production plan, pricing override, capacity override, dan quality exception secara terpusat."
        breadcrumbs={[{ label: "FISH Operations", href: "/app/overview" }, { label: "Approval Center" }]}
        badge={pendingCount > 0 ? <Badge variant="warning">{pendingCount} menunggu keputusan</Badge> : <Badge variant="success">Semua terselesaikan</Badge>}
      />

      <Card className="mb-5 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-aruna-textSecondary">Tipe:</span>
          {(["Semua", ...TYPES] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                typeFilter === t
                  ? "border-aruna-primary bg-aruna-primary text-white"
                  : "border-aruna-border bg-white text-aruna-textSecondary hover:bg-aruna-light1"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-aruna-textSecondary">Status:</span>
          {(["Semua", ...STATUSES] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                statusFilter === s
                  ? "border-aruna-primary bg-aruna-primary text-white"
                  : "border-aruna-border bg-white text-aruna-textSecondary hover:bg-aruna-light1"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        {filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState icon={Inbox} title="Tidak ada permintaan" description="Tidak ada permintaan approval yang cocok dengan filter saat ini." />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Permintaan</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Pemohon</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Dampak</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Approver</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="max-w-[220px] whitespace-normal font-medium text-aruna-text">{r.title}</TableCell>
                  <TableCell><Badge variant="outline">{r.type}</Badge></TableCell>
                  <TableCell className="whitespace-normal">{r.requester}</TableCell>
                  <TableCell>{formatDate(r.date)}</TableCell>
                  <TableCell className="max-w-[200px] whitespace-normal text-xs text-aruna-textSecondary">{r.impact}</TableCell>
                  <TableCell><StatusBadge status={r.status} /></TableCell>
                  <TableCell className="whitespace-normal">{r.approver}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={r.status === "Disetujui"}
                        onClick={() => updateStatus(r.id, "Disetujui")}
                        className="text-aruna-success hover:bg-aruna-successBg"
                        title="Setujui"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={r.status === "Ditolak"}
                        onClick={() => updateStatus(r.id, "Ditolak")}
                        className="text-aruna-error hover:bg-aruna-errorBg"
                        title="Tolak"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={r.status === "Revisi"}
                        onClick={() => updateStatus(r.id, "Revisi")}
                        className="text-aruna-warning hover:bg-aruna-warningBg"
                        title="Minta Revisi"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
