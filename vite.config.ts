import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx, defineManifest } from "@crxjs/vite-plugin";

const manifest = defineManifest({
  manifest_version: 3,
  name: "ChatGPT Extension",
  version: "1.0.0",
  // action: { "default_popup": "index.html" },
  content_scripts: [
    {
      js: ["src/content.tsx"],
      matches: ["https://chat.openai.com/*"],
    },
  ],
  permissions: ["storage"],
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), crx({ manifest })],
});
