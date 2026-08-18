import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  LineChart,
  Line,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { AlertCircle, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { PageHeader } from "@/components/cards/PageHeader";
import { ChartCard } from "@/components/charts/ChartCard";
import {
  CHART_COLORS,
  CHART_SUCCESS,
  CHART_ERROR,
  CHART_GRID_COLOR,
  CHART_AXIS_COLOR,
  chartTooltipStyle,
} from "@/components/charts/chart-theme";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import {
  performanceMetrics,
  yieldTrend,
  marginVarianceTrend,
  energyVarianceTrend,
  rootCauseVariance,
} from "@/data/performance";
import { formatNumber, formatKg, formatPercent, formatRupiahJuta, formatKwh } from "@/utils/format";
import { cn } from "@/lib/utils";

// KPI di mana kenaikan nilai berarti performa memburuk (lower-is-better).
const LOWER_IS_BETTER = new Set([
  "Konsumsi Energi",
  "Energy Intensity",
  "Excess Product Ratio",
  "Waktu Proses Rata-rata",
]);

const CATEGORY_VARIANT: Record<string, "primary" | "warning" | "error" | "default"> = {
  Supply: "primary",
  Mesin: "warning",
  Demand: "error",
};

function formatByUnit(value: number, unit: string): string {
  switch (unit) {
    case "%":
      return formatPercent(value, 2);
    case "kg":
      return formatKg(value);
    case "juta Rupiah":
      return formatRupiahJuta(value);
    case "kWh":
      return formatKwh(value);
    case "kWh/kg":
      return `${formatNumber(value, 3)} kWh/kg`;
    case "jam/batch":
      return `${formatNumber(value, 1)} jam/batch`;
    default:
      return formatNumber(value);
  }
}

function isVarianceBad(kpi: string, variancePct: number): boolean {
  return LOWER_IS_BETTER.has(kpi) ? variancePct > 0 : variancePct < 0;
}

export default function Performance() {
  const varianceChartData = performanceMetrics.map((m) => ({
    kpi: m.kpi,
    variancePct: Number(m.variancePct.toFixed(1)),
    bad: isVarianceBad(m.kpi, m.variancePct),
  }));

  return (
    <div>
      <PageHeader
        title="Plan vs Actual"
        subtitle="Bandingkan rencana produksi dengan realisasi lapangan untuk menutup gap eksekusi setiap siklus."
        breadcrumbs={[{ label: "FISH Operations", href: "/app/overview" }, { label: "Plan vs Actual" }]}
        badge={<Badge variant="outline">Siklus 12 Agustus 2024</Badge>}
      />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Ringkasan KPI: Rencana vs Realisasi</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>KPI</TableHead>
                <TableHead>Rencana</TableHead>
                <TableHead>Realisasi</TableHead>
                <TableHead>Varians</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {performanceMetrics.map((m) => {
                const bad = isVarianceBad(m.kpi, m.variancePct);
                return (
                  <TableRow key={m.kpi}>
                    <TableCell className="font-medium">{m.kpi}</TableCell>
                    <TableCell>{formatByUnit(m.planned, m.unit)}</TableCell>
                    <TableCell className="font-semibold">{formatByUnit(m.actual, m.unit)}</TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 text-xs font-semibold",
                          bad ? "text-aruna-error" : "text-aruna-success"
                        )}
                      >
                        {m.variancePct === 0 ? (
                          <Minus className="h-3.5 w-3.5" />
                        ) : m.variancePct > 0 ? (
                          <TrendingUp className="h-3.5 w-3.5" />
                        ) : (
                          <TrendingDown className="h-3.5 w-3.5" />
                        )}
                        {m.variancePct > 0 ? "+" : ""}
                        {formatPercent(m.variancePct, 2)}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard
          title="Varians Plan vs Actual per KPI"
          description="Persentase penyimpangan realisasi terhadap rencana, merah menandakan performa di bawah target"
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={varianceChartData} layout="vertical" margin={{ top: 4, right: 24, left: 24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: CHART_AXIS_COLOR }} axisLine={{ stroke: CHART_GRID_COLOR }} tickLine={false} unit="%" />
                <YAxis type="category" dataKey="kpi" width={150} tick={{ fontSize: 11, fill: CHART_AXIS_COLOR }} axisLine={false} tickLine={false} />
                <Tooltip {...chartTooltipStyle} formatter={(v: number) => [`${v > 0 ? "+" : ""}${v}%`, "Varians"]} />
                <Bar dataKey="variancePct" radius={[0, 6, 6, 0]}>
                  {varianceChartData.map((entry, i) => (
                    <Cell key={i} fill={entry.bad ? CHART_ERROR : CHART_SUCCESS} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Tren Yield Whole Fish → Loin" description="Rencana vs realisasi mingguan, dalam persen">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={yieldTrend} margin={{ top: 4, right: 16, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} vertical={false} />
                <XAxis dataKey="period" tick={{ fontSize: 12, fill: CHART_AXIS_COLOR }} axisLine={{ stroke: CHART_GRID_COLOR }} tickLine={false} />
                <YAxis domain={[56, 63]} tick={{ fontSize: 12, fill: CHART_AXIS_COLOR }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip {...chartTooltipStyle} formatter={(v: number) => `${v}%`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="planned" name="Rencana" stroke={CHART_COLORS[2]} strokeDasharray="4 4" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="actual" name="Realisasi" stroke={CHART_COLORS[0]} strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Varians Margin Mingguan" description="Margin rencana vs realisasi, dalam juta Rupiah">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={marginVarianceTrend} margin={{ top: 4, right: 16, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} vertical={false} />
                <XAxis dataKey="period" tick={{ fontSize: 12, fill: CHART_AXIS_COLOR }} axisLine={{ stroke: CHART_GRID_COLOR }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: CHART_AXIS_COLOR }} axisLine={false} tickLine={false} />
                <Tooltip {...chartTooltipStyle} formatter={(v: number) => formatRupiahJuta(v)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="planned" name="Rencana" fill={CHART_COLORS[5]} radius={[6, 6, 0, 0]} />
                <Line type="monotone" dataKey="actual" name="Realisasi" stroke={CHART_COLORS[0]} strokeWidth={2.5} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Varians Konsumsi Energi Mingguan" description="Energi rencana vs realisasi, dalam kWh">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={energyVarianceTrend} margin={{ top: 4, right: 16, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} vertical={false} />
                <XAxis dataKey="period" tick={{ fontSize: 12, fill: CHART_AXIS_COLOR }} axisLine={{ stroke: CHART_GRID_COLOR }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: CHART_AXIS_COLOR }} axisLine={false} tickLine={false} />
                <Tooltip {...chartTooltipStyle} formatter={(v: number) => formatKwh(v)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="planned" name="Rencana" fill={CHART_COLORS[5]} radius={[6, 6, 0, 0]} />
                <Line type="monotone" dataKey="actual" name="Realisasi" stroke={CHART_ERROR} strokeWidth={2.5} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Root Cause Varians</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 pt-0 sm:grid-cols-2 lg:grid-cols-3">
          {rootCauseVariance.map((rc, i) => (
            <div key={i} className="flex gap-3 rounded-lg border border-aruna-border p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-aruna-errorBg text-aruna-error">
                <AlertCircle className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0">
                <div className="mb-1.5">
                  <Badge variant={CATEGORY_VARIANT[rc.category] ?? "default"}>{rc.category}</Badge>
                </div>
                <p className="text-sm font-semibold text-aruna-text">{rc.title}</p>
                <p className="mt-1 text-xs text-aruna-textSecondary">{rc.impact}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
