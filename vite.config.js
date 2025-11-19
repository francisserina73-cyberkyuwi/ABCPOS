import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    target: 'esnext',
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
        inventory: resolve(__dirname, 'inventory.html'),
        menu: resolve(__dirname, 'menu.html'),
        orders: resolve(__dirname, 'orders.html'),
        reports: resolve(__dirname, 'reports.html')
      }
    }
  }
});

