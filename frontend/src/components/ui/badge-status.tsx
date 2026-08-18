import { Badge } from "./badge";

const STATUS_VARIANT: Record<string, "default" | "primary" | "success" | "warning" | "error" | "outline" | "neutral"> = {
  Aman: "success",
  "Perlu Diproses": "warning",
  Prioritas: "primary",
  "Risiko Aging": "error",
  Diterima: "outline",
  Diproses: "primary",
  "Selesai Diproses": "success",
  "Menunggu QC": "warning",
  Disetujui: "success",
  Menunggu: "warning",
  Ditolak: "error",
  Revisi: "warning",
  "Belum Dimulai": "neutral",
  "Dalam Proses": "primary",
  Selesai: "success",
  Tertunda: "error",
  Prima: "success",
  Baik: "primary",
  "Perlu Perhatian": "warning",
  Draft: "neutral",
  Terjadwal: "primary",
  Dikirim: "success",
  Terima: "success",
  Negosiasikan: "warning",
  "Produksi Selektif": "primary",
  Tolak: "error",
};

export function StatusBadge({ status }: { status: string }) {
  return <Badge variant={STATUS_VARIANT[status] ?? "neutral"}>{status}</Badge>;
}
