import { createContext, useContext, useState, type ReactNode } from "react";
import type { RoleName } from "@/types";
import { currentUser } from "@/data/roles";

interface AppContextValue {
  role: RoleName;
  setRole: (role: RoleName) => void;
  sidebarCollapsed: boolean;
  toggleSidebarCollapsed: () => void;
  mobileDrawerOpen: boolean;
  setMobileDrawerOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

function readStoredRole(): RoleName {
  if (typeof window === "undefined") return currentUser.role;
  const stored = window.localStorage.getItem("aruna_role");
  return (stored as RoleName) || currentUser.role;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<RoleName>(readStoredRole);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  function setRole(next: RoleName) {
    setRoleState(next);
    window.localStorage.setItem("aruna_role", next);
  }

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        sidebarCollapsed,
        toggleSidebarCollapsed: () => setSidebarCollapsed((v) => !v),
        mobileDrawerOpen,
        setMobileDrawerOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}
