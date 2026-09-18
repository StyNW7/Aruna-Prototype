import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Save, RotateCcw, Building2, Coins, Hash, Bell, ShieldCheck, Database, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useErp } from "../ErpContext";
import { KURS_USD } from "../seed";
import { ErpPageHeader, SectionCard, Field } from "../components/shared";
import { cn } from "@/lib/utils";

const KEY = "aruna_erp_settings_v1";

interface ErpSettings {
  company: string;
  plant: string;
  currency: "IDR" | "USD";
  kurs: number;
  fiscalStart: string;
  poPrefix: string;
  soPrefix: string;
  invPrefix: string;
  approvalLimitRp: number;
  notifyLowStock: boolean;
  notifyOverdue: boolean;
  notifyApproval: boolean;
  weeklyDigest: boolean;
}

const DEFAULTS: ErpSettings = {
  company: "PT Aruna Jaya Nuswantara",
  plant: "Hub Pelabuhan Bungus, Padang",
  currency: "IDR",
  kurs: KURS_USD,
  fiscalStart: "Januari",
  poPrefix: "PO-",
  soPrefix: "SO-",
  invPrefix: "INV-",
  approvalLimitRp: 50_000_000,
  notifyLowStock: true,
  notifyOverdue: true,
  notifyApproval: true,
  weeklyDigest: false,
};

