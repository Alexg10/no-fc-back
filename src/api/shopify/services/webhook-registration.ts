/**
 * Shopify Webhook Registration Service
 *
 * Ce service enregistre automatiquement les webhooks Shopify via l'API Shopify Admin.
 * Il s'exécute au bootstrap de Strapi et crée les webhooks s'ils n'existent pas.
 *
 * Webhooks enregistrés:
 * - products/create
 * - products/update
 * - products/delete
 * - collections/create
 * - collections/update
 * - collections/delete
 */

export default {
  async registerWebhooks() {
    const shopifyConfig = strapi.config.get('shopify') as any;

    if (!shopifyConfig) {
      strapi.log.error('Configuration Shopify manquante');
      return;
    }

    const { shopName, accessToken, apiVersion } = shopifyConfig;
    const publicUrl = process.env.STRAPI_PUBLIC_URL;

    if (!publicUrl) {
      strapi.log.warn(
        '⚠️  STRAPI_PUBLIC_URL not configured - webhook registration skipped'
      );
      return;
    }

    if (!shopName || !accessToken) {
      strapi.log.error(
        'Shopify credentials missing: shopName or accessToken not configured'
      );
      return;
    }

    const webhookUrl = `${publicUrl}/api/shopify/webhook`;

    // Note: Collections webhooks require special permissions not available in standard scopes
    // Only registering products webhooks for now
    const webhookTopics = [
      'products/create',
      'products/update',
      'products/delete',
      // Collections webhooks temporarily disabled due to API scope limitations
      // 'collections/create',
      // 'collections/update',
      // 'collections/delete',
    ];

    strapi.log.info('🔄 Starting Shopify webhook registration...', {
      shop: shopName,
      webhookUrl,
      topics: webhookTopics,
    });

    try {
      // Récupérer les webhooks existants
      const existingWebhooks = await this.getExistingWebhooks(
        shopName,
        accessToken,
        apiVersion
      );

      // Enregistrer les nouveaux webhooks
      for (const topic of webhookTopics) {
        const exists = existingWebhooks.some(
          (wh: any) => wh.topic === topic && wh.address === webhookUrl
        );

        if (exists) {
          strapi.log.info(`✅ Webhook already registered: ${topic}`);
        } else {
          await this.createWebhook(
            shopName,
            accessToken,
            apiVersion,
            topic,
            webhookUrl
          );
          strapi.log.info(`✅ Webhook registered: ${topic}`);
        }
      }

      strapi.log.info('✅ All Shopify webhooks registered successfully');
    } catch (error) {
      strapi.log.error(
        '❌ Error registering Shopify webhooks:',
        error instanceof Error ? error.message : String(error)
      );
      throw error;
    }
  },

  async getExistingWebhooks(
    shopName: string,
    accessToken: string,
    apiVersion: string
  ) {
    const url = `https://${shopName}.myshopify.com/admin/api/${apiVersion}/webhooks.json`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken,
        },
      });

      if (!response.ok) {
        throw new Error(
          `Shopify API error: ${response.status} ${response.statusText}`
        );
      }

      const data = (await response.json()) as any;
      return data.webhooks || [];
    } catch (error) {
      strapi.log.error('Error fetching existing webhooks:', error);
      return [];
    }
  },

  async createWebhook(
    shopName: string,
    accessToken: string,
    apiVersion: string,
    topic: string,
    address: string
  ) {
    const url = `https://${shopName}.myshopify.com/admin/api/${apiVersion}/webhooks.json`;

    const payload = {
      webhook: {
        topic,
        address,
        format: 'json',
      },
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Shopify API error: ${response.status} - ${JSON.stringify(errorData)}`
        );
      }

      const data = (await response.json()) as any;
      strapi.log.debug(`Webhook created with ID: ${data.webhook?.id}`);
      return data.webhook;
    } catch (error) {
      strapi.log.error(`Error creating webhook for topic ${topic}:`, error);
      throw error;
    }
  },
};
