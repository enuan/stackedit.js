import { defineConfig } from "vite";
import { resolve } from "path";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      entry: {
        lib: resolve(__dirname, "src/lib.ts"),
        webcomponent: resolve(__dirname, "src/webcomponent.ts"),
      },
      name: "Stackedit",
    },

    rollupOptions: {
      external: [],
      output: {
        globals: {},
      },
    },
    outDir: "lib",
    emptyOutDir: false,
  },
  plugins: [dts()],
});
