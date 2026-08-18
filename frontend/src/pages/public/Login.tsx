import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Fish,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Gauge,
  ClipboardList,
  Wallet,
  Wrench,
  ShieldCheck,
  Handshake,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { roleDefinitions } from "@/data/roles";

const roleIcons: Record<string, typeof Gauge> = {
  "Plant Manager": Gauge,
  "Production Planner": ClipboardList,
  Finance: Wallet,
  Engineering: Wrench,
  "Quality Control": ShieldCheck,
  Commercial: Handshake,
};

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    navigate("/onboarding");
  }

  return (
    <div className="grid min-h-[calc(100svh-4rem)] lg:grid-cols-2">
      {/* Left branding panel */}
      <div className="aruna-gradient relative hidden flex-col justify-between overflow-hidden p-12 text-white lg:flex">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

        <div className="relative flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15">
            <Fish className="h-5 w-5" />
          </div>
          <span className="font-display text-lg font-bold">Aruna FISH</span>
        </div>

        <div className="relative">
          <h1 className="font-display text-3xl font-bold leading-tight">
            Optimalkan Setiap Ikan Menjadi Nilai Berkelanjutan Tertinggi.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/85">
            Masuk ke Smart Operations Dashboard untuk melihat rekomendasi energi, nilai produk,
            dan production mix yang disesuaikan dengan peran Anda.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3">
            {["Factory Energy Intelligence", "Integrated Value Optimization", "Smart Operations Dashboard", "Harmonized SOP"].map(
              (item) => (
                <div key={item} className="rounded-lg border border-white/20 bg-white/10 px-3 py-2.5 text-xs font-medium">
                  {item}
                </div>
              )
            )}
          </div>
        </div>

        <p className="relative text-xs text-white/70">
          PT Aruna Jaya Nuswantara — Hub Pelabuhan Bungus, Padang
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex items-center justify-center bg-aruna-bg px-6 py-16">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg aruna-gradient text-white">
              <Fish className="h-4.5 w-4.5" />
            </div>
            <span className="font-display text-lg font-bold text-aruna-text">Aruna FISH</span>
          </div>

          <h2 className="font-display text-2xl font-bold text-aruna-text">Masuk ke Akun Anda</h2>
          <p className="mt-1.5 text-sm text-aruna-textSecondary">
            Masukkan kredensial Anda untuk mengakses dashboard operasional.
          </p>

          <Card className="mt-6 p-6">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-aruna-textSecondary" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@arunajaya.co.id"
                    className="pl-9"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-aruna-textSecondary" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan password"
                    className="pl-9 pr-9"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-aruna-textSecondary transition-colors hover:text-aruna-text"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-aruna-textSecondary">
                  <input type="checkbox" className="h-4 w-4 rounded border-aruna-border accent-aruna-primary" />
                  Ingat saya
                </label>
                <a href="#" className="font-medium text-aruna-primary hover:underline">
                  Lupa password?
                </a>
              </div>

              <Button type="submit" variant="gradient" size="lg" className="w-full">
                Masuk
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <div className="mt-6 border-t border-aruna-border pt-5">
              <p className="text-xs font-medium uppercase tracking-wide text-aruna-textSecondary">
                Coba sebagai:
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {roleDefinitions.map((r) => {
                  const Icon = roleIcons[r.name] ?? Gauge;
                  const active = selectedRole === r.name;
                  return (
                    <button
                      key={r.name}
                      type="button"
                      onClick={() => setSelectedRole(r.name)}
                      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        active
                          ? "border-aruna-primary bg-aruna-primary text-white"
                          : "border-aruna-border bg-white text-aruna-textSecondary hover:bg-aruna-light1"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {r.name}
                    </button>
                  );
                })}
              </div>
              {selectedRole && (
                <Badge variant="outline" className="mt-3">
                  Peran demo dipilih: {selectedRole}
                </Badge>
              )}
            </div>
          </Card>

          <p className="mt-6 text-center text-sm text-aruna-textSecondary">
            Belum familiar dengan FISH?{" "}
            <Link to="/fish-framework" className="font-medium text-aruna-primary hover:underline">
              Pelajari framework-nya
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
