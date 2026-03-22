import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Claymorphism Design System Colors
        clay: {
          canvas: "#F4F1FA",
          foreground: "#332F3A",
          muted: "#635F69",
          accent: "#7C3AED",
          accentAlt: "#DB2777",
          accentTertiary: "#0EA5E9",
          success: "#10B981",
          warning: "#F59E0B",
        },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        // Claymorphism super-rounded corners
        clay: {
          sm: "12px",
          md: "16px",
          lg: "20px",
          xl: "24px",
          "2xl": "32px",
          "3xl": "40px",
          "4xl": "48px",
          "5xl": "60px",
        },
      },
      boxShadow: {
        // Claymorphism 4-layer shadow system
        "clay-surface": `
          30px 30px 60px #cdc6d9,
          -30px -30px 60px #ffffff,
          inset 10px 10px 20px rgba(139, 92, 246, 0.05),
          inset -10px -10px 20px rgba(255, 255, 255, 0.8)
        `,
        "clay-card": `
          16px 16px 32px rgba(160, 150, 180, 0.2),
          -10px -10px 24px rgba(255, 255, 255, 0.9),
          inset 6px 6px 12px rgba(139, 92, 246, 0.03),
          inset -6px -6px 12px rgba(255, 255, 255, 1)
        `,
        "clay-button": `
          12px 12px 24px rgba(139, 92, 246, 0.3),
          -8px -8px 16px rgba(255, 255, 255, 0.4),
          inset 4px 4px 8px rgba(255, 255, 255, 0.4),
          inset -4px -4px 8px rgba(0, 0, 0, 0.1)
        `,
        "clay-button-hover": `
          16px 16px 32px rgba(139, 92, 246, 0.4),
          -10px -10px 20px rgba(255, 255, 255, 0.5),
          inset 4px 4px 8px rgba(255, 255, 255, 0.4),
          inset -4px -4px 8px rgba(0, 0, 0, 0.1)
        `,
        "clay-pressed": `
          inset 10px 10px 20px #d9d4e3,
          inset -10px -10px 20px #ffffff
        `,
        "clay-card-hover": `
          20px 20px 40px rgba(160, 150, 180, 0.25),
          -12px -12px 28px rgba(255, 255, 255, 0.9),
          inset 6px 6px 12px rgba(139, 92, 246, 0.03),
          inset -6px -6px 12px rgba(255, 255, 255, 1)
        `,
      },
      animation: {
        "clay-float": "clay-float 8s ease-in-out infinite",
        "clay-float-delayed": "clay-float-delayed 10s ease-in-out infinite",
        "clay-float-slow": "clay-float-slow 12s ease-in-out infinite",
        "clay-breathe": "clay-breathe 6s ease-in-out infinite",
        "blob": "blob 15s ease-in-out infinite",
      },
      keyframes: {
        "clay-float": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-20px) rotate(2deg)" },
        },
        "clay-float-delayed": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-15px) rotate(-2deg)" },
        },
        "clay-float-slow": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-30px) rotate(5deg)" },
        },
        "clay-breathe": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.02)" },
        },
        blob: {
          "0%": {
            transform: "translate(0px, 0px) scale(1)",
          },
          "33%": {
            transform: "translate(30px, -50px) scale(1.1)",
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.9)",
          },
          "100%": {
            transform: "translate(0px, 0px) scale(1)",
          },
        },
      },
      fontFamily: {
        nunito: ["Nunito", "sans-serif"],
        "dm-sans": ["DM Sans", "sans-serif"],
      },
      transitionDuration: {
        "400": "400ms",
        "500": "500ms",
      },
      scale: {
        "92": "0.92",
      },
    },
  },
  plugins: [],
};

export default config;
