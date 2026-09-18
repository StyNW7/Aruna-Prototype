import type {
  Activity,
  Budget,
  Customer,
  Employee,
  ErpState,
  InventoryItem,
  Invoice,
  JournalEntry,
  LeaveRequest,
  MaintenanceTicket,
  PurchaseOrder,
  SalesOrder,
  StockMovement,
  Supplier,
  WorkOrder,
} from "./types";

// Data ilustratif untuk prototype Aruna ERP. Seluruh ID saling merujuk antar entitas
// sehingga aksi di satu tim (mis. Procurement) tercermin di tim lain (Warehouse, Finance).

export const KURS_USD = 16481;

export const employees: Employee[] = [
  { id: "EMP-001", name: "Andi Wirawan", team: "Operations", position: "Production Planner", email: "andi.w@arunajaya.co.id", shift: "Office", status: "Hadir", joinDate: "2021-03-01", initials: "AW" },
  { id: "EMP-002", name: "Rina Kartika", team: "Finance", position: "Finance Manager", email: "rina.k@arunajaya.co.id", shift: "Office", status: "Hadir", joinDate: "2019-07-15", initials: "RK" },
  { id: "EMP-003", name: "Budi Santoso", team: "Procurement", position: "Procurement Lead", email: "budi.s@arunajaya.co.id", shift: "Office", status: "Hadir", joinDate: "2020-01-10", initials: "BS" },
  { id: "EMP-004", name: "Sari Dewi", team: "Warehouse", position: "Warehouse Supervisor", email: "sari.d@arunajaya.co.id", shift: "Shift 1", status: "Hadir", joinDate: "2020-09-02", initials: "SD" },
  { id: "EMP-005", name: "Dedi Pratama", team: "Operations", position: "Line Supervisor", email: "dedi.p@arunajaya.co.id", shift: "Shift 1", status: "Hadir", joinDate: "2018-05-20", initials: "DP" },
  { id: "EMP-006", name: "Maya Putri", team: "Sales", position: "Export Sales Executive", email: "maya.p@arunajaya.co.id", shift: "Office", status: "Hadir", joinDate: "2022-02-14", initials: "MP" },
  { id: "EMP-007", name: "Fajar Nugroho", team: "Engineering", position: "Maintenance Engineer", email: "fajar.n@arunajaya.co.id", shift: "Shift 2", status: "Belum Absen", joinDate: "2021-11-08", initials: "FN" },
  { id: "EMP-008", name: "Lina Marlina", team: "Quality", position: "QC Inspector", email: "lina.m@arunajaya.co.id", shift: "Shift 1", status: "Hadir", joinDate: "2020-04-27", initials: "LM" },
  { id: "EMP-009", name: "Hendra Gunawan", team: "HR", position: "HR & GA Officer", email: "hendra.g@arunajaya.co.id", shift: "Office", status: "Hadir", joinDate: "2019-12-01", initials: "HG" },
  { id: "EMP-010", name: "Putri Ayu", team: "Finance", position: "AR/AP Analyst", email: "putri.a@arunajaya.co.id", shift: "Office", status: "Cuti", joinDate: "2022-08-22", initials: "PA" },
  { id: "EMP-011", name: "Yoga Saputra", team: "Operations", position: "Operator Bandsaw", email: "yoga.s@arunajaya.co.id", shift: "Shift 2", status: "Belum Absen", joinDate: "2023-01-16", initials: "YS" },
  { id: "EMP-012", name: "Nadia Rahma", team: "Sales", position: "Domestic Sales", email: "nadia.r@arunajaya.co.id", shift: "Office", status: "Izin", joinDate: "2023-06-05", initials: "NR" },
  { id: "EMP-013", name: "Rizky Maulana", team: "Warehouse", position: "Cold Storage Operator", email: "rizky.m@arunajaya.co.id", shift: "Shift 3", status: "Belum Absen", joinDate: "2022-10-10", initials: "RM" },
  { id: "EMP-014", name: "Dwi Lestari", team: "Quality", position: "QA Lead", email: "dwi.l@arunajaya.co.id", shift: "Office", status: "Sakit", joinDate: "2018-02-19", initials: "DL" },
  { id: "EMP-015", name: "Agus Salim", team: "Operations", position: "Operator Trimming", email: "agus.s@arunajaya.co.id", shift: "Shift 1", status: "Hadir", joinDate: "2021-07-12", initials: "AS" },
  { id: "EMP-016", name: "Citra Anggraini", team: "Procurement", position: "Purchasing Staff", email: "citra.a@arunajaya.co.id", shift: "Office", status: "Hadir", joinDate: "2023-03-20", initials: "CA" },
];

