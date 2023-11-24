import { crx, defineManifest } from "@crxjs/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const manifest = defineManifest({
    "manifest_version": 3,
    "name": "CRXJS React Vite Example",
    "version": "1.0.0",
    "action": { "default_popup": "index.html" },
    "content_scripts": [
        {
          "js": ["src/content.tsx"],
          "matches": ["https://www.google.com/*"]
        }
      ]
});

export default defineConfig({
  plugins: [react(), crx({ manifest })],
});