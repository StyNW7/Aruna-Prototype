import { useState, type ReactNode } from "react";
import toast from "react-hot-toast";
import { CheckCircle2, AlertTriangle, XCircle, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/cards/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/badge-status";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { formatDate } from "@/utils/format";
import { skus, skuByCode } from "@/data/skus";
import { qualityRecords } from "@/data/quality";

type EligibilityLevel = "full" | "partial" | "none";

const CATEGORIES = ["SAKU", "Steak", "Poke", "Medallion", "Ground Meat"] as const;

const SIZE_RANK: Record<string, number> = { "14 UP": 1, "20 UP": 2, "30 UP": 3 };
const QUALITY_RANK: Record<string, number> = { "Grade C": 1, "Grade B": 2 };
// Ambang kesegaran minimum per kategori bersifat ilustratif (tidak ada di data model SKU),
// merepresentasikan aturan bisnis: produk premium membutuhkan kesegaran lebih tinggi.
const FRESHNESS_MIN: Record<(typeof CATEGORIES)[number], number> = {
  SAKU: 3,
  Steak: 2,
  Poke: 2,
  Medallion: 1,
  "Ground Meat": 1,
};
const FRESHNESS_RANK: Record<string, number> = { "Perlu Perhatian": 1, Baik: 2, Prima: 3 };

function sizeEligibility(category: (typeof CATEGORIES)[number], sizeValue: string): EligibilityLevel {
  const rank = SIZE_RANK[sizeValue];
  const catSkus = skus.filter((s) => s.category === category);
  const satisfied = catSkus.filter((s) => rank >= SIZE_RANK[s.minSizeGrade]).length;
  if (satisfied === 0) return "none";
  if (satisfied === catSkus.length) return "full";
  return "partial";
}

function qualityEligibility(category: (typeof CATEGORIES)[number], qualityValue: string): EligibilityLevel {
  const rank = QUALITY_RANK[qualityValue];
  const catSkus = skus.filter((s) => s.category === category);
  const satisfied = catSkus.filter((s) => rank >= QUALITY_RANK[s.minQualityGrade]).length;
  if (satisfied === 0) return "none";
  if (satisfied === catSkus.length) return "full";
  return "partial";
}

function freshnessEligibility(category: (typeof CATEGORIES)[number], freshnessValue: string): EligibilityLevel {
  const rank = FRESHNESS_RANK[freshnessValue];
  return rank >= FRESHNESS_MIN[category] ? "full" : "none";
}

const eligibilityIcon: Record<EligibilityLevel, ReactNode> = {
  full: <CheckCircle2 className="mx-auto h-4.5 w-4.5 text-aruna-success" />,
  partial: <AlertTriangle className="mx-auto h-4.5 w-4.5 text-aruna-warning" />,
  none: <XCircle className="mx-auto h-4.5 w-4.5 text-aruna-error" />,
};

const eligibilityLabel: Record<EligibilityLevel, string> = {
  full: "Seluruh SKU pada kategori ini memenuhi syarat",
  partial: "Sebagian SKU memenuhi syarat, cek varian spesifik",
  none: "Tidak ada SKU pada kategori ini yang memenuhi syarat",
};

const matrixRows: { group: string; label: string; check: (cat: (typeof CATEGORIES)[number]) => EligibilityLevel }[] = [
  { group: "Size Grade", label: "14 UP", check: (c) => sizeEligibility(c, "14 UP") },
  { group: "Size Grade", label: "20 UP", check: (c) => sizeEligibility(c, "20 UP") },
  { group: "Size Grade", label: "30 UP", check: (c) => sizeEligibility(c, "30 UP") },
  { group: "Quality Grade", label: "Grade C", check: (c) => qualityEligibility(c, "Grade C") },
  { group: "Quality Grade", label: "Grade B", check: (c) => qualityEligibility(c, "Grade B") },
  { group: "Freshness", label: "Perlu Perhatian", check: (c) => freshnessEligibility(c, "Perlu Perhatian") },
  { group: "Freshness", label: "Baik", check: (c) => freshnessEligibility(c, "Baik") },
  { group: "Freshness", label: "Prima", check: (c) => freshnessEligibility(c, "Prima") },
];

export default function Quality() {
  const [records, setRecords] = useState(qualityRecords);

  function handleAction(id: string, approve: boolean) {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, approvalStatus: approve ? "Disetujui" : "Ditolak" } : r))
    );
    toast[approve ? "success" : "error"](`Batch ${id} ${approve ? "disetujui" : "ditolak"}.`);
  }

  return (
    <div>
      <PageHeader
        title="Quality Control"
        subtitle="Eligibility SKU berdasarkan grade dan persetujuan kualitas per batch."
        breadcrumbs={[{ label: "FISH Operations", href: "/app/overview" }, { label: "Quality Control" }]}
      />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-aruna-primary" />
            Matriks Eligibility Produk
          </CardTitle>
          <CardDescription>
            Menunjukkan kesesuaian setiap nilai grade terhadap syarat minimum SKU pada tiap kategori produk.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <TooltipProvider>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dimensi</TableHead>
                  <TableHead>Nilai</TableHead>
                  {CATEGORIES.map((c) => (
                    <TableHead key={c} className="text-center">{c}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {matrixRows.map((row, idx) => {
                  const showGroup = idx === 0 || matrixRows[idx - 1].group !== row.group;
                  return (
                    <TableRow key={`${row.group}-${row.label}`}>
                      <TableCell className="text-xs font-semibold uppercase tracking-wide text-aruna-textSecondary">
                        {showGroup ? row.group : ""}
                      </TableCell>
                      <TableCell className="font-medium">{row.label}</TableCell>
                      {CATEGORIES.map((c) => {
                        const level = row.check(c);
                        return (
                          <TableCell key={c} className="text-center">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-flex cursor-default">{eligibilityIcon[level]}</span>
                              </TooltipTrigger>
                              <TooltipContent>{eligibilityLabel[level]}</TooltipContent>
                            </Tooltip>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TooltipProvider>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-aruna-textSecondary">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-aruna-success" /> Memenuhi syarat</span>
            <span className="flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5 text-aruna-warning" /> Sebagian memenuhi syarat</span>
            <span className="flex items-center gap-1.5"><XCircle className="h-3.5 w-3.5 text-aruna-error" /> Tidak memenuhi syarat</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Batch Quality Approval</CardTitle>
          <CardDescription>Riwayat inspeksi kualitas dan status persetujuan tiap batch supply.</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch ID</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Freshness</TableHead>
                <TableHead>Eligible SKU</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Inspector</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-semibold text-aruna-primary">{r.batchId}</TableCell>
                  <TableCell>{r.sizeGrade}</TableCell>
                  <TableCell>{r.qualityGrade}</TableCell>
                  <TableCell><StatusBadge status={r.freshness} /></TableCell>
                  <TableCell>
                    <div className="flex max-w-[220px] flex-wrap gap-1">
                      {r.eligibleSkus.slice(0, 3).map((code) => (
                        <Badge key={code} variant="outline">{skuByCode(code)?.name ?? code}</Badge>
                      ))}
                      {r.eligibleSkus.length > 3 && (
                        <Badge variant="neutral">+{r.eligibleSkus.length - 3} lainnya</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell><StatusBadge status={r.approvalStatus} /></TableCell>
                  <TableCell>{r.inspector}</TableCell>
                  <TableCell>{formatDate(r.date)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={r.approvalStatus === "Disetujui"}
                        onClick={() => handleAction(r.id, true)}
                      >
                        Setujui
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={r.approvalStatus === "Ditolak"}
                        onClick={() => handleAction(r.id, false)}
                      >
                        Tolak
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
