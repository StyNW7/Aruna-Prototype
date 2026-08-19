# Aruna FISH — Smart Operations Dashboard

Prototipe web frontend untuk **Aruna FISH** (Factory Energy Intelligence, Integrated Value Optimization, Smart Operations Dashboard, Harmonized SOP) — sebuah konsep platform operasional untuk pabrik pengolahan ikan tuna milik **PT Aruna Jaya Nuswantara** (Hub Pelabuhan Bungus, Padang).

Proyek ini adalah **prototipe murni frontend** — tidak ada backend/API sungguhan. Seluruh data (supply, produksi, energi, SKU, shipment, performa, dsb.) adalah **data dummy/mock** yang deterministik, disusun agar setiap fitur pada dashboard tetap dapat dipakai secara utuh (bukan sekadar tampilan/gimmick): filter benar-benar memfilter, form benar-benar submit dan memberi feedback, tombol export benar-benar menghasilkan file, dan seterusnya.

> Konten dan angka pada aplikasi ini bersifat ilustratif untuk keperluan kompetisi, bukan data operasional nyata PT Aruna Jaya Nuswantara.

---

## Daftar Isi

- [Ringkasan](#ringkasan)
- [Fitur Utama](#fitur-utama)
- [Tech Stack](#tech-stack)
- [Struktur Proyek](#struktur-proyek)
- [Menjalankan Secara Lokal](#menjalankan-secara-lokal)
- [Peta Halaman & Routing](#peta-halaman--routing)
- [Konsep FISH](#konsep-fish)
- [Role & Personalisasi Dashboard](#role--personalisasi-dashboard)
- [Fitur Reports (Preview, PDF, CSV)](#fitur-reports-preview-pdf-csv)
- [Sumber Data Dummy](#sumber-data-dummy)
- [Scripts](#scripts)
- [Deployment](#deployment)
- [Batasan Prototipe](#batasan-prototipe)

---

## Ringkasan

Aruna FISH menggabungkan empat pilar operasional dalam satu dashboard:

| Pilar | Deskripsi singkat |
|---|---|
| **Factory Energy Intelligence** | Memantau konsumsi energi (kWh, biaya) per proses/mesin untuk mengidentifikasi peluang efisiensi. |
| **Integrated Value Optimization** | Menghitung *true value* tiap SKU dari kombinasi yield, biaya energi, dan joint-cost bahan baku. |
| **Smart Operations Dashboard** | Satu tampilan terpusat untuk supply, produksi, shipment, kualitas, hingga performa — disesuaikan per role pengguna. |
| **Harmonized SOP & Decision Rules** | Aturan keputusan dan eskalasi yang konsisten di seluruh shift dan fungsi operasional. |

Website terdiri dari dua area besar:

1. **Situs publik** (marketing/landing) — memperkenalkan Aruna FISH, framework, cara kerja, insight/artikel, dan kontak.
2. **Web Dashboard** (`/app/*`) — aplikasi operasional internal dengan 19 modul, role-based navigation, notifikasi, pencarian global, dan laporan yang bisa diekspor.

## Fitur Utama

Seluruh fitur berikut telah diverifikasi berfungsi penuh (bukan placeholder):

- **Reports** — preview laporan dalam modal, export ke **PDF** (branded, tabel rapi via `jspdf` + `jspdf-autotable`) dan **CSV** (download file nyata via Blob), untuk 8 jenis laporan (Production Summary, Energy Efficiency, SKU Profitability, Yield Analysis, Excess Report, Shipment Report, Plan vs Actual, Management Summary), dengan filter periode aktif.
- **Role switching** — beralih tampilan antar 6 role (Plant Manager, Production Planner, Finance, Engineering, Quality Control, Commercial) baik dari halaman Login maupun dari header dashboard, tersimpan lewat `localStorage` sehingga konsisten antar sesi.
- **Global Search, Notifikasi, Profile Menu** — pencarian di seluruh modul dashboard, panel notifikasi dengan status "sudah dibaca" per item maupun massal, dan menu profil fungsional.
- **Production Optimizer & Scenario Simulator** — kalkulasi alokasi produksi dan simulasi skenario "what-if" berbasis data supply/SKU aktual.
- **Approval Center & SOP** — alur approval dengan status dan aturan keputusan yang terdokumentasi.
- **Insight (artikel publik)** — 6 artikel/studi kasus dengan konten lengkap yang bisa dibuka penuh lewat modal, bukan sekadar teaser.
- **Kontak & Help** — tautan `mailto:`/`tel:` yang benar-benar aktif, bukan teks statis.
- Modul operasional lain yang sepenuhnya interaktif: Supply Intake, Inventory, Traceability, Factory Energy, Value Optimization, Pricing Advisor, Production Plan, Shipment Planner, Excess & Side Product, Quality Control, Plan vs Actual (Performance), Settings.

## Tech Stack

- **React 18** + **TypeScript** + **Vite 6**
- **TailwindCSS 3** (+ `tailwindcss-animate`) untuk styling, dengan design token khas Aruna (`aruna-primary`, `aruna-secondary`, dsb.)
- **React Router v7** untuk routing (situs publik + dashboard `/app/*`)
- **Radix UI** (`Dialog`, `Dropdown Menu`, `Tabs`, `Tooltip`) sebagai basis komponen UI aksesibel, dibungkus di `src/components/ui/`
- **Recharts** untuk visualisasi data/chart
- **react-hot-toast** untuk feedback aksi (notifikasi non-blocking)
- **jsPDF** + **jspdf-autotable** untuk generate dokumen PDF di sisi klien
- **lucide-react** untuk ikon
- **class-variance-authority**, **clsx**, **tailwind-merge** untuk utilitas styling komponen

Tidak ada backend — seluruh state disimpan di memori komponen/React context, dengan sedikit persistensi via `localStorage` (mis. role aktif).

## Struktur Proyek

```
Repo/
├── docs/                      # Riset & materi kompetisi (brainstorm, notulensi, dataset kasus)
├── prompts/                   # Catatan prompt pengembangan
├── frontend/                  # Aplikasi React (source of truth utama)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── public/        # Home, About, FishFramework, HowItWorks, Insight, Contact, Login, Onboarding
│   │   │   ├── dashboard/     # 19 halaman modul /app/*
│   │   │   └── Utility/       # 404, loading screen
│   │   ├── components/
│   │   │   ├── layout/        # Sidebar, DashboardHeader, RoleSwitcher, NotificationDrawer, GlobalSearch, dst.
│   │   │   ├── ui/            # Komponen dasar (button, card, dialog, table, tabs, dst.)
│   │   │   ├── cards/         # KPICard, PageHeader
│   │   │   └── charts/        # ChartCard + tema chart
│   │   ├── context/           # AppContext (role, sidebar, drawer state)
│   │   ├── data/               # Seluruh data dummy/mock (single source of truth)
│   │   ├── utils/              # format.ts, reportData.ts, reportExport.ts
│   │   ├── layouts/            # RootLayout (situs publik)
│   │   └── App.tsx             # Definisi routing
│   └── package.json
└── README.md                   # Dokumen ini
```

## Menjalankan Secara Lokal

Prasyarat: **Node.js 18+** dan **npm**.

```bash
cd frontend
npm install
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5173`. Halaman publik dapat diakses dari `/`, dashboard dari `/app/overview` (atau klik "Coba sebagai [role]" di halaman `/masuk` untuk masuk ke role tertentu).

Build produksi:

```bash
npm run build      # type-check (tsc -b) + build (vite build) → frontend/dist
npm run preview    # preview hasil build secara lokal
```

Lint:

```bash
npm run lint
```

## Peta Halaman & Routing

**Situs publik** (`RootLayout`):

| Path | Halaman |
|---|---|
| `/` | Home |
| `/tentang-aruna` | About |
| `/fish-framework` | FISH Framework |
| `/cara-kerja` | How It Works |
| `/insight` | Insight (artikel) |
| `/kontak` | Contact |
| `/masuk` | Login (demo role switcher) |
| `/onboarding` | Onboarding |

**Web Dashboard** (`DashboardLayout`, prefix `/app`), dikelompokkan sesuai sidebar:

| Grup | Halaman | Path |
|---|---|---|
| Overview | Ringkasan Operasional | `/app/overview` |
| Supply | Supply Intake · Inventory · Traceability | `/app/supply` · `/app/inventory` · `/app/traceability` |
| Optimization | Production Optimizer · Factory Energy · Value Optimization · Pricing Advisor · Scenario Simulator | `/app/optimizer` · `/app/energy` · `/app/value` · `/app/pricing` · `/app/scenario` |
| Execution | Production Plan · Shipment Planner · Excess & Side Product · Quality Control | `/app/production` · `/app/shipment` · `/app/excess` · `/app/quality` |
| Monitoring | Plan vs Actual · Reports | `/app/performance` · `/app/reports` |
| Governance | SOP & Decision Rules · Approval Center | `/app/sop` · `/app/approvals` |
| System | Settings · Help | `/app/settings` · `/app/help` |

Route tidak dikenal diarahkan ke halaman `NotFound404`.

## Konsep FISH

- **F**actory Energy Intelligence — intensitas energi (kWh/kg) per proses & mesin, biaya energi per SKU.
- **I**ntegrated Value Optimization — true value SKU dari yield, energi, dan joint-cost.
- **S**mart Operations Dashboard — satu panel kendali operasional lintas fungsi.
- **H**armonized SOP & Decision Rules — aturan keputusan dan eskalasi yang konsisten.

Detail naratif tiap pilar dapat dibaca pada halaman publik `/fish-framework`, `/cara-kerja`, dan artikel-artikel di `/insight`.

## Role & Personalisasi Dashboard

Dashboard mendukung 6 role dengan fokus area dan halaman default berbeda (`frontend/src/data/roles.ts`):

| Role | Fokus | Halaman default |
|---|---|---|
| Plant Manager | Overview KPI, Approval Center, Production Plan, Risk | `/app/overview` |
| Production Planner | Supply Intake, Production Optimizer, Production Plan, Inventory | `/app/supply` |
| Finance | Pricing Advisor, Value Optimization, Profitability | `/app/value` |
| Engineering | Factory Energy, Machine, Capacity | `/app/energy` |
| Quality Control | Quality Control, Eligibility, Traceability | `/app/quality` |
| Commercial | Pricing, Demand, Buyer Order | `/app/pricing` |

Role dapat dipilih dari:
1. Halaman **Login** (`/masuk`) melalui tombol "Coba sebagai [role]" — otomatis diarahkan ke halaman default role tersebut.
2. **Role Switcher** di header dashboard — mengganti tampilan tanpa perlu keluar.

Pilihan role disimpan di `localStorage` (`aruna_role`) sehingga tetap konsisten saat berpindah antara situs publik dan dashboard.

## Fitur Reports (Preview, PDF, CSV)

Modul `/app/reports` menghasilkan dokumen laporan nyata dari data mock, dibangun dari dua modul inti:

- **`src/utils/reportData.ts`** — membentuk `ReportDoc` (ringkasan metrik + tabel data) untuk 8 jenis laporan berdasarkan periode yang dipilih pengguna, bersumber dari `data/production.ts`, `data/energy.ts`, `data/skus.ts`, `data/shipment.ts`, dan `data/performance.ts`.
- **`src/utils/reportExport.ts`** — mengekspor `ReportDoc` yang sama menjadi:
  - **CSV** — file `.csv` (UTF-8 + BOM) diunduh langsung via Blob, berisi ringkasan, seluruh tabel, dan catatan laporan.
  - **PDF** — dokumen A4 bermerek Aruna (header, ringkasan metrik, tabel bergaya via `jspdf-autotable`, footer bernomor halaman) via `jsPDF`.

Tombol **Preview** membuka modal berisi tabel yang sama persis dengan yang diekspor (satu sumber data untuk preview & export, tidak ada duplikasi logika), lengkap dengan opsi **Cetak**, **Export CSV**, dan **Export PDF** langsung dari dalam modal.

## Sumber Data Dummy

Semua data aplikasi berada di `frontend/src/data/*.ts` sebagai *single source of truth* deterministik (bukan random), meliputi: `production.ts`, `energy.ts`, `skus.ts`, `supply.ts`, `inventory.ts`, `shipment.ts`, `quality.ts`, `performance.ts`, `sop.ts`, `notifications.ts`, `roles.ts`. Formatting angka (Rupiah, USD, persen, kg, kWh) mengikuti locale Indonesia melalui `frontend/src/utils/format.ts`.

## Scripts

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Menjalankan dev server (Vite, HMR) |
| `npm run build` | Type-check (`tsc -b`) lalu build produksi ke `dist/` |
| `npm run preview` | Preview hasil build produksi secara lokal |
| `npm run lint` | Menjalankan ESLint pada seluruh source |

## Deployment

Proyek sudah dikonfigurasi untuk deploy statis ke **Vercel** (`frontend/vercel.json`) — build command `npm run build`, output directory `dist`. Karena murni SPA berbasis Vite tanpa backend, dapat pula di-deploy ke penyedia static hosting lain (Netlify, GitHub Pages, dsb.) selama rewrite SPA (`/* → /index.html`) dikonfigurasi.