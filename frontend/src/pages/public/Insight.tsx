import {
  Calculator,
  Zap,
  Repeat,
  TrendingUp,
  Boxes,
  ShieldCheck,
  Info,
  ArrowUpRight,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const articles = [
  {
    icon: Calculator,
    category: "Value Optimization",
    title: "Bagaimana FISH Menghitung True Value Produk",
    excerpt:
      "Mengupas cara pilar Integrated Value Optimization menggabungkan yield, biaya energi, dan joint-cost untuk menemukan nilai sesungguhnya dari setiap SKU.",
    readTime: "6 menit baca",
  },
  {
    icon: Zap,
    category: "Factory Energy",
    title: "Studi Kasus: Efisiensi Energi pada Proses Bandsaw Cutting",
    excerpt:
      "Ilustrasi bagaimana pengukuran konsumsi energi per mesin dapat mengungkap potensi penghematan biaya proses hingga dua digit persen.",
    readTime: "5 menit baca",
  },
  {
    icon: Repeat,
    category: "Transformasi Operasional",
    title: "Dari PO-Driven ke Resource-Driven: Apa Bedanya?",
    excerpt:
      "Perbandingan mendalam antara pendekatan produksi berbasis purchase order dan pendekatan berbasis karakteristik supply aktual.",
    readTime: "7 menit baca",
  },
  {
    icon: TrendingUp,
    category: "Production Optimizer",
    title: "Menentukan Production Mix Optimal dari Supply yang Variatif",
    excerpt:
      "Bagaimana optimizer FISH mempertimbangkan ukuran, grade, dan kesegaran bahan baku dalam merekomendasikan alokasi produksi harian.",
    readTime: "8 menit baca",
  },
  {
    icon: Boxes,
    category: "Inventory",
    title: "Mengurangi Excess Produk dengan Monitoring Berkelanjutan",
    excerpt:
      "Pendekatan proaktif dalam memantau stok WIP dan finished goods agar risiko excess dan aging dapat dideteksi lebih awal.",
    readTime: "4 menit baca",
  },
  {
    icon: ShieldCheck,
    category: "Governance",
    title: "Mengapa SOP yang Harmonis Penting bagi Konsistensi Produksi",
    excerpt:
      "Peran pilar Harmonized SOP & Decision Rules dalam menjaga keputusan tetap konsisten di seluruh shift dan fungsi operasional.",
    readTime: "5 menit baca",
  },
];

export default function Insight() {
  return (
    <div className="pb-24">
      <section className="border-b border-aruna-border bg-white py-16">
        <div className="container">
          <Badge variant="primary" className="mb-4">
            Insight
          </Badge>
          <h1 className="max-w-3xl font-display text-4xl font-bold text-aruna-text">
            Wawasan Seputar Optimalisasi Nilai Perikanan
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-aruna-textSecondary">
            Kumpulan artikel dan studi kasus seputar penerapan FISH — dari efisiensi energi hingga
            strategi optimalisasi production mix.
          </p>
          <div className="mt-6 flex items-center gap-2 rounded-lg border border-aruna-border bg-aruna-light1/60 px-4 py-2.5 text-sm text-aruna-textSecondary">
            <Info className="h-4 w-4 shrink-0 text-aruna-secondary" />
            Konten ilustratif untuk prototype — digunakan untuk keperluan business case competition.
          </div>
        </div>
      </section>

      <section className="container py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <Card key={a.title} className="flex flex-col transition-shadow hover:shadow-soft">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-aruna-light1 text-aruna-primary">
                    <a.icon className="h-5 w-5" />
                  </div>
                  <Badge variant="outline">{a.category}</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col pt-0">
                <h3 className="font-display text-base font-semibold leading-snug text-aruna-text">
                  {a.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-aruna-textSecondary">
                  {a.excerpt}
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-aruna-border pt-3">
                  <span className="flex items-center gap-1.5 text-xs text-aruna-textSecondary">
                    <Clock className="h-3.5 w-3.5" />
                    {a.readTime}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-semibold text-aruna-primary">
                    Baca selengkapnya
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
