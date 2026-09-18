/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "Plus Jakarta Sans", "system-ui", "sans-serif"],
        display: ["Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        aruna: {
          primary: "#016097",
          secondary: "#358EBD",
          light1: "#EAF5FA",
          light2: "#D7ECF6",
          medium: "#6DB6D8",
          dark: "#014B77",
          bg: "#F7FAFC",
          border: "#E3EAF0",
          text: "#1E293B",
          textSecondary: "#64748B",
          success: "#1E8E5A",
          successBg: "#E7F6EE",
          warning: "#C2760A",
          warningBg: "#FDF1DF",
          error: "#D8342A",
          errorBg: "#FCEBEA",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
        xl: "calc(var(--radius) + 6px)",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(1,96,151,0.04), 0 8px 24px -12px rgba(1,96,151,0.12)",
        card: "0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)",
        glow: "0 10px 30px -10px rgba(1,96,151,0.45)",
        elevated: "0 1px 2px rgba(1,96,151,0.05), 0 18px 36px -18px rgba(1,96,151,0.28)",
      },
      backgroundImage: {
        "aruna-gradient": "linear-gradient(135deg, #016097 0%, #358ebd 100%)",
        "aruna-gradient-dark": "linear-gradient(135deg, #014B77 0%, #016097 60%, #358EBD 100%)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: 0, transform: "translateY(4px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        "fade-up": {
          from: { opacity: 0, transform: "translateY(14px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: 0, transform: "scale(0.96)" },
          to: { opacity: 1, transform: "scale(1)" },
        },
        "slide-in-right": {
          from: { opacity: 0, transform: "translateX(16px)" },
          to: { opacity: 1, transform: "translateX(0)" },
        },
        "slide-in-left": {
          from: { opacity: 0, transform: "translateX(-24px)" },
          to: { opacity: 1, transform: "translateX(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "fade-up": "fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
        "scale-in": "scale-in 0.2s ease-out",
        "slide-in-right": "slide-in-right 0.25s ease-out",
        "slide-in-left": "slide-in-left 0.25s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
