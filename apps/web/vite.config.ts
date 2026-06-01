import path from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

function blockOptimizerProbePaths(): Plugin {
  return {
    name: "block-optimizer-probe-paths",
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const rawUrl = request.url || "/";
        let pathname: string;

        try {
          pathname = decodeURIComponent(new URL(rawUrl, "http://localhost").pathname);
        } catch {
          response.statusCode = 404;
          response.end("Not Found");
          return;
        }

        if (pathname.includes("\0")) {
          response.statusCode = 404;
          response.end("Not Found");
          return;
        }

        if (pathname.startsWith("/@fs/") && pathname.includes("/node_modules/vite/dist/client/env.mjs/")) {
          response.statusCode = 404;
          response.end("Not Found");
          return;
        }

        if (pathname.startsWith("/node_modules/.vite/deps/")) {
          const filename = pathname.split("/").pop() || "";
          const validOptimizedDep = /^[A-Za-z0-9@._-]+\.js(?:\.map)?$/.test(filename);

          if (!validOptimizedDep) {
            response.statusCode = 404;
            response.end("Not Found");
            return;
          }
        }

        next();
      });
    },
  };
}

const previewHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

export default defineConfig({
  plugins: [blockOptimizerProbePaths(), react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return undefined;
          }

          if (id.includes("recharts")) {
            return "charts";
          }

          if (id.includes("@mantine")) {
            return "mantine";
          }

          if (id.includes("@tanstack/react-query")) {
            return "query";
          }

          if (id.includes("react-router")) {
            return "router";
          }

          return "vendor";
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "127.0.0.1",
    port: 3000,
    strictPort: true,
    allowedHosts: ["localhost", "127.0.0.1"],
    headers: previewHeaders,
    hmr: {
      host: "127.0.0.1",
      overlay: false,
    },
    fs: {
      strict: true,
      deny: ["**/.env*", "**/.git/**"],
    },
  },
  preview: {
    host: "127.0.0.1",
    port: 3000,
    strictPort: true,
    headers: previewHeaders,
  },
});
