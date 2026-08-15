/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        eoc: {
          bg: "#F8FAFC",
          panel: "#FFFFFF",
          sidebar: "#0F172A",
          border: "#E2E8F0",
          navy: "#1E293B",
          primary: "#1D4ED8",
          primaryHover: "#1E40AF",
          accent: "#2563EB",
          critical: "#DC2626",
          criticalBg: "#FEF2F2",
          criticalBorder: "#FCA5A5",
          alert: "#EA580C",
          alertBg: "#FFF7ED",
          alertBorder: "#FDBA74",
          monitor: "#16A34A",
          monitorBg: "#F0FDF4",
          monitorBorder: "#86EFAC",
          warning: "#CA8A04"
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}
