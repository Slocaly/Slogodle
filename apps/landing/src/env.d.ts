interface ImportMetaEnv {
  /** Base URL of the game app (apps/web). Defaults to "/" */
  readonly PUBLIC_GAME_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
