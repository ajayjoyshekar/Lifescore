import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["system-ui", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      colors: {
        brand: {
          50: "#f5fbff",
          100: "#e0f3ff",
          200: "#b9e3ff",
          300: "#80ccff",
          400: "#38a7ff",
          500: "#0b86ff",
          600: "#0065db",
          700: "#004ea9",
          800: "#023f84",
          900: "#062f60"
        }
      }
    }
  },
  plugins: []
};

export default config;

