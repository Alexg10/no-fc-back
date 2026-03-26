# Plugin `table-grid`

Custom field Strapi : champ JSON `{ columns, rows, cells }` avec édition en grille dans l’admin.

## Activation

Le custom field est enregistré **au niveau de l’app** (pas comme plugin chargé par `config/plugins.ts`) :

- Serveur : [`src/index.ts`](../../../src/index.ts) → uid `global::table-grid`
- Admin : [`src/admin/app.tsx`](../../../src/admin/app.tsx)

Le dossier `src/plugins/table-grid/admin` contient uniquement le composant React `TableGridInput`.

## Utilisation dans un composant

Voir [`src/components/common/table-grid.json`](../../components/common/table-grid.json) et l’attribut :

`"customField": "global::table-grid"`

## Frontend

Voir [`docs/TABLE_GRID_FRONTEND.md`](../../../docs/TABLE_GRID_FRONTEND.md) et [`src/utils/table-grid-to-html.ts`](../../../src/utils/table-grid-to-html.ts).
