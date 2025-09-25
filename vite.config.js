import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      entry: {
        stackedit: resolve(__dirname, "src/lib.ts"),
        webcomponent: resolve(__dirname, "src/webcomponent.ts"),
      },
      name: "Stackedit",
    },

    rollupOptions: {
      // Assicurati di escludere le dipendenze esterne che non vuoi includere nel bundle
      external: [],
      output: {
        globals: {},
      },
    },
    outDir: "lib",
    emptyOutDir: false,
  },
});
