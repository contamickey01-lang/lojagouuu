import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#0A0B14",
                foreground: "#ffffff",
                primary: {
                    DEFAULT: "#4217D1",
                    hover: "#5829F2",
                    foreground: "#ffffff",
                },
                secondary: {
                    DEFAULT: "#1a1b26",
                    foreground: "#a0a0a0",
                },
                card: {
                    DEFAULT: "#12131d",
                    foreground: "#ffffff",
                },
                border: "#1e1f2e",
                muted: {
                    DEFAULT: "#1a1b26",
                    foreground: "#888899",
                },
                accent: {
                    DEFAULT: "#5829F2",
                    foreground: "#ffffff",
                },
                destructive: {
                    DEFAULT: "#ef4444",
                    foreground: "#ffffff",
                },
                success: {
                    DEFAULT: "#22c55e",
                    foreground: "#ffffff",
                },
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
            },
            animation: {
                "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                "spin-slow": "spin 2s linear infinite",
            },
        },
    },
    plugins: [],
};

export default config;
