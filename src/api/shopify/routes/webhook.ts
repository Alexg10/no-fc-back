/**
 * Routes pour les webhooks Shopify
 * Documentation : https://strapi.io/integrations/shopify
 */

console.log('Routes webhook Shopify chargées');

export default {
  routes: [
    {
      method: 'POST',
      path: '/shopify/webhook',
      handler: 'api::shopify.webhook.handleProductWebhook',
      config: {
        policies: [],
        middlewares: [],
        auth: false, // Désactiver l'authentification pour les webhooks
      },
    },
  ],
};

