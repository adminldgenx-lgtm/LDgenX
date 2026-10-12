/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Form service URL accepting a POST of FormData (e.g. a Formspree endpoint). */
  readonly VITE_CONTACT_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
