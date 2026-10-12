declare namespace NodeJS {
  interface ProcessEnv {
    /** Absolute backend API origin for the Google OAuth redirect; inlined into the client bundle at build time. */
    NEXT_PUBLIC_OAUTH_BASE_URL?: string;
    /** Chat WebSocket base including the API prefix, e.g. wss://book-club-be.onrender.com/api/v1; required by a production build (see ws-base-url.ts) and must stay inside the CSP connect-src. */
    NEXT_PUBLIC_WS_URL?: string;
  }
}