function load(): ErpSettings {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? { ...DEFAULTS, ...(JSON.parse(raw) as Partial<ErpSettings>) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

function Toggle({ checked, onChange, label, desc }: { checked: boolean; onChange: (v: boolean) => void; label: string; desc: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="flex w-full items-center justify-between gap-4 rounded-lg px-3 py-3 text-left transition-colors hover:bg-aruna-bg">
      <span>
        <span className="block text-sm font-medium text-aruna-text">{label}</span>
        <span className="block text-xs text-aruna-textSecondary">{desc}</span>
      </span>
      <span className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", checked ? "aruna-gradient" : "bg-aruna-light2")}>
        <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform", checked ? "translate-x-[22px]" : "translate-x-0.5")} />
      </span>
    </button>
  );
}

export default function ErpSettingsPage() {
  const { state, reset } = useErp();
  const [s, setS] = useState<ErpSettings>(() => load());
  const [dirty, setDirty] = useState(false);

  useEffect(() => setDirty(true), [s]);
  useEffect(() => setDirty(false), []);

  function update<K extends keyof ErpSettings>(k: K, v: ErpSettings[K]) {
    setS((prev) => ({ ...prev, [k]: v }));
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    try {
      window.localStorage.setItem(KEY, JSON.stringify(s));
      setDirty(false);
      toast.success("Pengaturan ERP disimpan.");
    } catch {
      toast.error("Gagal menyimpan pengaturan (storage tidak tersedia).");
    }
  }

  function restore() {
    setS(DEFAULTS);
    window.localStorage.removeItem(KEY);
    toast("Pengaturan dikembalikan ke default.", { icon: "↩️" });
  }

  function backup() {
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), settings: s, state }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aruna-erp-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup data ERP (JSON) diunduh.");
  }

  function restoreBackup(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as { settings?: ErpSettings; state?: unknown };
        if (parsed.settings) {
          setS({ ...DEFAULTS, ...parsed.settings });
          window.localStorage.setItem(KEY, JSON.stringify({ ...DEFAULTS, ...parsed.settings }));
        }
        if (parsed.state) {
          window.localStorage.setItem("aruna_erp_state_v1", JSON.stringify(parsed.state));
          toast.success("Backup dipulihkan — memuat ulang data ERP...");
          setTimeout(() => window.location.reload(), 600);
          return;
        }
        toast.success("Pengaturan dipulihkan dari backup.");
      } catch {
        toast.error("Berkas backup tidak valid.");
      }
    };
    reader.readAsText(file);
  }

  const storageKb = Math.round((JSON.stringify(state).length / 1024) * 10) / 10;

  return (
    <div>
      <ErpPageHeader
        title="Pengaturan ERP"
        subtitle="Profil perusahaan, mata uang & kurs, penomoran dokumen, batas approval, notifikasi, serta backup/restore data."
        actions={
          <>
            <Button variant="outline" onClick={restore}><RotateCcw className="h-4 w-4" /> Default</Button>
            <Button form="erp-settings" type="submit" disabled={!dirty}><Save className="h-4 w-4" /> Simpan</Button>
          </>
        }
      />

      <form id="erp-settings" onSubmit={save} className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <SectionCard title="Profil Perusahaan" description="Dipakai pada header dokumen PDF (invoice, PO, quotation)" icon={<Building2 className="mt-0.5 h-4 w-4 text-aruna-primary" />}>
            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
              <Field label="Nama perusahaan"><Input value={s.company} onChange={(e) => update("company", e.target.value)} /></Field>
              <Field label="Plant / hub"><Input value={s.plant} onChange={(e) => update("plant", e.target.value)} /></Field>
            </div>
          </SectionCard>

          <SectionCard title="Mata Uang & Periode" description="Kurs dipakai untuk konversi USD → IDR pada quotation dan invoice" icon={<Coins className="mt-0.5 h-4 w-4 text-aruna-primary" />}>
            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-3">
              <Field label="Mata uang pelaporan">
                <Select value={s.currency} onChange={(e) => update("currency", e.target.value as ErpSettings["currency"])}><option value="IDR">IDR — Rupiah</option><option value="USD">USD — Dolar AS</option></Select>
              </Field>
              <Field label="Kurs USD/IDR" hint={`Acuan seed: Rp${KURS_USD.toLocaleString("id-ID")}`}><Input type="number" min={1000} value={s.kurs} onChange={(e) => update("kurs", Number(e.target.value))} /></Field>
              <Field label="Awal tahun fiskal">
                <Select value={s.fiscalStart} onChange={(e) => update("fiscalStart", e.target.value)}>{["Januari", "April", "Juli", "Oktober"].map((m) => <option key={m}>{m}</option>)}</Select>
              </Field>
            </div>
          </SectionCard>

          <SectionCard title="Penomoran Dokumen & Approval" description="Prefix nomor dokumen dan batas nilai yang memerlukan persetujuan Finance" icon={<Hash className="mt-0.5 h-4 w-4 text-aruna-primary" />}>
            <div className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-4">
              <Field label="Prefix PO"><Input value={s.poPrefix} onChange={(e) => update("poPrefix", e.target.value)} /></Field>
              <Field label="Prefix SO"><Input value={s.soPrefix} onChange={(e) => update("soPrefix", e.target.value)} /></Field>
              <Field label="Prefix Invoice"><Input value={s.invPrefix} onChange={(e) => update("invPrefix", e.target.value)} /></Field>
              <Field label="Batas approval (Rp)" hint="PO di atas nilai ini wajib approval"><Input type="number" min={0} step={1000000} value={s.approvalLimitRp} onChange={(e) => update("approvalLimitRp", Number(e.target.value))} /></Field>
            </div>
            <div className="flex flex-wrap gap-2 border-t border-aruna-border px-5 py-3 text-xs text-aruna-textSecondary">
              <span>Contoh:</span>
              <Badge variant="outline">{s.poPrefix}2409-008</Badge>
              <Badge variant="outline">{s.soPrefix}2409-008</Badge>
              <Badge variant="outline">{s.invPrefix}AR-2409-09</Badge>
            </div>
          </SectionCard>

          <SectionCard title="Notifikasi" description="Peringatan otomatis yang muncul di Perlu Tindakan & Log Aktivitas" icon={<Bell className="mt-0.5 h-4 w-4 text-aruna-primary" />}>
            <div className="divide-y divide-aruna-border p-2">
              <Toggle checked={s.notifyLowStock} onChange={(v) => update("notifyLowStock", v)} label="Stok di bawah minimum" desc="Beri tahu Procurement saat item melewati batas minimum" />
              <Toggle checked={s.notifyOverdue} onChange={(v) => update("notifyOverdue", v)} label="Invoice jatuh tempo / terlambat" desc="Pengingat harian untuk AR & AP yang melewati jatuh tempo" />
              <Toggle checked={s.notifyApproval} onChange={(v) => update("notifyApproval", v)} label="Antrean approval" desc="Badge & pesan saat ada PO, cuti, atau quotation baru" />
              <Toggle checked={s.weeklyDigest} onChange={(v) => update("weeklyDigest", v)} label="Ringkasan mingguan" desc="Kirim ringkasan KPI lintas tim setiap Senin pagi" />
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard title="Status Sistem" icon={<ShieldCheck className="mt-0.5 h-4 w-4 text-aruna-success" />}>
            <dl className="divide-y divide-aruna-border text-sm">
              {[
                ["Versi ERP", "Extended 1.2 (prototype)"],
                ["Penyimpanan", `localStorage · ${storageKb} KB`],
                ["Entitas", `${state.employees.length + state.items.length + state.purchaseOrders.length + state.salesOrders.length + state.invoices.length + state.journal.length} rekaman`],
                ["Sinkronisasi FISH", "Aktif · realtime"],
                ["Peran aktif", "Andi Wirawan (demo)"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-3 px-5 py-2.5">
                  <dt className="text-aruna-textSecondary">{k}</dt>
                  <dd className="text-right font-medium text-aruna-text">{v}</dd>
                </div>
              ))}
            </dl>
          </SectionCard>

          <SectionCard title="Backup & Restore" description="Unduh seluruh data ERP sebagai JSON, atau pulihkan dari berkas" icon={<Database className="mt-0.5 h-4 w-4 text-aruna-primary" />}>
            <div className="space-y-2 p-5">
              <Button type="button" variant="outline" className="w-full justify-start" onClick={backup}><Download className="h-4 w-4" /> Unduh backup (JSON)</Button>
              <label className="flex w-full cursor-pointer items-center gap-2 rounded-lg border border-aruna-border bg-white px-4 py-2 text-sm font-medium text-aruna-text transition-colors hover:border-aruna-medium hover:bg-aruna-light1">
                <Upload className="h-4 w-4" /> Pulihkan dari berkas...
                <input type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files?.[0] && restoreBackup(e.target.files[0])} />
              </label>
              <button type="button" onClick={() => { reset(); toast.success("Data demo ERP direset ke seed."); }} className="w-full rounded-lg px-4 py-2 text-left text-xs font-medium text-aruna-textSecondary transition-colors hover:bg-aruna-errorBg hover:text-aruna-error">
                Reset data demo ke kondisi awal
              </button>
            </div>
          </SectionCard>
        </div>
      </form>
    </div>
  );
}
