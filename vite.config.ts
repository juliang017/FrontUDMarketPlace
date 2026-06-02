import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 3500,
    host: true, // Expone el servidor a la red local
    open: true, // Abre el navegador automáticamente al encender
    allowedHosts: true // Desactiva el bloqueo de hosts para permitir ngrok y redes externas
  }
});