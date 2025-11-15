export default [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      // Désactiver certaines protections pour les webhooks
      contentSecurityPolicy: false,
    },
  },
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  {
    name: 'strapi::body',
    config: {
      includeUnparsed: true,
    },
  },
  // Middleware personnalisé pour capturer le body brut (APRÈS strapi::body)
  {
    name: 'global::shopify-webhook',
    config: {},
  },
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