export const suppliers: Supplier[] = [
  { id: "SUP-001", name: "Koperasi Nelayan Bungus", category: "Bahan Baku", contact: "koperasi@bungus.id", leadTimeDays: 1, rating: 4.7, city: "Padang" },
  { id: "SUP-002", name: "PT Samudra Ice", category: "Consumable", contact: "order@samudraice.co.id", leadTimeDays: 1, rating: 4.4, city: "Padang" },
  { id: "SUP-003", name: "CV Kemasan Prima", category: "Kemasan", contact: "sales@kemasanprima.id", leadTimeDays: 5, rating: 4.2, city: "Medan" },
  { id: "SUP-004", name: "PT Polar Packaging", category: "Kemasan", contact: "cs@polarpack.co.id", leadTimeDays: 7, rating: 4.0, city: "Jakarta" },
  { id: "SUP-005", name: "PLN Bisnis Sumbar", category: "Energi & Utilitas", contact: "b2b@pln.co.id", leadTimeDays: 0, rating: 4.1, city: "Padang" },
  { id: "SUP-006", name: "PT Teknik Dingin Nusantara", category: "Jasa", contact: "service@teknikdingin.id", leadTimeDays: 3, rating: 4.5, city: "Pekanbaru" },
];

export const items: InventoryItem[] = [
  { id: "ITM-001", name: "Tuna Whole Fish 30 UP", category: "Bahan Baku", unit: "kg", stock: 6250, minStock: 3000, maxStock: 12000, location: "Chiller A", unitCost: 42000 },
  { id: "ITM-002", name: "Tuna Whole Fish 20 UP", category: "Bahan Baku", unit: "kg", stock: 4180, minStock: 2500, maxStock: 10000, location: "Chiller A", unitCost: 38500 },
  { id: "ITM-003", name: "Fresh Loin (WIP)", category: "Bahan Baku", unit: "kg", stock: 3920, minStock: 1500, maxStock: 8000, location: "Chiller B", unitCost: 71000 },
  { id: "ITM-004", name: "Es Balok / Flake Ice", category: "Consumable", unit: "kg", stock: 1800, minStock: 2000, maxStock: 6000, location: "Ice Room", unitCost: 1200 },
  { id: "ITM-005", name: "Vacuum Bag 16 OZ", category: "Kemasan", unit: "pcs", stock: 12400, minStock: 8000, maxStock: 30000, location: "Gudang Kemasan", unitCost: 850 },
  { id: "ITM-006", name: "Vacuum Bag 8 OZ", category: "Kemasan", unit: "pcs", stock: 6200, minStock: 8000, maxStock: 30000, location: "Gudang Kemasan", unitCost: 620 },
  { id: "ITM-007", name: "Master Carton Ekspor", category: "Kemasan", unit: "karton", stock: 2150, minStock: 1500, maxStock: 6000, location: "Gudang Kemasan", unitCost: 9800 },
  { id: "ITM-008", name: "Label & Stiker Traceability", category: "Kemasan", unit: "roll", stock: 64, minStock: 40, maxStock: 200, location: "Gudang Kemasan", unitCost: 145000 },
  { id: "ITM-009", name: "SAKU 16 OZ (FG)", category: "Finished Goods", unit: "kg", stock: 4310, minStock: 1000, maxStock: 8000, location: "Cold Storage 1", unitCost: 168000, skuCode: "SAKU-16OZ" },
  { id: "ITM-010", name: "Steak 8 OZ (FG)", category: "Finished Goods", unit: "kg", stock: 5960, minStock: 1500, maxStock: 9000, location: "Cold Storage 1", unitCost: 112000, skuCode: "STEAK-8OZ" },
  { id: "ITM-011", name: "Steak 6 OZ (FG)", category: "Finished Goods", unit: "kg", stock: 3880, minStock: 1200, maxStock: 8000, location: "Cold Storage 2", unitCost: 106000, skuCode: "STEAK-6OZ" },
  { id: "ITM-012", name: "Poke / Cube 1,5 cm (FG)", category: "Finished Goods", unit: "kg", stock: 2140, minStock: 800, maxStock: 5000, location: "Cold Storage 2", unitCost: 98000, skuCode: "POKE-1.5CM" },
  { id: "ITM-013", name: "Medallion 2–3 OZ (FG)", category: "Finished Goods", unit: "kg", stock: 1720, minStock: 800, maxStock: 5000, location: "Cold Storage 2", unitCost: 92000, skuCode: "MEDALLION-2-3OZ" },
  { id: "ITM-014", name: "Sarung Tangan Nitril", category: "Consumable", unit: "pcs", stock: 3400, minStock: 2000, maxStock: 10000, location: "Gudang Umum", unitCost: 900 },
];

