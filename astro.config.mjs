import { defineConfig } from "astro/config";
import path from "path";

export default defineConfig({
  site: "https://palicakes.pt",
  vite: {
    resolve: {
      alias: {
        "@": path.resolve("./src")
      }
    }
  }
});