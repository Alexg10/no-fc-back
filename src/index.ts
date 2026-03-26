import type { Core } from '@strapi/strapi';

export default {
  /**
   * Enregistrement global du custom field `table-grid` (uid: `global::table-grid`).
   * Nécessaire pour que le serveur reconnaisse le type même si le plugin local
   * ne se charge pas correctement (ex. certains déploiements).
   */
  register({ strapi }: { strapi: Core.Strapi }) {
    strapi.customFields.register({
      name: 'table-grid',
      type: 'json',
      inputSize: {
        default: 12,
        isResizable: true,
      },
    });
  },

  bootstrap() {},
};
