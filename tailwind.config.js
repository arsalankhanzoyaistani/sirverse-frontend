/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx,css}", // ✅ includes styles folder too
  ],
  darkMode: "class", // enables light/dark themes
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },

      /* 🎨 SirVerse GPT Hybrid Theme */
      colors: {
        // 🌌 Neon Galaxy (Purple/Indigo)
        primary: {
          light: "#a855f7", // bright purple
          DEFAULT: "#7e22ce", // main purple
          dark: "#4c1d95", // deep purple
        },
        secondary: "#4f46e5", // indigo accent
        glass: "rgba(255,255,255,0.05)",

        // 💚 WhatsApp-style Chat Shades
        whatsappGreen: "#25D366",
        whatsappDark: "#075E54",
        whatsappLight: "#ECE5DD",
        whatsappChatLeft: "#FFFFFF",
        whatsappChatRight: "#DCF8C6",

        // 🌙 Text + Background base
        darkBg: "#0a0115",
        lightBg: "#f5f5f5",
      },

      /* 💡 Shadows & Glows */
      boxShadow: {
        glow: "0 0 15px rgba(168,85,247,0.5)",
        innerglow: "inset 0 0 10px rgba(168,85,247,0.2)",
      },

      /* 💨 Blur & Animation */
      backdropBlur: {
        xs: "2px",
      },
      animation: {
        fadeIn: "fadeIn 0.4s ease-in-out",
        pulseGlow: "pulseGlow 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: 0, transform: "translateY(5px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%": {
            boxShadow:
              "0 0 10px rgba(168,85,247,0.3), 0 0 20px rgba(79,70,229,0.2)",
          },
          "50%": {
            boxShadow:
              "0 0 25px rgba(168,85,247,0.6), 0 0 40px rgba(79,70,229,0.4)",
          },
          "100%": {
            boxShadow:
              "0 0 10px rgba(168,85,247,0.3), 0 0 20px rgba(79,70,229,0.2)",
          },
        },
      },
    },
  },
  plugins: [],
};
