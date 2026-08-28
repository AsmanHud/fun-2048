import { defineConfig } from "vite";

// Relative base path so the production build works when served from a
// non-root subpath (e.g. itch.io's HTML5 game hosting).
export default defineConfig({
	base: "./",
});
