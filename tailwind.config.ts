import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#151713",
        moss: "#3c5f44",
        mint: "#dff6e8",
        signal: "#efb84a",
        steel: "#6e7c84",
        paper: "#f5f1e8"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular"]
      },
      boxShadow: {
        line: "0 0 0 1px rgba(21, 23, 19, 0.08)",
        lift: "0 18px 50px rgba(21, 23, 19, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
