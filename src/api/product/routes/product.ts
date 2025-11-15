/**
 * product router
 */

import { factories } from "@strapi/strapi";

const defaultRouter = factories.createCoreRouter("api::product.product");

// Fonction helper pour étendre les routes
const customRouter = (innerRouter: any, extraRoutes: any[] = []) => {
  let routes: any[];
  return {
    get prefix() {
      return innerRouter.prefix;
    },
    get routes() {
      if (!routes) {
        const innerRoutes =
          typeof innerRouter.routes === "function"
            ? innerRouter.routes()
            : Array.isArray(innerRouter.routes)
              ? innerRouter.routes
              : [];
        routes = [...innerRoutes, ...extraRoutes];
      }
      return routes;
    },
  };
};

const myExtraRoutes = [
  {
    method: "GET",
    path: "/products/:handle",
    handler: "product.findByHandle",
    config: {
      policies: [],
      middlewares: [],
    },
  },
];

export default customRouter(defaultRouter, myExtraRoutes);
