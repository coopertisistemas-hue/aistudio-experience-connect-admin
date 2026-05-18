/**
 * Ambient type declaration for Vite-style import.meta.env.
 * Required because @connect/core reads Supabase env vars at import time
 * for the default singleton export.
 */
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
