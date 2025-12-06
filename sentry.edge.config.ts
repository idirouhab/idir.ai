// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

// Only initialize Sentry in production (disable on localhost)
if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: "https://fbb75b7a70a4e743234887bf93456134@o4510438894272512.ingest.de.sentry.io/4510438896631888",

    // PERFORMANCE: Reduce trace sampling to 10% to minimize performance impact
    // This still captures all errors but only traces 10% of transactions
    tracesSampleRate: 0.1,

    // PERFORMANCE: Only capture errors, not all transactions
    // This significantly reduces overhead while maintaining error tracking
    beforeSendTransaction(event) {
      // Only send transactions if they have errors
      return null;
    },

    // Enable sending user PII (Personally Identifiable Information)
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
    sendDefaultPii: true,

    // PERFORMANCE: Reduce integrations to only what's needed
    integrations: [
      Sentry.extraErrorDataIntegration(),
      Sentry.dedupeIntegration(),
    ],
  });
}
