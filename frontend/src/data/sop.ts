import type { SOPRule, ApprovalRequest } from "@/types";

export const sopRules: SOPRule[] = [
  { id: "SOP-01", title: "Eligibility Before Profitability", description: "Produk harus memenuhi size, grade, dan quality requirement sebelum dipilih dalam production mix, sebelum profitabilitas dipertimbangkan.", category: "Eligibility" },
  { id: "SOP-02", title: "Premium-First, Not Premium-Only", description: "Produk premium seperti SAKU diprioritaskan hanya jika demand, capacity, dan economics mendukung — bukan default absolut.", category: "Eligibility" },
  { id: "SOP-03", title: "Pricing Floor", description: "Order dari buyer di bawah pricing floor wajib dinegosiasikan sebelum disetujui produksi.", category: "Pricing" },
  { id: "SOP-04", title: "Demand Ceiling", description: "Produksi tidak boleh melebihi demand yang ditentukan untuk menghindari excess product baru.", category: "Pricing" },
  { id: "SOP-05", title: "Energy Threshold", description: "Model optimasi perlu dijalankan ulang ketika energy constraint melewati threshold yang ditetapkan Engineering.", category: "Energy" },
  { id: "SOP-06", title: "Capacity Threshold", description: "Production mix harus disesuaikan saat mesin, freezer, atau storage menjadi bottleneck operasional.", category: "Capacity" },
  { id: "SOP-07", title: "Residual Allocation", description: "Residual bahan baku diprioritaskan ke produk dengan incremental value terbaik, bukan produk default.", category: "Capacity" },
  { id: "SOP-08", title: "Manual Override", description: "Setiap override terhadap rekomendasi sistem wajib disertai alasan tertulis dan pemilik keputusan.", category: "Governance" },
  { id: "SOP-09", title: "Plan vs Actual Review", description: "Review plan vs actual wajib dilakukan setiap siklus produksi untuk menutup gap eksekusi.", category: "Governance" },
  { id: "SOP-10", title: "Model Recalibration", description: "Parameter yield, cost, dan energy intensity diperbarui secara berkala menggunakan data aktual lapangan.", category: "Governance" },
];

export const approvalRequests: ApprovalRequest[] = [
  { id: "AP-001", type: "Production Plan", title: "Production Plan 13 Agustus — Batch BT-2408-09", requester: "Andi Wirawan (Production Planner)", date: "2024-08-12", impact: "Volume 1.900 kg, mempengaruhi 3 SKU", status: "Menunggu", approver: "Budi Santoso (Plant Manager)" },
  { id: "AP-002", type: "Pricing Override", title: "Penurunan harga Steak 6 OZ 4,5% untuk buyer Bluewave", requester: "Sinta Wijaya (Commercial)", date: "2024-08-11", impact: "Margin turun estimasi Rp18,4 juta", status: "Disetujui", approver: "Budi Santoso (Plant Manager)" },
  { id: "AP-003", type: "Capacity Override", title: "Penambahan shift freezer malam hari", requester: "Farid Ramadhan (Engineering)", date: "2024-08-10", impact: "Energy cost naik ~Rp6,2 juta/hari", status: "Disetujui", approver: "Budi Santoso (Plant Manager)" },
  { id: "AP-004", type: "Manual Optimization Override", title: "Alokasi manual 30 UP Grade C ke Poke di luar rekomendasi", requester: "Andi Wirawan (Production Planner)", date: "2024-08-09", impact: "Potensi kehilangan margin Rp4,1 juta", status: "Revisi", approver: "Budi Santoso (Plant Manager)" },
  { id: "AP-005", type: "Quality Exception", title: "Pengecualian batch BT-2408-12 freshness 'Perlu Perhatian'", requester: "Dedi Prasetyo (Quality Control)", date: "2024-08-12", impact: "2.860 kg raw material berisiko", status: "Menunggu", approver: "Rina Kartika (Quality Control Lead)" },
];
