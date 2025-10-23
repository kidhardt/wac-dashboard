/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ANTHROPIC_API_KEY: string
  readonly VITE_USE_DIRECT_API: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
