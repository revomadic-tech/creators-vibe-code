import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const CREATE_ORIGIN = "https://create.revomadic.com";

const apiProxy = {
  "/api": {
    target: "https://createapi.wolfstudios.ai",
    changeOrigin: true,
    secure: true,
    cookieDomainRewrite: "localhost",
    configure: (proxy) => {
      proxy.on("proxyReq", (proxyReq) => {
        proxyReq.setHeader("origin", CREATE_ORIGIN);
        proxyReq.setHeader("referer", `${CREATE_ORIGIN}/`);
      });
      proxy.on("error", (err, _req, res) => {
        console.error("[vite proxy /api]", err.message);
        if (res && !res.headersSent) {
          res.writeHead(502, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              message: "Can't reach the sign-in API through the local proxy.",
            })
          );
        }
      });
    },
  },
};

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3004,
    watch: { usePolling: true, interval: 300 },
    proxy: apiProxy,
  },
  preview: {
    port: 4173,
    proxy: apiProxy,
  },
})
