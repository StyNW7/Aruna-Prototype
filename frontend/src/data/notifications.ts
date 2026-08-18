import type { AppNotification } from "@/types";

export const notifications: AppNotification[] = [
  { id: "N-1", title: "Freezer hampir penuh", description: "Kapasitas freezer mencapai 87% dari total kapasitas.", time: "10 menit lalu", severity: "warning", read: false },
  { id: "N-2", title: "Yield turun", description: "Yield Whole Fish → Loin batch BT-2408-11 di bawah target 3,9 pp.", time: "32 menit lalu", severity: "critical", read: false },
  { id: "N-3", title: "Energy cost naik", description: "Tarif energi efektif naik 6,1% dibanding rata-rata bulanan.", time: "1 jam lalu", severity: "warning", read: false },
  { id: "N-4", title: "Inventory aging", description: "Batch BT-2408-12 mendekati batas umur stok yang direkomendasikan.", time: "2 jam lalu", severity: "warning", read: true },
  { id: "N-5", title: "Approval pending", description: "Production Plan 13 Agustus menunggu persetujuan Plant Manager.", time: "3 jam lalu", severity: "info", read: true },
  { id: "N-6", title: "Demand terpenuhi", description: "Demand SAKU 16 OZ telah 92% terpenuhi untuk periode ini.", time: "5 jam lalu", severity: "success", read: true },
  { id: "N-7", title: "Shipment hampir penuh", description: "Container MSKU-7712340 telah mencapai 93,9% dari kapasitas 19.000 kg.", time: "6 jam lalu", severity: "info", read: true },
];
