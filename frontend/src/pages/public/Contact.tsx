import { useState } from "react";
import { MapPin, Mail, Phone, Clock, Send, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
      <section className="border-b border-aruna-border bg-white py-16">
        <div className="container">
          <Badge variant="primary" className="mb-4">
            Kontak
          </Badge>
          <h1 className="max-w-3xl font-display text-4xl font-bold text-aruna-text">
            Hubungi Tim Aruna
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-aruna-textSecondary">
            Ada pertanyaan seputar operasional, kemitraan, atau FISH Framework? Tim kami siap
            membantu.
          </p>
        </div>
      </section>

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
