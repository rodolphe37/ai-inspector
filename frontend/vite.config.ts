import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(),
  VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['favicon.png', 'apple-touch-icon.png'],
    manifest: {
      name: 'Provenance Inspector',
      short_name: 'Provenance',
      description:
        'Inspectez vos contenus numériques pour détecter les métadonnées, signatures de provenance, caractères invisibles et empreintes statistiques connues. Analyse algorithmique, sans LLM.',
      lang: 'fr',
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
          "protocol": "web+Provenance",
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
