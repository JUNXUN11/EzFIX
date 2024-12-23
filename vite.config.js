import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [{ find: "@", replacement: "/src" }],
  },
  server: {
    proxy: {
      "/api": {
        target: "https://theezfixapi.onrender.com", 
        changeOrigin: true, 
        rewrite: (path) => path.replace(/^\/api/, ""), 
        secure: true, 
      },
    },
  },
});
