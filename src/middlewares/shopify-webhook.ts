// Middleware pour capturer le body brut pour les webhooks Shopify
// Nécessaire pour la vérification HMAC
// Placé APRÈS strapi::body pour utiliser le body non parsé

export default (config: any, { strapi }: any) => {
  return async (ctx: any, next: any) => {
    await next();
    
    // Seulement pour les webhooks Shopify
    // Après que strapi::body ait parsé, récupérer le body non parsé
    if (ctx.path === '/api/shopify/webhook' && ctx.method === 'POST') {
      try {
        // koa-body avec includeUnparsed: true expose le body brut via un Symbol
        const unparsedSymbol = Symbol.for('unparsedBody');
        const rawBody = (ctx.request.body as any)?.[unparsedSymbol];
        
        if (rawBody) {
          (ctx.request as any).rawBody = typeof rawBody === 'string' 
            ? rawBody 
            : rawBody.toString('utf8');
          strapi.log.info('Middleware webhook: body brut récupéré via Symbol', { 
            length: (ctx.request as any).rawBody?.length || 0 
          });
        } else {
          // Fallback: utiliser le body parsé stringifié
          // Note: Ce n'est pas idéal car l'ordre des clés peut différer
          (ctx.request as any).rawBody = JSON.stringify(ctx.request.body);
          strapi.log.warn('Middleware webhook: utilisation du body parsé (la vérification HMAC peut échouer)', {
            bodyKeys: ctx.request.body ? Object.keys(ctx.request.body) : [],
          });
        }
      } catch (error: any) {
        strapi.log.error('Erreur dans le middleware webhook:', error);
      }
    }
  };
};

