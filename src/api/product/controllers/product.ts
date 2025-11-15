/**
 * product controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::product.product",
  ({ strapi }) => ({
    /**
     * Récupère un produit par son handle (utilisé par Shopify)
     */
    async findByHandle(ctx: any) {
      const { handle } = ctx.params;

      if (!handle) {
        return ctx.badRequest("Handle is required");
      }

      try {
        const products = await strapi.entityService.findMany(
          "api::product.product",
          {
            filters: { handle } as any, // Types seront régénérés au prochain démarrage de Strapi
            limit: 1,
          }
        );

        if (!products || products.length === 0) {
          return ctx.notFound(`Product with handle "${handle}" not found`);
        }

        return ctx.send(products[0]);
      } catch (error: any) {
        strapi.log.error("Error finding product by handle", {
          error: error.message,
          handle,
        });
        return ctx.internalServerError("Error retrieving product");
      }
    },
  })
);