export const purchaseOrders: PurchaseOrder[] = [
  { id: "PO-2409-001", supplierId: "SUP-001", lines: [{ itemId: "ITM-001", qty: 4200, unitPrice: 42000 }], total: 176400000, status: "Diterima", requestedBy: "EMP-003", date: "2026-09-10", expectedDate: "2026-09-11" },
  { id: "PO-2409-002", supplierId: "SUP-003", lines: [{ itemId: "ITM-005", qty: 10000, unitPrice: 850 }, { itemId: "ITM-007", qty: 1000, unitPrice: 9800 }], total: 18300000, status: "Diterima", requestedBy: "EMP-016", date: "2026-09-08", expectedDate: "2026-09-13" },
  { id: "PO-2409-003", supplierId: "SUP-002", lines: [{ itemId: "ITM-004", qty: 3000, unitPrice: 1200 }], total: 3600000, status: "Disetujui", requestedBy: "EMP-004", date: "2026-09-16", expectedDate: "2026-09-18" },
  { id: "PO-2409-004", supplierId: "SUP-004", lines: [{ itemId: "ITM-006", qty: 15000, unitPrice: 620 }], total: 9300000, status: "Menunggu Approval", requestedBy: "EMP-016", date: "2026-09-17", expectedDate: "2026-09-24" },
  { id: "PO-2409-005", supplierId: "SUP-001", lines: [{ itemId: "ITM-002", qty: 3500, unitPrice: 38500 }], total: 134750000, status: "Menunggu Approval", requestedBy: "EMP-003", date: "2026-09-18", expectedDate: "2026-09-19", note: "Supply 20 UP untuk plan Steak 6 OZ minggu depan" },
  { id: "PO-2409-006", supplierId: "SUP-006", lines: [{ itemId: "ITM-014", qty: 2000, unitPrice: 900 }], total: 1800000, status: "Draft", requestedBy: "EMP-004", date: "2026-09-18", expectedDate: "2026-09-21" },
];

