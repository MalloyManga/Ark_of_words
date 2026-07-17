import tailwindcss from "@tailwindcss/vite"

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['./app/assets/css/main.css'],
  nitro: {
    storage: {
      cache: {
        driver: 'fs',
        base: './.data/cache',
      },
    },
  },
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
})
