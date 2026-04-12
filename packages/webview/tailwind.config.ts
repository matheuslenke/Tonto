import type { Config } from "tailwindcss";

const config: Config = {
    content: ["./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            borderRadius: {
                xl: "1rem",
                "2xl": "1.5rem",
            },
            boxShadow: {
                diagram: "0 24px 64px rgba(8, 15, 30, 0.24)",
            },
            colors: {
                canvas: "var(--editor-bg)",
                panel: "var(--panel-bg)",
                line: "var(--panel-line)",
                accent: "var(--panel-accent)",
            },
            fontFamily: {
                display: ['"Iowan Old Style"', '"Palatino Linotype"', '"Book Antiqua"', "serif"],
                mono: ['"IBM Plex Mono"', '"SFMono-Regular"', "monospace"],
            },
        },
    },
    plugins: [],
};

export default config;
