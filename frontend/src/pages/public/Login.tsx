import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
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
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { roleDefinitions } from "@/data/roles";
import type { RoleName } from "@/types";

// Kredensial demo per role — terisi otomatis saat role dipilih
const demoEmail: Record<string, string> = {
  "Plant Manager": "plant.manager@arunajaya.co.id",
  "Production Planner": "planner@arunajaya.co.id",
  Finance: "finance@arunajaya.co.id",
  Engineering: "engineering@arunajaya.co.id",
  "Quality Control": "qc@arunajaya.co.id",
  Commercial: "commercial@arunajaya.co.id",
};

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
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<RoleName | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function chooseRole(role: RoleName) {
    setSelectedRole(role);
    setEmail(demoEmail[role] ?? "");
    setPassword("aruna-demo");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    // Simulasi autentikasi singkat agar transisi terasa nyata
    window.setTimeout(() => {
      if (selectedRole) {
        window.localStorage.setItem("aruna_role", selectedRole);
        const target = roleDefinitions.find((r) => r.name === selectedRole)?.defaultRoute ?? "/app/overview";
        toast.success(`Masuk sebagai ${selectedRole}.`);
        navigate(target);
        return;
      }
      toast("Pilih peran demo terlebih dahulu, atau lanjutkan onboarding.", { icon: "👋" });
      setSubmitting(false);
      navigate("/onboarding");
    }, 500);
  }

  function handleForgotPassword() {
    toast("Tautan reset password telah dikirim ke email Anda (simulasi prototipe).", { icon: "📧" });
  }

  return (
    <div className="grid min-h-[calc(100svh-4rem)] lg:grid-cols-2">
      {/* Left branding panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-aruna-gradient-dark p-12 text-white lg:flex">
        <div className="pointer-events-none absolute inset-0 line-grid-light opacity-60" />
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl animate-float-slow" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-aruna-medium/30 blur-3xl animate-float" />

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
              (item, i) => (
                <div key={item} className="flex items-center gap-2.5 rounded-lg border border-white/20 bg-white/10 px-3 py-2.5 text-xs font-medium backdrop-blur-sm">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/15 font-display text-[11px] font-bold">
                    {"FISH"[i]}
                  </span>
                  {item}
                </div>
              )
            )}
          </div>
          <div className="mt-8 flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15">
              <Sparkles className="h-4 w-4" />
            </div>
            <p className="text-xs leading-relaxed text-white/85">
              Mode demo: pilih salah satu peran di panel kanan, kredensial akan terisi otomatis.
            </p>
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
                    autoComplete="email"
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-aruna-textSecondary transition-colors hover:text-aruna-text"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-aruna-textSecondary">
                  <input type="checkbox" className="aruna-check" />
                  Ingat saya
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="font-medium text-aruna-primary hover:underline"
                >
                  Lupa password?
                </button>
              </div>

              <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Memverifikasi...
                  </>
                ) : (
                  <>
                    Masuk
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 border-t border-aruna-border pt-5">
              <p className="text-xs font-medium uppercase tracking-wide text-aruna-textSecondary">
                Coba sebagai (demo):
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {roleDefinitions.map((r) => {
                  const Icon = roleIcons[r.name] ?? Gauge;
                  const active = selectedRole === r.name;
                  return (
                    <button
                      key={r.name}
                      type="button"
                      onClick={() => chooseRole(r.name)}
                      aria-pressed={active}
                      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                        active
                          ? "border-aruna-primary bg-aruna-primary text-white shadow-glow"
                          : "border-aruna-border bg-white text-aruna-textSecondary hover:border-aruna-medium hover:bg-aruna-light1"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {r.name}
                    </button>
                  );
                })}
              </div>
              {selectedRole && (
                <div className="mt-3 flex items-start gap-2 rounded-lg border border-aruna-successBg bg-aruna-successBg/60 px-3 py-2 text-xs text-aruna-success animate-fade-in">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>
                    Peran <strong>{selectedRole}</strong> dipilih. Kredensial demo terisi — klik <strong>Masuk</strong> untuk
                    membuka {roleDefinitions.find((r) => r.name === selectedRole)?.focusAreas[0]}.
                  </span>
                </div>
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
