import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Vite config for driver-app: force local react/react-dom resolution
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      react: path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
    },
  },
  // Let Vite auto-detect dependencies to optimize. Explicitly including
  // react/react-dom here can cause conflicts when multiple copies exist.
  server: {
    port: 5174,
  },
});