export const movements: StockMovement[] = [
  { id: "MV-0101", itemId: "ITM-001", type: "Masuk", qty: 4200, date: "2026-09-11T07:40:00", ref: "PO-2409-001", by: "Sari Dewi" },
  { id: "MV-0102", itemId: "ITM-005", type: "Masuk", qty: 10000, date: "2026-09-13T09:10:00", ref: "PO-2409-002", by: "Sari Dewi" },
  { id: "MV-0103", itemId: "ITM-007", type: "Masuk", qty: 1000, date: "2026-09-13T09:12:00", ref: "PO-2409-002", by: "Sari Dewi" },
  { id: "MV-0104", itemId: "ITM-001", type: "Keluar", qty: -2100, date: "2026-09-15T07:05:00", ref: "WO-2409-001", by: "Dedi Pratama" },
  { id: "MV-0105", itemId: "ITM-009", type: "Masuk", qty: 1275, date: "2026-09-15T11:35:00", ref: "WO-2409-001", by: "Dedi Pratama" },
  { id: "MV-0106", itemId: "ITM-004", type: "Penyesuaian", qty: -220, date: "2026-09-16T16:00:00", ref: "ADJ", by: "Rizky Maulana", note: "Susut es harian" },
  { id: "MV-0107", itemId: "ITM-010", type: "Keluar", qty: -6100, date: "2026-09-17T13:20:00", ref: "SO-2409-001", by: "Sari Dewi" },
  { id: "MV-0108", itemId: "ITM-006", type: "Keluar", qty: -3800, date: "2026-09-17T08:00:00", ref: "WO-2409-002", by: "Dedi Pratama" },
];

export const workOrders: WorkOrder[] = [
  { id: "WO-2409-001", skuCode: "SAKU-16OZ", plannedKg: 1302, actualKg: 1275, rawMaterialKg: 2100, status: "Selesai", shift: "Shift 1", line: "Bandsaw Line 1", supervisorId: "EMP-005", date: "2026-09-15", linkedPlanId: "PP-001" },
  { id: "WO-2409-002", skuCode: "STEAK-8OZ", plannedKg: 1820, actualKg: 1795, rawMaterialKg: 2600, status: "Selesai", shift: "Shift 1", line: "Bandsaw Line 2", supervisorId: "EMP-005", date: "2026-09-16", linkedPlanId: "PP-002" },
  { id: "WO-2409-003", skuCode: "STEAK-6OZ", plannedKg: 1349, rawMaterialKg: 1900, status: "Berjalan", shift: "Shift 1", line: "Bandsaw Line 1", supervisorId: "EMP-005", date: "2026-09-18", linkedPlanId: "PP-003" },
  { id: "WO-2409-004", skuCode: "POKE-1.5CM", plannedKg: 792, rawMaterialKg: 1200, status: "Berjalan", shift: "Shift 1", line: "Trimming Station A", supervisorId: "EMP-015", date: "2026-09-18", linkedPlanId: "PP-004" },
  { id: "WO-2409-005", skuCode: "MEDALLION-2-3OZ", plannedKg: 1088, rawMaterialKg: 1450, status: "Terjadwal", shift: "Shift 2", line: "Trimming Station B", supervisorId: "EMP-011", date: "2026-09-18", linkedPlanId: "PP-005" },
  { id: "WO-2409-006", skuCode: "GROUND-MEAT", plannedKg: 804, rawMaterialKg: 980, status: "Terjadwal", shift: "Shift 1", line: "Grinding Line", supervisorId: "EMP-005", date: "2026-09-19", linkedPlanId: "PP-006" },
  { id: "WO-2409-007", skuCode: "STEAK-4OZ", plannedKg: 1168, rawMaterialKg: 1600, status: "Tertunda", shift: "Shift 2", line: "Bandsaw Line 2", supervisorId: "EMP-011", date: "2026-09-19", linkedPlanId: "PP-007" },
];

