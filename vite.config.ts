import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'Logo.jpeg', 'robots.txt'],
      manifest: {
        name: 'P S Shri Guru Kottureshwara Trust',
        short_name: 'PSGKT',
        description: 'Official application for P S Shri Guru Kottureshwara Trust',
        theme_color: '#ea580c',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait',
        icons: [
          {
            src: '/Logo.jpeg',
            sizes: '192x192',
            type: 'image/jpeg'
          },
          {
            src: '/Logo.jpeg',
            sizes: '512x512',
            type: 'image/jpeg'
          },
          {
            src: '/Logo.jpeg',
            sizes: '512x512',
            type: 'image/jpeg',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
