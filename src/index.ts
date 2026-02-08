import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }: { strapi: Core.Strapi }) {
    // Register hooks and middleware
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // Register Shopify webhooks on startup
    if (process.env.NODE_ENV !== 'test') {
      try {
        const webhookRegistrationService = strapi.service(
          'api::shopify.webhook-registration'
        );
        await webhookRegistrationService.registerWebhooks();
        strapi.log.info('✅ Shopify webhooks registered successfully');
      } catch (error) {
        strapi.log.error(
          '❌ Error registering Shopify webhooks:',
          error instanceof Error ? error.message : String(error)
        );
        // Don't block startup if webhook registration fails
      }
    }
  },
};
