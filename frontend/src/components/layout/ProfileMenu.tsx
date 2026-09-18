import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Home, Settings, LogOut, UserCircle } from "lucide-react";
import { currentUser, roleDefinitions } from "@/data/roles";
import { useAppContext } from "@/context/AppContext";

export function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { role } = useAppContext();
  const roleDef = roleDefinitions.find((r) => r.name === role);

  function handleLogout() {
    setOpen(false);
    toast.success("Anda telah keluar dari FISH Operations.");
    navigate("/masuk");
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        title={`${currentUser.name} · ${role}`}
        aria-haspopup="menu"
        aria-expanded={open}
        className="relative flex h-9 w-9 items-center justify-center rounded-full aruna-gradient text-xs font-semibold text-white shadow-sm ring-2 ring-white transition-shadow hover:shadow-glow"
      >
        {currentUser.avatarInitials}
        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-aruna-success" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div role="menu" className="absolute right-0 z-50 mt-2 w-64 rounded-xl border border-aruna-border bg-white p-1.5 shadow-elevated animate-scale-in">
            <div className="flex items-center gap-2.5 rounded-lg bg-aruna-bg px-2.5 py-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full aruna-gradient text-xs font-semibold text-white">
                {currentUser.avatarInitials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-aruna-text">{currentUser.name}</p>
                <p className="truncate text-xs text-aruna-textSecondary">{role}</p>
                {roleDef && <p className="truncate text-[10px] text-aruna-textSecondary/80">{currentUser.plant}</p>}
              </div>
            </div>
            <div className="my-1 border-t border-aruna-border" />
            <Link
              to="/app/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-aruna-text hover:bg-aruna-light1"
            >
              <UserCircle className="h-4 w-4 text-aruna-textSecondary" />
              Profil &amp; Role
            </Link>
            <Link
              to="/app/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-aruna-text hover:bg-aruna-light1"
            >
              <Settings className="h-4 w-4 text-aruna-textSecondary" />
              Pengaturan
            </Link>
            <Link
              to="/"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-aruna-text hover:bg-aruna-light1"
            >
              <Home className="h-4 w-4 text-aruna-textSecondary" />
              Kembali ke Situs Utama
            </Link>
            <div className="my-1 border-t border-aruna-border" />
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-aruna-error hover:bg-aruna-errorBg"
            >
              <LogOut className="h-4 w-4" />
              Keluar
            </button>
          </div>
        </>
      )}
    </div>
  );
}