export const customers: Customer[] = [
  { id: "CUS-001", name: "Pacific Seafood Co.", country: "Amerika Serikat", segment: "Ekspor", creditLimitUsd: 250000, contact: "procurement@pacificseafood.com", paymentTermDays: 45 },
  { id: "CUS-002", name: "Bluewave Foods", country: "Jepang", segment: "Ekspor", creditLimitUsd: 180000, contact: "buy@bluewave.jp", paymentTermDays: 30 },
  { id: "CUS-003", name: "Ocean Harvest GmbH", country: "Jerman", segment: "Ekspor", creditLimitUsd: 150000, contact: "import@oceanharvest.de", paymentTermDays: 60 },
  { id: "CUS-004", name: "Sari Laut Distribusi", country: "Indonesia", segment: "Domestik", creditLimitUsd: 40000, contact: "order@sarilaut.co.id", paymentTermDays: 14 },
  { id: "CUS-005", name: "Nusantara Fresh Market", country: "Indonesia", segment: "Domestik", creditLimitUsd: 25000, contact: "po@nusantarafresh.id", paymentTermDays: 14 },
];

export const salesOrders: SalesOrder[] = [
  { id: "SO-2409-001", customerId: "CUS-001", lines: [{ skuCode: "SAKU-16OZ", qtyKg: 4200, priceUsdPerKg: 14.88 }, { skuCode: "STEAK-8OZ", qtyKg: 6100, priceUsdPerKg: 8.38 }], totalUsd: 113614, status: "Dikirim", date: "2026-09-05", dueDate: "2026-10-20", salesRepId: "EMP-006", linkedShipmentId: "SH-001" },
  { id: "SO-2409-002", customerId: "CUS-002", lines: [{ skuCode: "STEAK-4OZ", qtyKg: 5200, priceUsdPerKg: 7.17 }, { skuCode: "MEDALLION-2-3OZ", qtyKg: 4100, priceUsdPerKg: 5.51 }], totalUsd: 59875, status: "Dikonfirmasi", date: "2026-09-12", dueDate: "2026-10-12", salesRepId: "EMP-006", linkedShipmentId: "SH-002" },
  { id: "SO-2409-003", customerId: "CUS-003", lines: [{ skuCode: "STEAK-6OZ", qtyKg: 3000, priceUsdPerKg: 8.16 }], totalUsd: 24480, status: "Quotation", date: "2026-09-17", dueDate: "2026-11-16", salesRepId: "EMP-006" },
  { id: "SO-2409-004", customerId: "CUS-004", lines: [{ skuCode: "POKE-1.5CM", qtyKg: 800, priceUsdPerKg: 7.72 }], totalUsd: 6176, status: "Ditagih", date: "2026-09-02", dueDate: "2026-09-16", salesRepId: "EMP-012" },
  { id: "SO-2409-005", customerId: "CUS-005", lines: [{ skuCode: "GROUND-MEAT", qtyKg: 600, priceUsdPerKg: 3.95 }], totalUsd: 2370, status: "Lunas", date: "2026-08-28", dueDate: "2026-09-11", salesRepId: "EMP-012" },
  { id: "SO-2409-006", customerId: "CUS-001", lines: [{ skuCode: "SAKU-16OZ", qtyKg: 2500, priceUsdPerKg: 15.1 }], totalUsd: 37750, status: "Quotation", date: "2026-09-18", dueDate: "2026-11-02", salesRepId: "EMP-006" },
];

