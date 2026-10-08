declare namespace NodeJS {
  interface ProcessEnv {
    /** Absolute backend API origin for the Google OAuth redirect; inlined into the client bundle at build time. */
    NEXT_PUBLIC_OAUTH_BASE_URL?: string;
  }
}
