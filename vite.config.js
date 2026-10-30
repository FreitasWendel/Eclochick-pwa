import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa' // 1. Importe o plugin

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // 2. Configure o PWA
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Eclochick',
        short_name: 'Eclochick',
        description: 'Monitoramento de incubação de ovos',
        theme_color: '#2D8133',
        background_color: '#F5F5F5',
        display: 'standalone', // Abre em tela cheia, sem barra de endereço
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})