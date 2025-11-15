// Configuration Shopify selon la documentation : https://strapi.io/integrations/shopify
export default ({ env }) => ({
  apiKey: env('SHOPIFY_API_KEY'),
  apiSecret: env('SHOPIFY_API_SECRET'),
  accessToken: env('SHOPIFY_ADMIN_API_ACCESS_TOKEN'),
  shopName: env('SHOPIFY_SHOP_NAME'),
  apiVersion: env('SHOPIFY_API_VERSION', '2023-04'),
  // Pour les webhooks, utiliser la clé secrète d'API (même valeur que SHOPIFY_API_SECRET)
  webhookSecret: env('SHOPIFY_WEBHOOK_SECRET') || env('SHOPIFY_API_SECRET'),
});

