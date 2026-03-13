import { loadEnvConfig } from "@next/env";

const globalForEnv = globalThis as typeof globalThis & {
  __cinemascopeEnvLoaded?: boolean;
};

export const loadAppEnv = () => {
  if (globalForEnv.__cinemascopeEnvLoaded) {
    return;
  }

  loadEnvConfig(process.cwd());
  globalForEnv.__cinemascopeEnvLoaded = true;
};

loadAppEnv();
