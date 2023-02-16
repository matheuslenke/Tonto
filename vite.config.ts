import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      provider: "c8",
      reporter: ["text", "html"],
      include: ["src"],
      exclude: ["**/generated"],
    },
  },
});
