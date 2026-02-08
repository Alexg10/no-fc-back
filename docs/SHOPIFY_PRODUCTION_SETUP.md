# Configuration Shopify pour la Production

Ce document explique comment configurer la synchronisation Shopify → Strapi en production sur Strapi Cloud.

## Vue d'ensemble

Le système synchronise automatiquement les produits et collections Shopify vers Strapi via des webhooks. Les webhooks sont enregistrés automatiquement au démarrage de Strapi.

**Webhooks synchronisés :**
- `products/create` → Crée un produit dans Strapi
- `products/update` → Met à jour un produit dans Strapi
- `products/delete` → Supprime un produit de Strapi
- `collections/create` → Crée une collection dans Strapi
- `collections/update` → Met à jour une collection dans Strapi
- `collections/delete` → Supprime une collection de Strapi

## Configuration sur Strapi Cloud

### 1. Variables d'environnement requises

Allez dans **Settings → Environment Variables** et ajoutez les variables suivantes :

```env
# URL publique de votre Strapi (OBLIGATOIRE pour webhook registration)
STRAPI_PUBLIC_URL=https://votre-url-strapi-cloud.com

# Shopify API Credentials (depuis votre app Shopify)
SHOPIFY_API_KEY=votre_api_key
SHOPIFY_API_SECRET=votre_api_secret
SHOPIFY_ADMIN_API_ACCESS_TOKEN=votre_access_token
SHOPIFY_SHOP_NAME=votre_shop_name
SHOPIFY_API_VERSION=2023-04
SHOPIFY_WEBHOOK_SECRET=votre_webhook_secret
```

**⚠️ Important :** La variable `STRAPI_PUBLIC_URL` est **obligatoire** pour que les webhooks soient enregistrés automatiquement.

### 2. Récupérer les credentials Shopify

1. Allez dans **Shopify Admin → Settings → Apps and integrations → Develop apps**
2. Créez une application ou sélectionnez l'existante
3. Dans **Configuration**, allez à **Admin API access scopes**
4. Activez les permissions pour :
   - `read_products`
   - `write_products`
   - `read_collections`
   - `write_collections`
5. Installez/mettez à jour l'app
6. Copiez les credentials depuis **Admin API credentials** :
   - API Key
   - API Secret
   - Access Token

## Vérification du déploiement

### 1. Vérifier les logs de démarrage

Après le déploiement, consultez les logs Strapi Cloud :

```bash
# Cherchez les messages :
✅ Shopify webhooks registered successfully
```

Si vous voyez une erreur :

```bash
❌ Error registering Shopify webhooks
```

Vérifiez :
- La variable `STRAPI_PUBLIC_URL` est correcte
- Toutes les credentials Shopify sont présentes
- L'application Shopify a les bonnes permissions

### 2. Vérifier les webhooks dans Shopify

1. Allez dans **Shopify Admin → Settings → Notifications → Webhooks**
2. Vous devriez voir **6 webhooks** :
   - products/create
   - products/update
   - products/delete
   - collections/create
   - collections/update
   - collections/delete

Tous doivent pointer vers : `https://votre-url-strapi-cloud.com/api/shopify/webhook`

**Note :** Les webhooks peuvent prendre quelques minutes pour apparaître après le déploiement.

### 3. Tester les webhooks

#### Test 1 : Créer un produit de test dans Shopify

1. Allez dans **Shopify Admin → Products**
2. Créez un nouveau produit test
3. Attendez 30 secondes
4. Vérifiez dans Strapi que le produit a été créé

#### Test 2 : Vérifier les webhooks dans les logs

Dans Strapi Cloud logs, cherchez :

```
✅ Webhook registered: products/create
✅ Webhook registered: products/update
✅ Webhook registered: products/delete
```

#### Test 3 : Curl pour vérifier l'endpoint

```bash
curl -X POST https://votre-url-strapi-cloud.com/api/shopify/webhook \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Topic: products/update" \
  -H "X-Shopify-HMAC-SHA256: test" \
  -d '{"id": 123, "title": "Test Product"}'
```

**Réponses attendues :**
- `401 Unauthorized` → HMAC verification actif ✅ (bonne sécurité)
- `200 OK` → Webhook traité ✅

## Troubleshooting

### Les webhooks ne sont pas enregistrés

**Problème :** Les webhooks n'apparaissent pas dans Shopify Admin

