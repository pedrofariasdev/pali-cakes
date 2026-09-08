import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import path from "path";

export default defineConfig({
  site: "https://palicakes.pt",
  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes("/carrinho") &&
        !page.includes("/finalizar-encomenda") &&
        !page.includes("/admin")
    })
  ],
  vite: {
    resolve: {
      alias: {
        "@": path.resolve("./src")
      }
    }
  }
});