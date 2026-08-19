import { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const articles = [
  {
    icon: Calculator,
    category: "Value Optimization",
    title: "Bagaimana FISH Menghitung True Value Produk",
    excerpt:
      "Mengupas cara pilar Integrated Value Optimization menggabungkan yield, biaya energi, dan joint-cost untuk menemukan nilai sesungguhnya dari setiap SKU.",
    readTime: "6 menit baca",
    body: [
      "Selama ini banyak pabrik pengolahan menilai kinerja SKU semata dari harga jual per kilogram. Pendekatan itu menyembunyikan biaya nyata di balik setiap potongan produk — mulai dari yield yang berbeda-beda antar ukuran ikan, konsumsi energi per proses, hingga alokasi biaya bersama (joint-cost) dari satu ekor ikan yang sama.",
      "Pilar Integrated Value Optimization pada FISH menghitung true value dengan menggabungkan tiga komponen: nilai jual (harga x yield), biaya energi pemrosesan per kg, dan porsi joint-cost bahan baku yang dialokasikan secara proporsional ke setiap SKU turunan.",
      "Hasilnya adalah peringkat SKU berdasarkan margin sesungguhnya, bukan sekadar harga jual — sehingga keputusan alokasi produksi dapat difokuskan pada kombinasi SKU yang benar-benar memaksimalkan nilai dari setiap kilogram supply yang masuk.",
    ],
  },
  {
    icon: Zap,
    category: "Factory Energy",
    title: "Studi Kasus: Efisiensi Energi pada Proses Bandsaw Cutting",
    excerpt:
      "Ilustrasi bagaimana pengukuran konsumsi energi per mesin dapat mengungkap potensi penghematan biaya proses hingga dua digit persen.",
    readTime: "5 menit baca",
    body: [
      "Proses bandsaw cutting umumnya menjadi salah satu titik konsumsi energi tertinggi pada lini pemrosesan ikan tuna, karena berjalan hampir sepanjang shift produksi dengan daya motor yang signifikan.",
      "Dengan mencatat daya (kW), runtime (jam), dan volume yang diproses per mesin, Factory Energy Intelligence dapat menghitung intensitas energi (kWh/kg) secara presisi — mengungkap mesin atau shift mana yang beroperasi di bawah efisiensi optimal.",
      "Pada simulasi prototipe ini, proses Bandsaw Cutting tercatat menyumbang sekitar 30% dari total biaya energi pabrik — menjadikannya prioritas utama untuk inisiatif efisiensi seperti penjadwalan ulang beban atau perawatan preventif.",
    ],
  },
  {
    icon: Repeat,
    category: "Transformasi Operasional",
    title: "Dari PO-Driven ke Resource-Driven: Apa Bedanya?",
    excerpt:
      "Perbandingan mendalam antara pendekatan produksi berbasis purchase order dan pendekatan berbasis karakteristik supply aktual.",
    readTime: "7 menit baca",
    body: [
      "Model produksi PO-driven dimulai dari pesanan buyer, lalu mencari bahan baku yang sesuai — pendekatan ini rawan menghasilkan gap antara apa yang dipesan dan apa yang benar-benar tersedia di lapangan, terutama untuk komoditas alami seperti tuna yang ukuran dan gradenya bervariasi setiap kedatangan.",
      "Sebaliknya, pendekatan resource-driven pada FISH dimulai dari karakteristik supply aktual (ukuran, grade, kesegaran) yang masuk ke hub, lalu menentukan kombinasi SKU paling optimal yang bisa dihasilkan dari supply tersebut.",
      "Transformasi ini menggeser peran perencanaan produksi dari sekadar administrasi pesanan menjadi optimasi nilai aktif — production plan disusun ulang setiap siklus berdasarkan apa yang benar-benar tersedia, bukan asumsi statis.",
    ],
  },
  {
    icon: TrendingUp,
    category: "Production Optimizer",
    title: "Menentukan Production Mix Optimal dari Supply yang Variatif",
    excerpt:
      "Bagaimana optimizer FISH mempertimbangkan ukuran, grade, dan kesegaran bahan baku dalam merekomendasikan alokasi produksi harian.",
    readTime: "8 menit baca",
    body: [
      "Setiap kedatangan supply tuna membawa kombinasi ukuran (size grade), tingkat kualitas, dan kesegaran yang berbeda. Production Optimizer FISH menilai kelayakan setiap SKU terhadap karakteristik batch tersebut sebelum menghitung alokasi.",
      "Skor optimasi mempertimbangkan margin per kg, intensitas energi, dan permintaan pasar (demand ceiling) secara simultan — menghasilkan alokasi kg per SKU yang memaksimalkan total value dari batch supply yang sedang diproses.",
      "Karena sifatnya deterministik dan reaktif terhadap input, perencana produksi dapat mengubah prioritas (margin, energi, atau throughput) dan langsung melihat bagaimana alokasi berubah — mendukung pengambilan keputusan yang cepat dan transparan.",
    ],
  },
  {
    icon: Boxes,
    category: "Inventory",
    title: "Mengurangi Excess Produk dengan Monitoring Berkelanjutan",
    excerpt:
      "Pendekatan proaktif dalam memantau stok WIP dan finished goods agar risiko excess dan aging dapat dideteksi lebih awal.",
    readTime: "4 menit baca",
    body: [
      "Excess product — sisa hasil proses yang tidak terserap oleh SKU utama — sering kali baru disadari setelah menumpuk di cold storage. Padahal, potensi excess sudah dapat diperkirakan sejak tahap perencanaan produksi.",
      "Dengan memonitor rasio target versus realisasi output secara berkelanjutan, tim operasional dapat mendeteksi batch yang berisiko menghasilkan excess lebih awal, lalu segera merancang jalur alokasi alternatif (mis. ke Ground Meat) sebelum produk kehilangan nilai akibat aging.",
      "Prototipe ini menunjukkan bagaimana rasio excess product dapat dilacak sebagai KPI reguler — bukan sekadar catatan akhir siklus — sehingga tindakan korektif bisa diambil dalam hitungan jam, bukan hari.",
    ],
  },
  {
    icon: ShieldCheck,
    category: "Governance",
    title: "Mengapa SOP yang Harmonis Penting bagi Konsistensi Produksi",
    excerpt:
      "Peran pilar Harmonized SOP & Decision Rules dalam menjaga keputusan tetap konsisten di seluruh shift dan fungsi operasional.",
    readTime: "5 menit baca",
    body: [
      "Tanpa aturan keputusan yang terdokumentasi, dua shift yang berbeda dapat mengambil keputusan alokasi produksi yang berbeda untuk kondisi supply yang serupa — menciptakan inkonsistensi yang sulit dilacak akar penyebabnya.",
      "Harmonized SOP & Decision Rules mendefinisikan batas dan eskalasi yang jelas: kapan sebuah keputusan bisa diambil otomatis oleh sistem, kapan perlu persetujuan Plant Manager, dan siapa yang bertanggung jawab pada setiap simpul keputusan.",
      "Hasilnya adalah operasional yang lebih dapat diprediksi — setiap keputusan penting terekam, dapat ditelusuri, dan konsisten meskipun dieksekusi oleh orang atau shift yang berbeda.",
    ],
  },
];

export default function Insight() {
  const [activeArticle, setActiveArticle] = useState<(typeof articles)[number] | null>(null);
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
            <Card
              key={a.title}
              role="button"
              tabIndex={0}
              onClick={() => setActiveArticle(a)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setActiveArticle(a);
                }
              }}
              className="flex cursor-pointer flex-col transition-shadow hover:shadow-soft"
            >
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

      <Dialog open={!!activeArticle} onOpenChange={(open) => !open && setActiveArticle(null)}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          {activeArticle && (
            <>
              <DialogHeader>
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-aruna-light1 text-aruna-primary">
                    <activeArticle.icon className="h-4.5 w-4.5" />
                  </div>
                  <Badge variant="outline">{activeArticle.category}</Badge>
                </div>
                <DialogTitle>{activeArticle.title}</DialogTitle>
                <DialogDescription className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {activeArticle.readTime}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {activeArticle.body.map((para, i) => (
                  <p key={i} className="text-sm leading-relaxed text-aruna-textSecondary">
                    {para}
                  </p>
                ))}
              </div>
              <div className="mt-5 flex items-center gap-2 rounded-lg border border-aruna-border bg-aruna-light1/60 px-3 py-2 text-xs text-aruna-textSecondary">
                <Info className="h-3.5 w-3.5 shrink-0 text-aruna-secondary" />
                Konten ilustratif untuk prototype — digunakan untuk keperluan business case competition.
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