**Solutions :**
1. Vérifiez que `STRAPI_PUBLIC_URL` est configurée correctement
2. Redéployez Strapi après avoir ajouté les variables d'env
3. Attendez 2-3 minutes après le redéploiement
4. Vérifiez les logs Strapi pour les erreurs

### Les webhooks existent mais les produits ne sont pas synchronisés

**Problème :** Les webhooks s'exécutent mais rien n'est créé dans Strapi

**Solutions :**
1. Vérifiez que le endpoint `/api/shopify/webhook` est accessible :
   ```bash
   curl -X GET https://votre-url-strapi-cloud.com/api/shopify/webhook
   ```
   Doit retourner un statut HTTP (pas 404)

2. Consultez les logs Strapi pour voir si des erreurs sont reportées

3. Vérifiez que le contenu-type `product` existe dans Strapi

4. Vérifiez que les credentials Shopify sont correctes

### HMAC verification error

**Problème :** Erreur `Invalid webhook signature`

**Causes :**
- Le secret Shopify ne correspond pas à `SHOPIFY_WEBHOOK_SECRET`
- Le body brut n'est pas capturé correctement
- Décalage horaire entre les serveurs

**Solution :**
- Vérifiez que `SHOPIFY_WEBHOOK_SECRET` = `SHOPIFY_API_SECRET`
- Consultez les logs détaillés pour voir les mismatches HMAC

## Monitoring en production

### 1. Surveiller les logs

Consultez régulièrement **Strapi Cloud → Logs** pour :
- Les erreurs de traitement des webhooks
- Les problèmes de connexion à Shopify
- Les statistiques de synchronisation

### 2. Tester périodiquement

Chaque semaine, créez un produit de test dans Shopify et vérifiez qu'il apparaît dans Strapi.

### 3. Vérifier les webhooks restent actifs

Shopify peut désactiver les webhooks si trop d'erreurs (5xx) sont retournées. Vérifiez régulièrement dans **Shopify Admin → Webhooks**.

## Rollback à la configuration manuelle

Si l'enregistrement automatique cause des problèmes :

1. Commentez le code dans `src/index.ts` (bootstrap)
2. Déployez
3. Configurez manuellement les webhooks dans Shopify Admin :
   ```
   URL: https://votre-url-strapi-cloud.com/api/shopify/webhook
   ```
4. Testez

## Points d'intégration

### Fichiers impliqués

```
src/
├── index.ts                                    # Bootstrap & webhook registration
├── api/shopify/
│   ├── controllers/webhook.ts                  # Récepteur des webhooks
│   ├── services/webhook.ts                     # Traitement des webhooks
│   └── services/webhook-registration.ts        # Enregistrement automatique
│   └── routes/webhook.ts                       # Route POST
```

### Flow complet

```
1. Strapi démarre
   ↓
2. bootstrap() appelé
   ↓
3. webhook-registration.ts exécuté
   ↓
4. Webhooks créés dans Shopify (si n'existent pas)
   ↓
5. Produit créé/modifié dans Shopify
   ↓
6. Webhook envoyé à /api/shopify/webhook
   ↓
7. HMAC signature vérifiée
   ↓
8. Produit créé/mis à jour dans Strapi
```

## Questions fréquentes

**Q: Combien de temps avant que les webhooks soient actifs ?**
A: Immédiatement après le démarrage de Strapi. Mais Shopify peut prendre 1-2 minutes pour afficher les webhooks dans l'UI.

**Q: Que se passe-t-il si je change l'URL de Strapi ?**
A: Les vieux webhooks resteront dans Shopify mais ne fonctionneront plus. Mettez à jour `STRAPI_PUBLIC_URL` et redéployez pour enregistrer les nouveaux.

**Q: Les anciens webhooks ngrok seront-ils supprimés ?**
A: Non, vous devez les supprimer manuellement dans Shopify Admin. Supprimez les webhooks avec les URLs ngrok.

**Q: Puis-je avoir plusieurs instances de Strapi qui reçoivent les webhooks ?**
A: Oui, chaque instance enregistrera ses propres webhooks si elle a une `STRAPI_PUBLIC_URL` différente.

## Support

Pour les problèmes :
1. Consultez les logs Strapi Cloud
2. Vérifiez que toutes les variables d'env sont présentes
3. Testez manuellement avec curl
4. Vérifiez que les URLs sont HTTPS et accessibles publiquement