export const invoices: Invoice[] = [
  { id: "INV-AR-2409-01", kind: "AR", counterparty: "Sari Laut Distribusi", refId: "SO-2409-004", amount: 6176 * KURS_USD, issuedDate: "2026-09-02", dueDate: "2026-09-16", status: "Terlambat" },
  { id: "INV-AR-2408-07", kind: "AR", counterparty: "Nusantara Fresh Market", refId: "SO-2409-005", amount: 2370 * KURS_USD, issuedDate: "2026-08-28", dueDate: "2026-09-11", status: "Lunas", paidDate: "2026-09-09" },
  { id: "INV-AR-2408-05", kind: "AR", counterparty: "Bluewave Foods", refId: "SO-2408-011", amount: 48200 * KURS_USD, issuedDate: "2026-08-20", dueDate: "2026-09-19", status: "Jatuh Tempo" },
  { id: "INV-AR-2408-03", kind: "AR", counterparty: "Ocean Harvest GmbH", refId: "SO-2408-008", amount: 71350 * KURS_USD, issuedDate: "2026-08-12", dueDate: "2026-10-11", status: "Belum Jatuh Tempo" },
  { id: "INV-AP-2409-01", kind: "AP", counterparty: "Koperasi Nelayan Bungus", refId: "PO-2409-001", amount: 176400000, issuedDate: "2026-09-11", dueDate: "2026-09-25", status: "Belum Jatuh Tempo" },
  { id: "INV-AP-2409-02", kind: "AP", counterparty: "CV Kemasan Prima", refId: "PO-2409-002", amount: 18300000, issuedDate: "2026-09-13", dueDate: "2026-10-13", status: "Belum Jatuh Tempo" },
  { id: "INV-AP-2408-09", kind: "AP", counterparty: "PLN Bisnis Sumbar", refId: "UTIL-AGU", amount: 41250000, issuedDate: "2026-09-01", dueDate: "2026-09-15", status: "Terlambat" },
  { id: "INV-AP-2408-06", kind: "AP", counterparty: "PT Samudra Ice", refId: "PO-2408-021", amount: 5400000, issuedDate: "2026-08-30", dueDate: "2026-09-13", status: "Lunas", paidDate: "2026-09-12" },
];

export const journal: JournalEntry[] = [
  { id: "JE-0901", date: "2026-09-09", description: "Pelunasan piutang Nusantara Fresh Market", debit: "Kas & Bank", credit: "Piutang Usaha", amount: 2370 * KURS_USD, ref: "INV-AR-2408-07", source: "Finance" },
  { id: "JE-0902", date: "2026-09-11", description: "Penerimaan bahan baku PO-2409-001", debit: "Persediaan Bahan Baku", credit: "Hutang Usaha", amount: 176400000, ref: "PO-2409-001", source: "Warehouse" },
  { id: "JE-0903", date: "2026-09-12", description: "Pembayaran hutang PT Samudra Ice", debit: "Hutang Usaha", credit: "Kas & Bank", amount: 5400000, ref: "INV-AP-2408-06", source: "Finance" },
  { id: "JE-0904", date: "2026-09-13", description: "Penerimaan kemasan PO-2409-002", debit: "Persediaan Kemasan", credit: "Hutang Usaha", amount: 18300000, ref: "PO-2409-002", source: "Warehouse" },
  { id: "JE-0905", date: "2026-09-15", description: "Konsumsi bahan baku WO-2409-001", debit: "Barang Dalam Proses", credit: "Persediaan Bahan Baku", amount: 88200000, ref: "WO-2409-001", source: "Operations" },
  { id: "JE-0906", date: "2026-09-15", description: "Hasil produksi SAKU 16 OZ WO-2409-001", debit: "Persediaan Barang Jadi", credit: "Barang Dalam Proses", amount: 214200000, ref: "WO-2409-001", source: "Operations" },
  { id: "JE-0907", date: "2026-09-17", description: "Pengiriman SO-2409-001 (HPP)", debit: "Harga Pokok Penjualan", credit: "Persediaan Barang Jadi", amount: 683200000, ref: "SO-2409-001", source: "Sales" },
];

export const budgets: Budget[] = [
  { department: "Operations", budget: 1850000000, actual: 1412000000 },
  { department: "Procurement", budget: 2400000000, actual: 1988000000 },
  { department: "Warehouse", budget: 420000000, actual: 301000000 },
  { department: "Sales", budget: 380000000, actual: 224000000 },
  { department: "Engineering", budget: 310000000, actual: 287000000 },
  { department: "HR", budget: 960000000, actual: 702000000 },
  { department: "Quality", budget: 180000000, actual: 121000000 },
  { department: "Finance", budget: 140000000, actual: 96000000 },
];

