import { defineConfig } from "vite";
import { resolve } from "path";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "NoSameTypeParams",
      formats: ["es", "cjs"],
      fileName: (format: string) =>
        `index.${format === "es" ? "esm" : format}.js`,
    },
    rollupOptions: {
      external: ["eslint"],
      output: {
        globals: {
          eslint: "eslint",
        },
      },
    },
    sourcemap: true,
    minify: "terser",
  },
  plugins: [
    dts({
      rollupTypes: true,
      tsconfigPath: "./tsconfig.json",
    }),
  ],
});
