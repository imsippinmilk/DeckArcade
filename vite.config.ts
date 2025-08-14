import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration for the Deck Arcade frontend. This config
// registers the React plugin and leaves other settings at their defaults.
// Additional customizations such as aliases or environment variables
// can be added here as the project grows.
export default defineConfig({
  plugins: [react()]
});