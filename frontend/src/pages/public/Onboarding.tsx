import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Fish,
  Check,
  ArrowRight,
  ArrowLeft,
  Gauge,
  ClipboardList,
  Wallet,
  Wrench,
  ShieldCheck,
  Handshake,
  Factory,
  Snowflake,
  Warehouse,
  Container,
  Zap,
  Sparkles,
  Rocket,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { roleDefinitions } from "@/data/roles";
import { skus } from "@/data/skus";
import { formatRupiah, formatUSD, formatPercent, formatKwh } from "@/utils/format";

const roleIcons: Record<string, typeof Gauge> = {
  "Plant Manager": Gauge,
  "Production Planner": ClipboardList,
  Finance: Wallet,
  Engineering: Wrench,
  "Quality Control": ShieldCheck,
  Commercial: Handshake,
};

const stepLabels = ["Pilih Role", "Setup Plant", "Setup Energy", "Setup SKU", "Review"];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<string | null>(null);

  const [plant, setPlant] = useState({
    hub: "Hub Pelabuhan Bungus, Padang",
    plantCapacity: "12000",
    freezingCapacity: "8000",
    coldStorageCapacity: "19000",
    maxShipment: "19000",
  });

  const [energy, setEnergy] = useState({
    tariff: "1444.7",
    bandsaw: "5.5",
    freezer: "18",
    chiller: "12",
    coldStorage: "22",
    processing: "9.5",
  });

  const canProceed = step === 0 ? !!role : true;

  function next() {
    if (step < 4) setStep(step + 1);
  }
  function back() {
    if (step > 0) setStep(step - 1);
  }

  return (
    <div className="min-h-[calc(100svh-4rem)] bg-aruna-bg py-12">
      <div className="container max-w-4xl">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg aruna-gradient text-white">
            <Fish className="h-4.5 w-4.5" />
          </div>
          <span className="font-display text-lg font-bold text-aruna-text">Aruna FISH</span>
        </div>
        <h1 className="mt-6 font-display text-2xl font-bold text-aruna-text">
          Setup Awal Sebelum Masuk Dashboard
        </h1>
        <p className="mt-1.5 text-sm text-aruna-textSecondary">
          Lengkapi 5 langkah berikut agar dashboard tersaji sesuai kondisi plant Anda. (Nilai
          default bersifat ilustratif dan dapat disesuaikan.)
        </p>

        {/* Stepper */}
        <div className="mt-8 flex items-center">
          {stepLabels.map((label, i) => (
            <div key={label} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors ${
                    i < step
                      ? "border-aruna-primary bg-aruna-primary text-white"
                      : i === step
                      ? "border-aruna-primary bg-white text-aruna-primary"
                      : "border-aruna-border bg-white text-aruna-textSecondary"
                  }`}
                >
                  {i < step ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <span
                  className={`hidden text-xs font-medium sm:block ${
                    i <= step ? "text-aruna-text" : "text-aruna-textSecondary"
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < stepLabels.length - 1 && (
                <div
                  className={`mx-2 h-0.5 flex-1 transition-colors ${
                    i < step ? "bg-aruna-primary" : "bg-aruna-border"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <Card className="mt-8 p-7">
          {/* STEP 1: Role */}
          {step === 0 && (
            <div>
              <h2 className="font-display text-lg font-semibold text-aruna-text">Pilih Peran Anda</h2>
              <p className="mt-1 text-sm text-aruna-textSecondary">
                Dashboard akan disesuaikan dengan area fokus peran yang Anda pilih.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {roleDefinitions.map((r) => {
                  const Icon = roleIcons[r.name] ?? Gauge;
                  const active = role === r.name;
                  return (
                    <button
                      key={r.name}
                      type="button"
                      onClick={() => setRole(r.name)}
                      className={`rounded-xl border p-4 text-left transition-all ${
                        active
                          ? "border-aruna-primary bg-aruna-light1 shadow-soft"
                          : "border-aruna-border bg-white hover:border-aruna-secondary/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-aruna-light1 text-aruna-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                        {active && (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-aruna-primary text-white">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                      <h3 className="mt-3 font-display text-sm font-semibold text-aruna-text">
                        {r.name}
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-aruna-textSecondary">
                        {r.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Plant */}
          {step === 1 && (
            <div>
              <h2 className="font-display text-lg font-semibold text-aruna-text">Setup Plant</h2>
              <p className="mt-1 text-sm text-aruna-textSecondary">
                Konfigurasi kapasitas operasional Hub Pelabuhan Bungus.
              </p>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="flex items-center gap-1.5">
                    <Factory className="h-3.5 w-3.5" /> Lokasi Hub
                  </Label>
                  <Input value={plant.hub} readOnly className="bg-aruna-light1/50" />
                </div>
                <div className="space-y-1.5">
                  <Label>Kapasitas Plant (kg/hari)</Label>
                  <Input
                    value={plant.plantCapacity}
                    onChange={(e) => setPlant({ ...plant, plantCapacity: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5">
                    <Snowflake className="h-3.5 w-3.5" /> Kapasitas Freezing (kg)
                  </Label>
                  <Input
                    value={plant.freezingCapacity}
                    onChange={(e) => setPlant({ ...plant, freezingCapacity: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5">
                    <Warehouse className="h-3.5 w-3.5" /> Kapasitas Cold Storage (kg)
                  </Label>
                  <Input
                    value={plant.coldStorageCapacity}
                    onChange={(e) => setPlant({ ...plant, coldStorageCapacity: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5">
                    <Container className="h-3.5 w-3.5" /> Maksimum Shipment / Kontainer (kg)
                  </Label>
                  <Input
                    value={plant.maxShipment}
                    onChange={(e) => setPlant({ ...plant, maxShipment: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Energy */}
          {step === 2 && (
            <div>
              <h2 className="font-display text-lg font-semibold text-aruna-text">Setup Energy</h2>
              <p className="mt-1 text-sm text-aruna-textSecondary">
                Parameter tarif dan daya mesin untuk perhitungan Factory Energy Intelligence.
              </p>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5" /> Tarif Listrik (Rp/kWh)
                  </Label>
                  <Input
                    value={energy.tariff}
                    onChange={(e) => setEnergy({ ...energy, tariff: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Daya Bandsaw (kW)</Label>
                  <Input
                    value={energy.bandsaw}
                    onChange={(e) => setEnergy({ ...energy, bandsaw: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Daya Freezer (kW)</Label>
                  <Input
                    value={energy.freezer}
                    onChange={(e) => setEnergy({ ...energy, freezer: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Daya Chiller (kW)</Label>
                  <Input
                    value={energy.chiller}
                    onChange={(e) => setEnergy({ ...energy, chiller: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Daya Cold Storage (kW)</Label>
                  <Input
                    value={energy.coldStorage}
                    onChange={(e) => setEnergy({ ...energy, coldStorage: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Daya Peralatan Proses Lain (kW)</Label>
                  <Input
                    value={energy.processing}
                    onChange={(e) => setEnergy({ ...energy, processing: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: SKU */}
          {step === 3 && (
            <div>
              <h2 className="font-display text-lg font-semibold text-aruna-text">Setup SKU</h2>
              <p className="mt-1 text-sm text-aruna-textSecondary">
                Tinjau parameter 8 SKU yang akan digunakan dalam production optimizer.
              </p>
              <div className="mt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>Harga</TableHead>
                      <TableHead>Yield</TableHead>
                      <TableHead>Min. Grade</TableHead>
                      <TableHead>Min. Size</TableHead>
                      <TableHead>Energi Proses</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {skus.map((s) => (
                      <TableRow key={s.code}>
                        <TableCell className="font-medium text-aruna-text">{s.name}</TableCell>
                        <TableCell>{formatUSD(s.priceUsdPerKg)}/kg</TableCell>
                        <TableCell>{formatPercent(s.yieldFromLoinPct)}</TableCell>
                        <TableCell>{s.minQualityGrade}</TableCell>
                        <TableCell>{s.minSizeGrade}</TableCell>
                        <TableCell>{formatKwh(s.processingKwhPerKg)}/kg</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* STEP 5: Review */}
          {step === 4 && (
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-aruna-primary" />
                <h2 className="font-display text-lg font-semibold text-aruna-text">
                  Review Konfigurasi
                </h2>
              </div>
              <p className="mt-1 text-sm text-aruna-textSecondary">
                Pastikan konfigurasi berikut sudah sesuai sebelum mulai menggunakan dashboard.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Card className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-aruna-textSecondary">
                    Role
                  </p>
                  <p className="mt-1 font-display text-base font-semibold text-aruna-text">
                    {role ?? "Belum dipilih"}
                  </p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-aruna-textSecondary">
                    Hub
                  </p>
                  <p className="mt-1 font-display text-base font-semibold text-aruna-text">
                    {plant.hub}
                  </p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-aruna-textSecondary">
                    Kapasitas Plant
                  </p>
                  <p className="mt-1 font-display text-base font-semibold text-aruna-text">
                    {plant.plantCapacity} kg/hari
                  </p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-aruna-textSecondary">
                    Cold Storage
                  </p>
                  <p className="mt-1 font-display text-base font-semibold text-aruna-text">
                    {plant.coldStorageCapacity} kg
                  </p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-aruna-textSecondary">
                    Tarif Listrik
                  </p>
                  <p className="mt-1 font-display text-base font-semibold text-aruna-text">
                    {formatRupiah(Number(energy.tariff), 1)}/kWh
                  </p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-aruna-textSecondary">
                    Jumlah SKU Aktif
                  </p>
                  <p className="mt-1 font-display text-base font-semibold text-aruna-text">
                    {skus.length} SKU
                  </p>
                </Card>
              </div>

              <div className="mt-8 flex flex-col items-center gap-3 rounded-xl bg-aruna-light1/60 p-8 text-center">
                <Badge variant="success">Konfigurasi siap</Badge>
                <h3 className="font-display text-xl font-bold text-aruna-text">
                  Semua siap, mari mulai mengoptimalkan
                </h3>
                <Button
                  size="lg"
                  variant="gradient"
                  onClick={() => navigate("/app/overview")}
                  className="mt-1"
                >
                  <Rocket className="h-4 w-4" />
                  Mulai Mengoptimalkan
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Navigation */}
        {step < 4 && (
          <div className="mt-6 flex items-center justify-between">
            <Button variant="outline" onClick={back} disabled={step === 0}>
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Button>
            <Button variant="gradient" onClick={next} disabled={!canProceed}>
              Lanjut
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
