import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),

    VitePWA({
      registerType: "autoUpdate",
       includeAssets: ["icon-192.png", "icon-512.png"],

      devOptions: {
        enabled: true, 
      },

      manifest: {
        name: "123 Reserve",
        short_name: "123Reserve",
        description: "Travel booking platform",
        theme_color: "#0A0E1A",
        background_color: "#0A0E1A",
        display: "standalone",
        start_url: "/",

        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
});