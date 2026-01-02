# Configuration des Webhooks Shopify pour les Collections

Ce document explique comment configurer les webhooks Shopify pour synchroniser automatiquement les créations et suppressions de collections dans votre application Strapi.

## Table des matières

1. [Architecture](#architecture)
2. [Configuration Shopify](#configuration-shopify)
3. [Configuration Strapi](#configuration-strapi)
4. [Endpoints disponibles](#endpoints-disponibles)
5. [Flux de synchronisation](#flux-de-synchronisation)
6. [Troubleshooting](#troubleshooting)

## Architecture

Le système utilise les webhooks Shopify pour déclencher automatiquement des mises à jour dans Strapi :

```
Shopify Admin
    ↓
collections/create, collections/update, collections/delete webhooks
    ↓
POST /api/shopify/webhook
    ↓
Webhook Controller (route handler)
    ↓
Webhook Service (processCollection*)
    ↓
Strapi Collections Table (SQLite/MySQL/PostgreSQL)
```

## Configuration Shopify

### 1. Se connecter à Shopify Admin

- Allez à votre dashboard Shopify Admin : https://admin.shopify.com/

### 2. Accéder à la configuration des webhooks

- Allez à **Settings** → **Apps and integrations**
- Sélectionnez votre application (ou créez une nouvelle si nécessaire)
- Allez à **Configuration** → **Webhooks**

### 3. Ajouter les webhooks requis

Vous devez ajouter 3 webhooks (ou 6 si vous voulez gérer aussi les produits) :

#### Pour les Collections :

| Topic | URL | Format |
|-------|-----|--------|
| collections/create | `https://your-domain.com/api/shopify/webhook` | JSON |
| collections/update | `https://your-domain.com/api/shopify/webhook` | JSON |
| collections/delete | `https://your-domain.com/api/shopify/webhook` | JSON |

#### Pour les Produits (facultatif, déjà configuré) :

| Topic | URL | Format |
|-------|-----|--------|
| products/create | `https://your-domain.com/api/shopify/webhook` | JSON |
| products/update | `https://your-domain.com/api/shopify/webhook` | JSON |
| products/delete | `https://your-domain.com/api/shopify/webhook` | JSON |

### 4. Copier le secret du webhook

- Une fois créé, Shopify affichera un "Webhook secret"
- Copiez cette valeur et mettez-la à jour dans votre fichier `.env` :

```env
SHOPIFY_WEBHOOK_SECRET=votre_secret_ici
```

**Important :** Ce secret est utilisé pour vérifier que les webhooks proviennent vraiment de Shopify.

## Configuration Strapi

### 1. Variables d'environnement requises

Assurez-vous que votre fichier `.env` contient :

```env
SHOPIFY_API_KEY=votre_cle_api
SHOPIFY_API_SECRET=votre_secret_api
SHOPIFY_ADMIN_API_ACCESS_TOKEN=votre_token_admin
SHOPIFY_SHOP_NAME=votre_boutique
SHOPIFY_API_VERSION=2023-04
SHOPIFY_WEBHOOK_SECRET=votre_secret_webhook
```

### 2. Vérifier la configuration

La configuration Shopify se trouve dans `/config/shopify.ts` et charge automatiquement les variables d'environnement.

### 3. Redémarrer Strapi

Après avoir modifié les variables d'environnement, redémarrez votre serveur Strapi :

```bash
npm run develop
# ou
yarn develop
```

## Endpoints disponibles

### Collections

#### GET - Récupérer toutes les collections

```bash
GET /api/collections
```

**Réponse :**
```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "title": "Nouvelle collection",
        "description": "Description de la collection",
        "shopifyId": "gid://shopify/Collection/123456789",
        "handle": "nouvelle-collection",
        "createdAt": "2024-01-02T10:30:00.000Z",
        "updatedAt": "2024-01-02T10:30:00.000Z"
      }
    }
  ],
  "meta": { "pagination": { "page": 1, "pageSize": 25, "total": 1 } }
}
```

#### GET - Récupérer une collection par ID

```bash
GET /api/collections/1
```

#### POST - Créer une collection (manuel)

```bash
POST /api/collections
Content-Type: application/json
Authorization: Bearer YOUR_AUTH_TOKEN

{
  "data": {
    "title": "Ma collection",
    "description": "Description",
    "shopifyId": "gid://shopify/Collection/987654321",
    "handle": "ma-collection"
  }
}
```

#### PUT - Mettre à jour une collection

```bash
PUT /api/collections/1
Content-Type: application/json
Authorization: Bearer YOUR_AUTH_TOKEN

{
  "data": {
    "title": "Titre mis à jour"
  }
}
```

#### DELETE - Supprimer une collection

```bash
DELETE /api/collections/1
Authorization: Bearer YOUR_AUTH_TOKEN
```

### Webhook (Shopify uniquement)

#### POST - Recevoir un webhook Shopify

```bash
POST /api/shopify/webhook
Content-Type: application/json
X-Shopify-Hmac-SHA256: signature
X-Shopify-Topic: collections/create

{
  "id": "gid://shopify/Collection/123456789",
  "title": "Nouvelle collection",
  "handle": "nouvelle-collection",
  "body_html": "Description HTML de la collection"
}
```

**Headers automatiquement vérifiés :**
- `X-Shopify-HMAC-SHA256` : Signature HMAC pour vérifier l'authenticité
- `X-Shopify-Topic` : Type d'événement (collections/create, collections/update, etc.)

## Flux de synchronisation

### Lors de la création d'une collection dans Shopify

1. Shopify envoie un webhook `collections/create` à votre endpoint
2. Le contrôleur webhook reçoit la requête
3. La signature HMAC est vérifiée (optionnelle, actuellement en debug)
4. Les données de la collection sont extraites
5. Le service `processCollectionCreate()` :
   - Vérifie si la collection existe déjà par `shopifyId`
   - Si elle existe, met à jour la collection existante
   - Si elle n'existe pas, crée une nouvelle collection dans Strapi
6. Les données sauvegardées incluent :
   - `title` : Titre de la collection Shopify
   - `description` : Contenu HTML de la collection
   - `shopifyId` : Identifiant unique de Shopify (clé primaire)
   - `handle` : Slug de la collection Shopify

### Lors de la suppression d'une collection dans Shopify

1. Shopify envoie un webhook `collections/delete` à votre endpoint
2. Le contrôleur webhook traite la requête
3. Le service `processCollectionDelete()` :
   - Recherche la collection dans Strapi par `shopifyId`
   - Supprime la collection si trouvée
   - Enregistre un warning si la collection n'est pas trouvée
4. La collection est supprimée de la base de données Strapi

### Lors de la mise à jour d'une collection dans Shopify

1. Shopify envoie un webhook `collections/update` à votre endpoint
2. Le service `processCollectionUpdate()` :
   - Recherche la collection par `shopifyId`
   - Met à jour les champs si trouvée
   - Crée une nouvelle collection si elle n'existe pas (pour les collectionsoujourtes)
3. Les modifications sont synchronisées dans Strapi

## Schéma de données

Les collections ont la structure suivante en base de données :

```json
{
  "id": 1,
  "title": "string (requis, localisé)",
  "description": "text (localisé)",
  "shopifyId": "string (unique, requis)",
  "handle": "string (unique, requis)",
  "image": "media (optionnel)",
  "products": "relation one-to-many vers les produits",
  "createdAt": "timestamp",
  "updatedAt": "timestamp",
  "publishedAt": "timestamp (draft & publish)",
  "locale": "string (i18n)"
}
```

### Attributs spéciaux

- **shopifyId** : Clé primaire pour synchronisation. Format : `gid://shopify/Collection/123456789`
- **handle** : Slug unique utilisé dans les URLs Shopify et Strapi
- **Localisé** : Les champs `title` et `description` supportent l'i18n
- **Relation products** : Vous pouvez associer des produits aux collections via l'interface Strapi

## Services disponibles

### Service Webhook (`api::shopify.webhook`)

**Méthodes :**

- `processCollectionCreate(collectionData)` : Crée ou met à jour une collection
- `processCollectionUpdate(collectionData)` : Met à jour une collection
- `processCollectionDelete(collectionData)` : Supprime une collection
- `processProductCreate(productData)` : Crée ou met à jour un produit
- `processProductUpdate(productData)` : Met à jour un produit
- `processProductDelete(productData)` : Supprime un produit

### Service Collection (`api::collection.collection`)

Service standard Strapi pour les opérations CRUD.

**Méthodes :**

- `find(params)` : Récupérer les collections
- `findOne(id, params)` : Récupérer une collection
- `create(params)` : Créer une collection
- `update(id, params)` : Mettre à jour une collection
- `delete(id)` : Supprimer une collection

## Troubleshooting

### Les webhooks ne sont pas reçus

**Solutions :**

1. Vérifiez que votre URL est accessible depuis Internet
   ```bash
   curl https://your-domain.com/api/shopify/webhook
   ```

2. Vérifiez les logs Shopify dans Admin → Settings → Webhooks → Livraison
3. Assurez-vous que le contenu-type est accessible sans authentification (par défaut, les webhooks sont autorisés)

### Les collections ne se synchronisent pas

**Vérifications :**

1. Vérifier les logs Strapi :
   ```bash
   # Dans les logs, rechercher "Création de la collection"
   ```

2. Vérifier que Strapi peut accéder à la base de données
3. Vérifier que le content type `collection` existe :
   ```bash
   GET /api/collections
   ```

### Erreur de signature HMAC

**Note :** La vérification HMAC est actuellement en mode debug. Voir le fichier controller webhook pour les détails.

Pour réactiver :
1. Modifier `/src/api/shopify/controllers/webhook.ts` ligne 122
2. Décommenter `return ctx.unauthorized("Invalid webhook signature");`
3. S'assurer que le `SHOPIFY_WEBHOOK_SECRET` est correct

### Connection timeout vers Shopify

Si vous avez des erreurs de connexion :

1. Vérifiez votre token d'accès : `SHOPIFY_ADMIN_API_ACCESS_TOKEN`
2. Vérifiez que le scope `write_products` est autorisé dans votre app Shopify
3. Vérifiez la version API : `SHOPIFY_API_VERSION=2023-04` (actuellement supportée)

## Scripts utiles

### Tester manuellement un webhook

```bash
curl -X POST https://your-domain.com/api/shopify/webhook \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Topic: collections/create" \
  -H "X-Shopify-HMAC-SHA256: fake-signature" \
  -d '{
    "id": "gid://shopify/Collection/123456789",
    "title": "Test Collection",
    "handle": "test-collection",
    "body_html": "This is a test collection"
  }'
```

### Vérifier les webhooks enregistrés

```bash
# Via l'API Shopify
curl -X GET "https://${SHOPIFY_SHOP_NAME}.myshopify.com/admin/api/${SHOPIFY_API_VERSION}/webhooks.json" \
  -H "X-Shopify-Access-Token: ${SHOPIFY_ADMIN_API_ACCESS_TOKEN}"
```

## Support

Pour plus d'informations :

- [Documentation Shopify Webhooks](https://shopify.dev/docs/admin-api/rest/reference/webhooks)
- [Documentation Strapi](https://strapi.io/documentation)
- Consultez les logs Strapi pour le debugging

---

**Dernière mise à jour :** 2024-01-02
