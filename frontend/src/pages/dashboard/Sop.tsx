import { useMemo, useState } from "react";
import {
  ShieldCheck,
  Tag,
  DollarSign,
  Gauge,
  Zap,
  Landmark,
  Anchor,
  Scale,
  Upload,
  SlidersHorizontal,
  ClipboardCheck,
  CheckCircle2,
  Factory,
  LineChart,
  ArrowRight,
} from "lucide-react";
import { PageHeader } from "@/components/cards/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { sopRules } from "@/data/sop";
import { cn } from "@/lib/utils";
import type { SOPRule } from "@/types";

const CATEGORIES: { key: SOPRule["category"]; label: string; icon: typeof Tag; variant: "primary" | "warning" | "error" | "default" | "success" }[] = [
  { key: "Eligibility", label: "Eligibility", icon: Tag, variant: "primary" },
  { key: "Pricing", label: "Pricing", icon: DollarSign, variant: "success" },
  { key: "Capacity", label: "Capacity", icon: Gauge, variant: "warning" },
  { key: "Energy", label: "Energy", icon: Zap, variant: "error" },
  { key: "Governance", label: "Governance", icon: Landmark, variant: "default" },
];

const FLOW_STEPS = [
  { label: "Receive", icon: Anchor, desc: "Supply tuna diterima dan dicatat per batch" },
  { label: "Grade", icon: Scale, desc: "Klasifikasi size & quality grade oleh QC" },
  { label: "Input", icon: Upload, desc: "Batch dialokasikan sebagai input produksi" },
  { label: "Optimize", icon: SlidersHorizontal, desc: "Model menghitung mix produk optimal" },
  { label: "Review", icon: LineChart, desc: "Perencana meninjau rekomendasi & rencana" },
  { label: "Approve", icon: ClipboardCheck, desc: "Approval berjenjang sesuai nilai dampak" },
  { label: "Produce", icon: Factory, desc: "Eksekusi produksi sesuai rencana disetujui" },
  { label: "Monitor", icon: Gauge, desc: "Pemantauan progres real-time di lantai produksi" },
  { label: "Evaluate", icon: CheckCircle2, desc: "Evaluasi plan vs actual & pembaruan model" },
];

export default function Sop() {
  const [activeCategory, setActiveCategory] = useState<SOPRule["category"] | "Semua">("Semua");

  const filteredRules = useMemo(
    () => (activeCategory === "Semua" ? sopRules : sopRules.filter((r) => r.category === activeCategory)),
    [activeCategory]
  );

  return (
    <div>
      <PageHeader
        title="Harmonized SOP & Decision Rules"
        subtitle="Aturan keputusan baku yang menyelaraskan eligibility, pricing, kapasitas, energi, dan governance di seluruh siklus produksi FISH."
        breadcrumbs={[{ label: "FISH Operations", href: "/app/overview" }, { label: "SOP & Decision Rules" }]}
        badge={<Badge variant="primary"><ShieldCheck className="h-3.5 w-3.5" />Pilar H — FISH</Badge>}
      />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Alur Keputusan Operasional</CardTitle>
          <CardDescription>Sembilan tahapan governance dari penerimaan supply hingga evaluasi hasil produksi.</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap items-stretch gap-2 overflow-x-auto pb-2">
            {FLOW_STEPS.map((step, i) => (
              <div key={step.label} className="flex items-center gap-2">
                <div className="flex w-[132px] flex-col items-center gap-2 rounded-xl border border-aruna-border bg-aruna-light1/40 px-3 py-4 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-aruna-primary text-white">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <p className="font-display text-sm font-semibold text-aruna-text">{step.label}</p>
                  <p className="text-[11px] leading-snug text-aruna-textSecondary">{step.desc}</p>
                </div>
                {i < FLOW_STEPS.length - 1 && (
                  <ArrowRight className="h-4 w-4 shrink-0 text-aruna-secondary" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveCategory("Semua")}
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
            activeCategory === "Semua"
              ? "border-aruna-primary bg-aruna-primary text-white"
              : "border-aruna-border bg-white text-aruna-textSecondary hover:bg-aruna-light1"
          )}
        >
          Semua ({sopRules.length})
        </button>
        {CATEGORIES.map((c) => {
          const count = sopRules.filter((r) => r.category === c.key).length;
          const active = activeCategory === c.key;
          return (
            <button
              key={c.key}
              onClick={() => setActiveCategory(c.key)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                active
                  ? "border-aruna-primary bg-aruna-primary text-white"
                  : "border-aruna-border bg-white text-aruna-textSecondary hover:bg-aruna-light1"
              )}
            >
              <c.icon className="h-3.5 w-3.5" />
              {c.label} ({count})
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredRules.map((rule) => {
          const cat = CATEGORIES.find((c) => c.key === rule.category)!;
          return (
            <Card key={rule.id} className="flex flex-col p-5">
              <div className="mb-3 flex items-center justify-between">
                <Badge variant={cat.variant}>
                  <cat.icon className="h-3.5 w-3.5" />
                  {cat.label}
                </Badge>
                <span className="text-xs font-medium text-aruna-textSecondary">{rule.id}</span>
              </div>
              <p className="font-display text-sm font-semibold text-aruna-text">{rule.title}</p>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-aruna-textSecondary">{rule.description}</p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
