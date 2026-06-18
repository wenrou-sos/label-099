/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,vue}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "2rem",
        lg: "2rem",
        xl: "2rem",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1200px",
      },
    },
    extend: {
      colors: {
        primary: {
          50: "#FFF5F7",
          100: "#FFE8EE",
          200: "#FFD1DC",
          300: "#FFB3C6",
          400: "#FF8BA7",
          500: "#FF6B8A",
          600: "#F45B7D",
          700: "#E0486A",
          800: "#CC3758",
          900: "#B02A49",
        },
        cream: {
          50: "#FFFBF8",
          100: "#FFF5F0",
          200: "#FFE8DB",
          300: "#FFD6BE",
        },
        mint: {
          100: "#E6F8F0",
          300: "#A7EBCB",
          500: "#82D9B6",
          700: "#4FC497",
        },
        lavender: {
          100: "#EFECFF",
          300: "#DCD0FF",
          500: "#C8B6FF",
          700: "#A893FA",
        },
        ink: {
          900: "#2D3436",
          700: "#4A5153",
          500: "#636E72",
          300: "#9BA3A6",
          200: "#BEC5C7",
          100: "#DFE6E9",
          50: "#F5F7FA",
        },
      },
      fontFamily: {
        sans: [
          "Noto Sans SC",
          "DM Sans",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
      },
      fontSize: {
        "heading-1": ["32px", { lineHeight: "1.3", fontWeight: "700" }],
        "heading-2": ["24px", { lineHeight: "1.35", fontWeight: "700" }],
        "heading-3": ["20px", { lineHeight: "1.4", fontWeight: "600" }],
        "heading-4": ["18px", { lineHeight: "1.5", fontWeight: "600" }],
        body: ["14px", { lineHeight: "1.6", fontWeight: "400" }],
        caption: ["12px", { lineHeight: "1.6", fontWeight: "400" }],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
        "4xl": "32px",
      },
      boxShadow: {
        card: "0 2px 8px 0 rgba(176, 42, 73, 0.06)",
        "card-hover": "0 8px 24px 0 rgba(176, 42, 73, 0.10)",
        primary: "0 4px 12px 0 rgba(255, 107, 138, 0.25)",
        "primary-hover": "0 6px 20px 0 rgba(255, 107, 138, 0.35)",
      },
      backgroundImage: {
        "gradient-primary":
          "linear-gradient(135deg, #FF8BA7 0%, #FF6B8A 100%)",
        "gradient-lavender":
          "linear-gradient(135deg, #C8B6FF 0%, #A893FA 100%)",
        "gradient-mint":
          "linear-gradient(135deg, #A7EBCB 0%, #82D9B6 100%)",
        "gradient-hero":
          "linear-gradient(120deg, #FF8BA7 0%, #FFB3C6 40%, #C8B6FF 100%)",
      },
      animation: {
        "fade-in-up": "fadeInUp 0.5s ease-out forwards",
        "fade-in": "fadeIn 0.4s ease-out forwards",
        "scale-pulse": "scalePulse 0.4s ease-out",
        float: "float 3s ease-in-out infinite",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scalePulse: {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.2)" },
          "100%": { transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
    },
  },
  plugins: [],
};
