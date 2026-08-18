import { Link } from "react-router-dom";
import {
  Fish,
  Ruler,
  Percent,
  Zap,
  Calculator,
  Sliders,
  CheckCircle2,
  Factory,
  Gauge,
  RefreshCcw,
  ArrowRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: Fish,
    title: "Terima Ikan",
    desc: "Whole Fish / WGG tiba di Hub Pelabuhan Bungus, dicatat asal, berat, dan waktu kedatangannya.",
  },
  {
    icon: Ruler,
    title: "Grade & Size",
    desc: "Setiap batch digrading berdasarkan ukuran (14 UP / 20 UP / 30 UP) dan kualitas (Grade B / Grade C).",
  },
  {
    icon: Percent,
    title: "Hitung Yield",
    desc: "Sistem menghitung estimasi yield dari Whole Fish ke Fresh Loin dan potensi tiap SKU berdasarkan karakteristik batch.",
  },
  {
    icon: Zap,
    title: "Analisis Energi",
    desc: "Pilar F menghitung estimasi konsumsi dan biaya energi untuk memproses batch ini menjadi tiap kandidat SKU.",
  },
  {
    icon: Calculator,
    title: "Hitung True Value",
    desc: "Pilar I menggabungkan yield, biaya energi, joint-cost, dan harga jual untuk menemukan nilai sesungguhnya tiap opsi produksi.",
  },
  {
    icon: Sliders,
    title: "Jalankan Optimizer",
    desc: "Production Optimizer merekomendasikan production mix yang memaksimalkan nilai dari supply yang tersedia.",
  },
  {
    icon: CheckCircle2,
    title: "Approve",
    desc: "Rekomendasi ditinjau dan disetujui sesuai SOP dan batas kewenangan yang berlaku (pilar H).",
  },
  {
    icon: Factory,
    title: "Produksi",
    desc: "Tim produksi mengeksekusi rencana yang telah disetujui di lini produksi Hub Bungus.",
  },
  {
    icon: Gauge,
    title: "Monitor",
    desc: "Smart Operations Dashboard memantau realisasi produksi, inventory, dan energi secara real-time.",
  },
  {
    icon: RefreshCcw,
    title: "Review",
    desc: "Hasil plan vs actual dievaluasi untuk menyempurnakan parameter dan rekomendasi berikutnya.",
  },
];

export default function HowItWorks() {
  return (
    <div className="pb-24">
      <section className="border-b border-aruna-border bg-white py-16">
        <div className="container">
          <Badge variant="primary" className="mb-4">
            Cara Kerja
          </Badge>
          <h1 className="max-w-3xl font-display text-4xl font-bold text-aruna-text">
            Dari Ikan Masuk Hingga Keputusan Produksi Tereksekusi
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-aruna-textSecondary">
            Sepuluh langkah berikut menunjukkan bagaimana FISH mengubah satu batch bahan baku
            menjadi keputusan produksi yang optimal, terukur, dan dapat dipertanggungjawabkan.
          </p>
        </div>
      </section>

      <section className="container py-16">
        {/* Desktop timeline */}
        <div className="hidden lg:block">
          <div className="relative">
            <div className="absolute left-0 right-0 top-8 h-0.5 bg-aruna-border" />
            <div className="grid grid-cols-5 gap-6">
              {steps.slice(0, 5).map((s, i) => (
                <div key={s.title} className="relative flex flex-col items-center text-center">
                  <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full aruna-gradient text-white shadow-soft">
                    <s.icon className="h-6 w-6" />
                  </div>
                  <span className="mt-2 text-xs font-semibold text-aruna-secondary">
                    Langkah {i + 1}
                  </span>
                  <h3 className="mt-1 font-display text-sm font-semibold text-aruna-text">
                    {s.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-aruna-textSecondary">{s.desc}</p>
                </div>
              ))}
            </div>
            <div className="relative mt-10">
              <div className="absolute left-0 right-0 top-8 h-0.5 bg-aruna-border" />
              <div className="grid grid-cols-5 gap-6">
                {steps.slice(5, 10).map((s, i) => (
                  <div key={s.title} className="relative flex flex-col items-center text-center">
                    <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full aruna-gradient text-white shadow-soft">
                      <s.icon className="h-6 w-6" />
                    </div>
                    <span className="mt-2 text-xs font-semibold text-aruna-secondary">
                      Langkah {i + 6}
                    </span>
                    <h3 className="mt-1 font-display text-sm font-semibold text-aruna-text">
                      {s.title}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-aruna-textSecondary">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile / tablet vertical list */}
        <div className="space-y-4 lg:hidden">
          {steps.map((s, i) => (
            <Card key={s.title} className="flex items-start gap-4 p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full aruna-gradient text-white">
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-aruna-secondary">Langkah {i + 1}</span>
                <h3 className="font-display text-sm font-semibold text-aruna-text">{s.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-aruna-textSecondary">{s.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="container">
        <Card className="flex flex-col items-center gap-4 border-aruna-border bg-aruna-light1/50 p-10 text-center">
          <h2 className="font-display text-2xl font-bold text-aruna-text">
            Siap melihat langkah-langkah ini bekerja di dashboard nyata?
          </h2>
          <Button asChild variant="gradient" size="lg">
            <Link to="/app/overview">
              Masuk ke Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </Card>
      </section>
    </div>
  );
}
