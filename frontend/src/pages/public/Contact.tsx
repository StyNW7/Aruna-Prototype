import { useState } from "react";
import { MapPin, Mail, Phone, Clock, Send, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/public/PageHero";

const contactDetails = [
  {
    icon: MapPin,
    label: "Alamat Hub",
    value: "Hub Pelabuhan Bungus, Kecamatan Bungus Teluk Kabung, Padang, Sumatera Barat",
  },
  {
    icon: Mail,
    label: "Email",
    value: "operasional@arunajaya.co.id",
  },
  {
    icon: Phone,
    label: "Telepon",
    value: "(0751) 123-456",
  },
  {
    icon: Clock,
    label: "Jam Operasional",
    value: "Senin – Sabtu, 07.00 – 17.00 WIB",
  },
];

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="pb-24">
      <PageHero
        badge="Kontak"
        badgeIcon={Send}
        title="Hubungi Tim Aruna"
        description="Ada pertanyaan seputar operasional, kemitraan, atau FISH Framework? Tim kami siap membantu."
        aside={
          <Card className="overflow-hidden shadow-elevated">
            <div className="relative h-36 aruna-gradient">
              <div className="absolute inset-0 line-grid-light opacity-70" />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <span className="absolute inset-0 -m-3 animate-ping rounded-full bg-white/30" />
                <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-aruna-primary shadow-lg">
                  <MapPin className="h-5 w-5" />
                </div>
              </div>
              <span className="absolute bottom-3 left-4 rounded-md bg-white/90 px-2 py-1 text-[11px] font-semibold text-aruna-dark">
                1°02′ S · 100°23′ E
              </span>
            </div>
            <div className="p-5">
              <p className="font-display text-base font-semibold text-aruna-text">Hub Pelabuhan Bungus</p>
              <p className="mt-1 text-sm text-aruna-textSecondary">Kec. Bungus Teluk Kabung, Padang, Sumatera Barat</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <a href="mailto:operasional@arunajaya.co.id" className="inline-flex items-center gap-1.5 rounded-full border border-aruna-border bg-white px-3 py-1.5 text-xs font-medium text-aruna-text transition-colors hover:border-aruna-medium hover:text-aruna-primary">
                  <Mail className="h-3.5 w-3.5" /> Email
                </a>
                <a href="tel:+62751123456" className="inline-flex items-center gap-1.5 rounded-full border border-aruna-border bg-white px-3 py-1.5 text-xs font-medium text-aruna-text transition-colors hover:border-aruna-medium hover:text-aruna-primary">
                  <Phone className="h-3.5 w-3.5" /> Telepon
                </a>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-aruna-successBg px-3 py-1.5 text-xs font-medium text-aruna-success">
                  <Clock className="h-3.5 w-3.5" /> Senin–Sabtu 07.00–17.00
                </span>
              </div>
            </div>
          </Card>
        }
      />

      <section className="container py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr]">
          {/* Contact details */}
          <div className="space-y-5">
            {contactDetails.map((c) => {
              const href =
                c.label === "Email"
                  ? `mailto:${c.value}`
                  : c.label === "Telepon"
                  ? `tel:${c.value.replace(/[^\d+]/g, "")}`
                  : undefined;
              const Wrapper = href ? "a" : "div";
              return (
                <Card key={c.label} className="p-5">
                  <Wrapper
                    {...(href ? { href } : {})}
                    className={`flex items-start gap-3.5 ${href ? "transition-opacity hover:opacity-80" : ""}`}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-aruna-light1 text-aruna-primary">
                      <c.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-aruna-textSecondary">
                        {c.label}
                      </p>
                      <p className="mt-1 text-sm font-medium text-aruna-text">{c.value}</p>
                    </div>
                  </Wrapper>
                </Card>
              );
            })}
            <div className="flex items-start gap-2 rounded-lg border border-aruna-border bg-aruna-light1/60 p-4 text-xs text-aruna-textSecondary">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-aruna-secondary" />
              Detail kontak bersifat ilustratif untuk kebutuhan prototype business case competition.
            </div>
          </div>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Kirim Pesan</CardTitle>
              <CardDescription>
                Isi formulir berikut, tim kami akan merespons secepatnya. (Formulir ini adalah
                mockup, tidak terhubung ke sistem backend.)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <div className="rounded-lg border border-aruna-success/30 bg-aruna-successBg p-6 text-center">
                  <p className="font-display text-base font-semibold text-aruna-success">
                    Pesan Anda telah "terkirim"
                  </p>
                  <p className="mt-1 text-sm text-aruna-textSecondary">
                    Ini adalah simulasi konfirmasi untuk keperluan demo prototype.
                  </p>
                  <Button className="mt-4" variant="outline" onClick={() => setSubmitted(false)}>
                    Kirim pesan lain
                  </Button>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="name">Nama Lengkap</Label>
                      <Input id="name" placeholder="Masukkan nama Anda" required />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="nama@email.com" required />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="subject">Subjek</Label>
                    <Input id="subject" placeholder="Topik pesan Anda" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="message">Pesan</Label>
                    <textarea
                      id="message"
                      rows={5}
                      required
                      placeholder="Tuliskan pesan Anda di sini..."
                      className="flex w-full rounded-lg border border-aruna-border bg-white px-3 py-2 text-sm text-aruna-text placeholder:text-aruna-textSecondary/60 focus:outline-none focus:ring-2 focus:ring-secondary/40"
                    />
                  </div>
                  <Button type="submit" variant="gradient" size="lg" className="w-full sm:w-auto">
                    <Send className="h-4 w-4" />
                    Kirim Pesan
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
