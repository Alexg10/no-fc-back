# Scripts Utilitaires

## register-shopify-webhooks.js

Script pour enregistrer manuellement les webhooks Shopify.

### Utilité

- Tester l'enregistrement des webhooks sans redémarrer Strapi
- Déboguer les problèmes de connexion à l'API Shopify
- Forcer la re-création des webhooks

### Prérequis

Les variables d'environnement suivantes doivent être configurées (dans `.env` ou `.env.local`) :

- `SHOPIFY_SHOP_NAME` - Nom de votre shop Shopify
- `SHOPIFY_ADMIN_API_ACCESS_TOKEN` - Token d'accès à l'API Admin
- `SHOPIFY_API_VERSION` - Version de l'API (optionnel, défaut: 2023-04)
- `STRAPI_PUBLIC_URL` - URL publique de Strapi

### Utilisation

```bash
node scripts/register-shopify-webhooks.js
```

### Exemple de sortie

```
🔄 Starting Shopify webhook registration...
   Shop: my-shop
   Webhook URL: https://api.mysite.com/api/shopify/webhook
   Topics: 6

📋 Fetching existing webhooks...
   Found 3 existing webhook(s)

✅ Webhook registered: products/create (ID: 123456789)
⏭️  Webhook already registered: products/update
✅ Webhook registered: products/delete (ID: 123456790)
⏭️  Webhook already registered: collections/create
⏭️  Webhook already registered: collections/update
⏭️  Webhook already registered: collections/delete

📊 Summary:
   Registered: 2
   Skipped: 4
   Total: 6

✅ All webhooks processed successfully!

📍 Verify in Shopify Admin:
   Settings → Notifications → Webhooks
```

### Troubleshooting

#### Erreur: Missing required environment variables

**Cause:** Une ou plusieurs variables d'env sont manquantes

**Solution:** Vérifiez votre fichier `.env` et assurez-vous que toutes les variables requises sont présentes

#### Erreur: HTTP 401 - Invalid API Access Token

**Cause:** Le token d'accès est invalide ou expiré

**Solution:**
1. Allez dans Shopify Admin → Settings → Apps and integrations → Develop apps
2. Régénérez le token d'accès
3. Copiez-le et mettez à jour la variable d'env

#### Erreur: HTTP 404 - Shop Not Found

**Cause:** Le nom du shop est incorrect ou le format est mauvais

**Solution:** Vérifiez que `SHOPIFY_SHOP_NAME` est au bon format (sans `.myshopify.com`)

### Notes

- Le script est idempotent : vous pouvez l'exécuter plusieurs fois sans créer de doublons
- Les webhooks existants ne seront pas recréés
- Le script affiche un récapitulatif à la fin
