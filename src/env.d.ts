/// <reference types="astro/client" />
/// <reference types="@clerk/astro/dist/types" />
/// <reference path="../.astro/types.d.ts" />

import * as htmx from "htmx.org";
import type { Auth, UserResource } from "@clerk/types";

declare global {
  interface Window {
    Alpine: import("alpinejs").Alpine;
    htmx: typeof htmx;
  }

  namespace App {
    interface Locals {
      auth: () => Auth;
      currentUser: () => Promise<UserResource | null>;
    }
  }
}

// https://docs.astro.build/en/guides/environment-variables/#intellisense-for-typescript
interface ImportMetaEnv {
  /** https://docs.sentry.io/platforms/javascript/guides/astro/#configure */
  readonly SENTRY_DSN: string;
  /** https://docs.sentry.io/platforms/javascript/guides/astro/#configure */
  readonly SENTRY_AUTH_TOKEN: string;
  /** https://docs.sentry.io/platforms/javascript/guides/astro/#configure */
  readonly SENTRY_PROJECT: string;
  /** https://groq.com/ */
  readonly GROQ_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
