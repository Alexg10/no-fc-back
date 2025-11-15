// Service pour gérer les webhooks Shopify
// Documentation : https://strapi.io/integrations/shopify

import crypto from "crypto";

export default {
  /**
   * Vérifie la signature HMAC d'un webhook Shopify
   */
  verifyShopifyWebhook(
    data: string,
    hmacHeader: string,
    secret: string
  ): boolean {
    const generatedHash = crypto
      .createHmac("sha256", secret)
      .update(data, "utf8")
      .digest("base64");

    return crypto.timingSafeEqual(
      Buffer.from(generatedHash),
      Buffer.from(hmacHeader)
    );
  },

  /**
   * Traite une mise à jour de produit depuis Shopify
   */
  async processProductUpdate(productData: any) {
    try {
      strapi.log.info("Mise à jour du produit", {
        shopifyId: productData.id,
        title: productData.title,
      });

      // Synchroniser les données du produit avec Strapi
      const existingProducts = await strapi.entityService.findMany(
        "api::product.product",
        {
          filters: { shopifyId: productData.id.toString() },
          limit: 1,
        }
      );

      const productDataToUpdate = {
        title: productData.title || "Sans titre",
        description: productData.body_html || "",
        price: parseFloat(productData.variants?.[0]?.price || "0"),
        shopifyId: productData.id.toString(),
        handle: productData.handle || null,
      };

      if (existingProducts && existingProducts.length > 0) {
        const updated = await strapi.entityService.update(
          "api::product.product",
          existingProducts[0].id,
          {
            data: productDataToUpdate,
          }
        );
        strapi.log.info("Produit mis à jour", {
          id: updated.id,
          shopifyId: updated.shopifyId,
        });
        return updated;
      } else {
        // Créer un nouveau produit si il n'existe pas
        const created = await strapi.entityService.create(
          "api::product.product",
          {
            data: productDataToUpdate,
          }
        );
        strapi.log.info("Produit créé (via update)", {
          id: created.id,
          shopifyId: created.shopifyId,
        });
        return created;
      }
    } catch (error: any) {
      strapi.log.error("Erreur lors de la mise à jour du produit", {
        error: error.message,
        stack: error.stack,
        productData: productData.id,
      });
      throw error;
    }
  },

  /**
   * Traite la création d'un produit depuis Shopify
   */
  async processProductCreate(productData: any) {
    try {
      strapi.log.info("Création du produit", {
        shopifyId: productData.id,
        title: productData.title,
      });

      // Vérifier si le produit existe déjà (au cas où le webhook create arrive après un update)
      const existingProducts = await strapi.entityService.findMany(
        "api::product.product",
        {
          filters: { shopifyId: productData.id.toString() },
          limit: 1,
        }
      );

      if (existingProducts && existingProducts.length > 0) {
        strapi.log.info("Produit existe déjà, mise à jour à la place", {
          id: existingProducts[0].id,
          shopifyId: productData.id,
        });
        // Mettre à jour le produit existant
        return await this.processProductUpdate(productData);
      }

      const product = await strapi.entityService.create(
        "api::product.product",
        {
          data: {
            title: productData.title || "Sans titre",
            description: productData.body_html || "",
            price: parseFloat(productData.variants?.[0]?.price || "0"),
            shopifyId: productData.id.toString(),
            handle: productData.handle || null,
          },
        }
      );

      strapi.log.info("Produit créé avec succès", {
        id: product.id,
        shopifyId: product.shopifyId,
      });
      return product;
    } catch (error: any) {
      strapi.log.error("Erreur lors de la création du produit", {
        error: error.message,
        stack: error.stack,
        errorName: error.name,
        productData: {
          id: productData.id,
          title: productData.title,
          shopifyId: productData.id?.toString(),
          hasVariants: !!productData.variants,
          variantsCount: productData.variants?.length || 0,
        },
      });
      throw error;
    }
  },

  /**
   * Traite la suppression d'un produit depuis Shopify
   */
  async processProductDelete(productData: any) {
    const existingProduct = await strapi.entityService.findMany(
      "api::product.product",
      {
        filters: { shopifyId: productData.id.toString() },
        limit: 1,
      }
    );

    if (existingProduct && existingProduct.length > 0) {
      return strapi.entityService.delete(
        "api::product.product",
        existingProduct[0].id
      );
    }
  },
};
