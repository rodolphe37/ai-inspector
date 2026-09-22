import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8')) as { version: string };

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [react(), tailwindcss(),
  VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['favicon.png', 'apple-touch-icon.png'],
    manifest: {
      name: 'AI Inspector',
      short_name: 'AI Inspector',
      // The app is bilingual (EN/FR, detected from the browser), so the
      // manifest carries both languages rather than a single `lang`.
      description:
        "AI-origin analysis for text, code, images, PDF and Word documents, audio and video: C2PA Content Credentials, generator metadata, watermarks and forensic detection. Every verdict shows its evidence. / Analyse d'origine IA pour texte, code, images, documents PDF et Word, audio et vidéo : Content Credentials C2PA, métadonnées de générateur, filigranes et analyse forensique. Chaque verdict montre ses preuves.",
      start_url: '/',
      id: "/",
      scope: '/',
      display: 'standalone',
      display_override: ["window-controls-overlay"],
      background_color: '#f5f6fa',
      theme_color: '#5327d1',
      icons: [
        { src: '/web-app-manifest-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: '/web-app-manifest-512x512.png', sizes: '512x512', type: 'image/png' },
        { src: '/web-app-manifest-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
      protocol_handlers: [
        {
          "protocol": "web+iainspector",
          "url": "/import?data=%s"
        }
      ]
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      navigateFallback: 'index.html',
      cleanupOutdatedCaches: true,
    },
    devOptions: {
      enabled: true,
      type: 'module',
    },
  })
    ,],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