export const leaves: LeaveRequest[] = [
  { id: "LV-0301", employeeId: "EMP-010", type: "Cuti Tahunan", from: "2026-09-17", to: "2026-09-19", days: 3, reason: "Acara keluarga", status: "Disetujui" },
  { id: "LV-0302", employeeId: "EMP-011", type: "Izin", from: "2026-09-22", to: "2026-09-22", days: 1, reason: "Urusan administrasi", status: "Menunggu" },
  { id: "LV-0303", employeeId: "EMP-008", type: "Cuti Tahunan", from: "2026-09-25", to: "2026-09-27", days: 3, reason: "Liburan", status: "Menunggu" },
  { id: "LV-0304", employeeId: "EMP-014", type: "Sakit", from: "2026-09-18", to: "2026-09-19", days: 2, reason: "Surat dokter terlampir", status: "Disetujui" },
  { id: "LV-0305", employeeId: "EMP-013", type: "Cuti Khusus", from: "2026-09-29", to: "2026-09-30", days: 2, reason: "Pernikahan saudara", status: "Menunggu" },
];

export const tickets: MaintenanceTicket[] = [
  { id: "MT-0451", machine: "Freezer Tunnel 2", issue: "Suhu tidak stabil pada -35°C, fluktuasi ±4°C", priority: "Tinggi", status: "Dikerjakan", reportedBy: "Sari Dewi", date: "2026-09-17" },
  { id: "MT-0452", machine: "Bandsaw Line 2", issue: "Getaran berlebih pada blade housing", priority: "Sedang", status: "Terbuka", reportedBy: "Dedi Pratama", date: "2026-09-18" },
  { id: "MT-0453", machine: "Vacuum Packer A", issue: "Seal tidak rapat pada bag 8 OZ", priority: "Sedang", status: "Terbuka", reportedBy: "Lina Marlina", date: "2026-09-18" },
  { id: "MT-0449", machine: "Chiller A", issue: "Preventive maintenance bulanan", priority: "Rendah", status: "Selesai", reportedBy: "Fajar Nugroho", date: "2026-09-12" },
];

export const activities: Activity[] = [
  { id: "AC-01", time: "2026-09-18T13:20:00", team: "Sales", text: "SO-2409-001 Pacific Seafood dikirim via MSKU-7712340 (17.850 kg).", ref: "SO-2409-001", tone: "success" },
  { id: "AC-02", time: "2026-09-18T11:05:00", team: "Procurement", text: "PO-2409-005 supply 20 UP (Rp134,8 juta) diajukan, menunggu approval Finance.", ref: "PO-2409-005", tone: "info" },
  { id: "AC-03", time: "2026-09-18T09:40:00", team: "Engineering", text: "Tiket MT-0452 Bandsaw Line 2 dibuka oleh Operations.", ref: "MT-0452", tone: "warning" },
  { id: "AC-04", time: "2026-09-18T08:10:00", team: "Operations", text: "WO-2409-003 Steak 6 OZ dimulai di Bandsaw Line 1 (Shift 1).", ref: "WO-2409-003", tone: "info" },
  { id: "AC-05", time: "2026-09-17T16:30:00", team: "Finance", text: "Invoice PLN INV-AP-2408-09 melewati jatuh tempo (Rp41,3 juta).", ref: "INV-AP-2408-09", tone: "error" },
  { id: "AC-06", time: "2026-09-17T15:00:00", team: "Warehouse", text: "Stok Vacuum Bag 8 OZ di bawah minimum (6.200 / 8.000 pcs).", ref: "ITM-006", tone: "warning" },
  { id: "AC-07", time: "2026-09-17T10:15:00", team: "HR", text: "3 pengajuan cuti menunggu persetujuan atasan.", tone: "info" },
];

export const initialErpState: ErpState = {
  employees,
  suppliers,
  items,
  purchaseOrders,
  movements,
  workOrders,
  customers,
  salesOrders,
  invoices,
  journal,
  budgets,
  leaves,
  tickets,
  activities,
  cashRp: 3_284_500_000,
};
