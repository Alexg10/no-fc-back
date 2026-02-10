# Diagnostic : Synchro Shopify → Strapi ne fonctionne pas

Ce guide vous aide à identifier pourquoi les produits/collections ne se synchronisent pas depuis Shopify vers Strapi.

## Checklist de diagnostic

### 1. Les webhooks sont-ils enregistrés dans Shopify ?

**Vérifier :** Shopify Admin → Settings → Notifications → Webhooks

Vous devez voir des webhooks avec l’URL de production :
```
https://sacred-dream-4825ee1b28.strapiapp.com/api/shopify/webhook
```

Pour les topics : `products/create`, `products/update`, `products/delete`

**Si absents :** Enregistrez-les manuellement ou exécutez :
```bash
STRAPI_PUBLIC_URL=https://sacred-dream-4825ee1b28.strapiapp.com node scripts/register-shopify-webhooks.js
```

### 2. Variables d’environnement en production

Dans Strapi Cloud (ou votre hébergeur), vérifiez :

| Variable | Description |
|----------|-------------|
| `STRAPI_PUBLIC_URL` | URL publique de Strapi (ex: `https://sacred-dream-4825ee1b28.strapiapp.com`) |
| `SHOPIFY_API_SECRET` | Client Secret de votre app Shopify |
| `SHOPIFY_WEBHOOK_SECRET` | Idéalement identique à `SHOPIFY_API_SECRET` (webhooks créés via API) |
| `SHOPIFY_ADMIN_API_ACCESS_TOKEN` | Token d’accès Admin API |
| `SHOPIFY_SHOP_NAME` | Nom de la boutique (ex: `ma-boutique`) |

**Important :** `SHOPIFY_WEBHOOK_SECRET` est utilisé pour vérifier la signature HMAC. Si les webhooks ont été créés manuellement dans Shopify Admin, utilisez le secret affiché à la création.

### 3. Le secret HMAC correspond-il ?

L’erreur `Invalid webhook signature` signifie que `SHOPIFY_WEBHOOK_SECRET` ne correspond pas au secret utilisé par Shopify.

- **Webhooks créés via l’API Shopify :** utilisez `SHOPIFY_API_SECRET` (Client Secret).
- **Webhooks créés manuellement :** utilisez le secret donné par Shopify.

### 4. Consulter les logs Strapi

En production (Strapi Cloud) :

1. Ouvrez le dashboard Strapi Cloud
2. Allez dans **Logs** ou **Deployments** → logs
3. Créez ou modifiez un produit dans Shopify
4. Regardez si des logs apparaissent, par exemple :
   - `Topic webhook`
   - `Webhook reçu`
   - `Signature HMAC valide` ou `Signature HMAC invalide`
   - `Création de produit depuis Shopify` / `Mise à jour du produit`

### 5. Tester avec un webhook réel

Dans Shopify Admin → Settings → Notifications → Webhooks → cliquez sur un webhook → **Send test notification**.

Puis vérifiez les logs Strapi pour voir si la requête est reçue et traitée.

### 6. Erreurs courantes

| Symptôme | Cause probable | Action |
|----------|----------------|--------|
| 401 Invalid webhook signature | Mauvais secret ou body modifié | Vérifier `SHOPIFY_WEBHOOK_SECRET` |
| 404 Not Found | Requête GET au lieu de POST | Les webhooks Shopify utilisent POST |
| Pas de logs | Webhooks non enregistrés ou mauvaise URL | Vérifier les webhooks dans Shopify |
| Produit créé mais non visible | Draft & Publish | Les produits sont créés en publiés |
| Erreur "handle required" | Handle manquant | Corrigé : fallback `product-{id}` |

## Auto-enregistrement des webhooks

Pour enregistrer automatiquement les webhooks au démarrage de Strapi :

```env
SHOPIFY_AUTO_REGISTER_WEBHOOKS=true
STRAPI_PUBLIC_URL=https://sacred-dream-4825ee1b28.strapiapp.com
```

## Modifications récentes (février 2025)

1. **Capture du body brut** : nouveau middleware `shopify-raw-body` qui capture le body avant le parsing JSON pour une vérification HMAC correcte.
2. **Handle fallback** : si Shopify n’envoie pas de handle, utilisation de `product-{id}`.
3. **Publication automatique** : les produits créés via webhook sont publiés immédiatement.
4. **Format d’ID** : prise en charge des ID Shopify GraphQL (`gid://shopify/Product/123`).
