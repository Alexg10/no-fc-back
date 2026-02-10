// Service pour gérer les webhooks Shopify
// Documentation : https://strapi.io/integrations/shopify

import crypto from "crypto";

/** Extrait l'ID numérique depuis Shopify (supporte format REST 123 ou GraphQL gid://shopify/Product/123) */
function extractShopifyId(id: string | number): string {
  if (typeof id === "number") return id.toString();
  const match = String(id).match(/\/(\d+)$/);
  return match ? match[1] : String(id);
}

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

      const shopifyId = extractShopifyId(productData.id);
      const handle =
        productData.handle ||
        `product-${shopifyId}`;

      const existingProducts = await strapi.entityService.findMany(
        "api::product.product",
        {
          filters: { shopifyId },
          limit: 1,
        }
      );

      const productDataToUpdate = {
        title: productData.title || "Sans titre",
        description: productData.body_html || "",
        price: parseFloat(productData.variants?.[0]?.price || "0"),
        shopifyId,
        handle,
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
            data: {
              ...productDataToUpdate,
              publishedAt: new Date(),
            },
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
      const shopifyId = extractShopifyId(productData.id);
      const existingProducts = await strapi.entityService.findMany(
        "api::product.product",
        {
          filters: { shopifyId },
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

      const handle =
        productData.handle ||
        `product-${shopifyId}`;

      const product = await strapi.entityService.create(
        "api::product.product",
        {
          data: {
            title: productData.title || "Sans titre",
            description: productData.body_html || "",
            price: parseFloat(productData.variants?.[0]?.price || "0"),
            shopifyId,
            handle,
            publishedAt: new Date(), // Publier immédiatement pour que le produit soit visible
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
    const shopifyId = extractShopifyId(productData.id);
    const existingProduct = await strapi.entityService.findMany(
      "api::product.product",
      {
        filters: { shopifyId },
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

  /**
   * Traite la création d'une collection depuis Shopify
   */
  async processCollectionCreate(collectionData: any) {
    try {
      strapi.log.info("Création de la collection", {
        shopifyId: collectionData.id,
        title: collectionData.title,
      });

      // Vérifier si la collection existe déjà
      const existingCollections = await strapi.entityService.findMany(
        "api::collection.collection",
        {
          filters: { shopifyId: collectionData.id.toString() },
          limit: 1,
        }
      );

      if (existingCollections && existingCollections.length > 0) {
        strapi.log.info("Collection existe déjà, mise à jour à la place", {
          id: existingCollections[0].id,
          shopifyId: collectionData.id,
        });
        return await this.processCollectionUpdate(collectionData);
      }

      const collection = await strapi.entityService.create(
        "api::collection.collection",
        {
          data: {
            title: collectionData.title || "Sans titre",
            shopifyId: collectionData.id.toString(),
            handle: collectionData.handle || null,
          },
        }
      );

      strapi.log.info("Collection créée avec succès", {
        id: collection.id,
        shopifyId: collection.shopifyId,
      });
      return collection;
    } catch (error: any) {
      strapi.log.error("Erreur lors de la création de la collection", {
        error: error.message,
        stack: error.stack,
        collectionData: {
          id: collectionData.id,
          title: collectionData.title,
          shopifyId: collectionData.id?.toString(),
        },
      });
      throw error;
    }
  },

  /**
   * Traite la mise à jour d'une collection depuis Shopify
   */
  async processCollectionUpdate(collectionData: any) {
    try {
      strapi.log.info("Mise à jour de la collection", {
        shopifyId: collectionData.id,
        title: collectionData.title,
      });

      // Synchroniser les données de la collection avec Strapi
      const existingCollections = await strapi.entityService.findMany(
        "api::collection.collection",
        {
          filters: { shopifyId: collectionData.id.toString() },
          limit: 1,
        }
      );

      const collectionDataToUpdate = {
        title: collectionData.title || "Sans titre",
        shopifyId: collectionData.id.toString(),
        handle: collectionData.handle || null,
      };

      if (existingCollections && existingCollections.length > 0) {
        const updated = await strapi.entityService.update(
          "api::collection.collection",
          existingCollections[0].id,
          {
            data: collectionDataToUpdate,
          }
        );
        strapi.log.info("Collection mise à jour", {
          id: updated.id,
          shopifyId: updated.shopifyId,
        });
        return updated;
      } else {
        // Créer une nouvelle collection si elle n'existe pas
        const created = await strapi.entityService.create(
          "api::collection.collection",
          {
            data: collectionDataToUpdate,
          }
        );
        strapi.log.info("Collection créée (via update)", {
          id: created.id,
          shopifyId: created.shopifyId,
        });
        return created;
      }
    } catch (error: any) {
      strapi.log.error("Erreur lors de la mise à jour de la collection", {
        error: error.message,
        stack: error.stack,
        collectionData: collectionData.id,
      });
      throw error;
    }
  },

  /**
   * Traite la suppression d'une collection depuis Shopify
   */
  async processCollectionDelete(collectionData: any) {
    try {
      strapi.log.info("Suppression de la collection", {
        shopifyId: collectionData.id,
      });

      const existingCollection = await strapi.entityService.findMany(
        "api::collection.collection",
        {
          filters: { shopifyId: collectionData.id.toString() },
          limit: 1,
        }
      );

      if (existingCollection && existingCollection.length > 0) {
        const deleted = await strapi.entityService.delete(
          "api::collection.collection",
          existingCollection[0].id
        );
        strapi.log.info("Collection supprimée avec succès", {
          id: existingCollection[0].id,
          shopifyId: collectionData.id,
        });
        return deleted;
      } else {
        strapi.log.warn("Collection non trouvée pour suppression", {
          shopifyId: collectionData.id,
        });
      }
    } catch (error: any) {
      strapi.log.error("Erreur lors de la suppression de la collection", {
        error: error.message,
        stack: error.stack,
        collectionData: collectionData.id,
      });
      throw error;
    }
  },
};
