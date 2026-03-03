import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths(),{
    name: "ignore-chrome-devtools-probe",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === "/.well-known/appspecific/com.chrome.devtools.json") {
          res.statusCode = 204; // No Content
          res.end();
          return;
        }
        next();
      });
    },
  },],

});
