import { useState } from "react";
import { ChevronDown, Mail, Phone, LifeBuoy } from "lucide-react";
import { PageHeader } from "@/components/cards/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "Bagaimana cara membaca Production Optimizer?",
    a: "Production Optimizer menampilkan rekomendasi alokasi supply ke berbagai SKU berdasarkan ketersediaan bahan baku, kapasitas, dan target profit atau efisiensi energi. Angka mixPct menunjukkan porsi input yang dialokasikan ke tiap SKU, sementara margin dan energi ditampilkan per skenario prioritas yang dipilih.",
  },
  {
    q: "Apa itu resource-driven vs PO-driven?",
    a: "PO-driven berarti produksi mengejar target Purchase Order tanpa mempertimbangkan variasi supply yang diterima, sehingga sering menimbulkan excess product. Resource-driven berarti alokasi produksi disesuaikan dengan supply yang benar-benar tersedia (ukuran, grade, volume), sehingga hasil produksi lebih optimal dan excess dapat ditekan.",
  },
  {
    q: "Bagaimana cara menambah batch supply baru?",
    a: "Buka halaman Supply Intake, klik tombol \"Tambah Batch Supply\", lalu isi data kapal, tanggal tiba, berat, grade ukuran dan kualitas, harga beli, serta kesegaran. Batch baru akan otomatis muncul pada tabel dan grafik distribusi.",
  },
  {
    q: "Apa arti status \"Risiko Aging\" pada Inventory?",
    a: "Status ini menandakan stok telah tersimpan cukup lama dan berisiko menurun kualitasnya jika tidak segera diproses atau dikirim. Gunakan rekomendasi FEFO (First-Expired-First-Out) pada halaman Inventory untuk memprioritaskan item ini.",
  },
  {
    q: "Bagaimana cara menghubungi tim support?",
    a: "Tim support dapat dihubungi melalui email support@arunajaya.co.id atau telepon di jam kerja 08.00–17.00 WIB. Untuk isu mendesak terkait operasional plant, hubungi Production Planner atau Plant Manager yang bertugas.",
  },
];

export default function Help() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div>
      <PageHeader
        title="Help & FAQ"
        subtitle="Pertanyaan umum seputar penggunaan dashboard FISH."
        breadcrumbs={[{ label: "FISH Operations", href: "/app/overview" }, { label: "Help" }]}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LifeBuoy className="h-4 w-4 text-aruna-primary" />
              Pertanyaan Umum
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {faqs.map((item, i) => {
              const isOpen = openIndex === i;
              return (
                <div key={item.q} className="rounded-lg border border-aruna-border">
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                  >
                    <span className="text-sm font-medium text-aruna-text">{item.q}</span>
                    <ChevronDown className={cn("h-4 w-4 shrink-0 text-aruna-textSecondary transition-transform duration-200", isOpen && "rotate-180")} />
                  </button>
                  {isOpen && (
                    <div className="border-t border-aruna-border px-4 py-3 text-sm text-aruna-textSecondary">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hubungi Tim Support</CardTitle>
            <CardDescription>Jam operasional 08.00–17.00 WIB.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <a
              href="mailto:support@arunajaya.co.id"
              className="flex items-center gap-3 rounded-lg border border-aruna-border p-3 transition-colors hover:bg-aruna-light1"
            >
              <Mail className="h-4 w-4 text-aruna-primary" />
              <span className="text-sm text-aruna-text">support@arunajaya.co.id</span>
            </a>
            <a
              href="tel:+627511234567"
              className="flex items-center gap-3 rounded-lg border border-aruna-border p-3 transition-colors hover:bg-aruna-light1"
            >
              <Phone className="h-4 w-4 text-aruna-primary" />
              <span className="text-sm text-aruna-text">(0751) 123-4567</span>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
