import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import eslint from "vite-plugin-eslint";
import tailwindcss from "@tailwindcss/vite";
import * as process from "process";

// https://vitejs.dev/config/
export default defineConfig({
    resolve: {
        preserveSymlinks: true,
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        host: "localhost",
        port: parseInt(process.env.FRONTEND_PORT),
        proxy: {
            "/api": process.env.BACKEND_URL,
            "/login": {
                target: "https://auth.massgeneralbrigham.co/authorize",
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/login/, ""),
            },
        },
        watch: {
            usePolling: true,
        },
    },
    build: {
        outDir: "build",
    },
    cacheDir: ".vite",
    plugins: [
        tailwindcss(),
        react(),
        eslint({
            exclude: ["**/node_modules/**", "**/.*/**", "**/.vite/**"],
            failOnWarning: false,
            failOnError: false,
        }),
    ],
});
