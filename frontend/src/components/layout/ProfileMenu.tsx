import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Home, Settings, LogOut, UserCircle } from "lucide-react";
import { currentUser } from "@/data/roles";

export function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  function handleLogout() {
    setOpen(false);
    toast.success("Anda telah keluar dari FISH Operations.");
    navigate("/masuk");
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        title={`${currentUser.name} · ${currentUser.role}`}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-aruna-primary text-xs font-semibold text-white transition-opacity hover:opacity-90"
      >
        {currentUser.avatarInitials}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-60 rounded-xl border border-aruna-border bg-white p-1.5 shadow-soft animate-fade-in">
            <div className="flex items-center gap-2.5 px-2.5 py-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-aruna-primary text-xs font-semibold text-white">
                {currentUser.avatarInitials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-aruna-text">{currentUser.name}</p>
                <p className="truncate text-xs text-aruna-textSecondary">{currentUser.role}</p>
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
