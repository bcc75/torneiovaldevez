import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    base: '/',

    plugins: [
      react(),
      tailwindcss(),
    ],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },

    server: {
      // HMR desativável no Google AI Studio através da variável DISABLE_HMR.
      hmr: process.env.DISABLE_HMR !== 'true',

      // Desativa a monitorização de ficheiros quando DISABLE_HMR está ativa.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
