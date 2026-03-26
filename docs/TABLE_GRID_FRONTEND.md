# Handoff frontend — composant `common.table-grid`

Document à copier / transmettre à l’équipe frontend pour afficher les tableaux édités dans Strapi.

---

## Résumé

- **Composant Strapi** : `common.table-grid`
- **Emplacement** : dynamic zones (ex. `product.blocks`, autres types qui autorisent ce composant)
- **Discrimination API** : chaque bloc de la zone dynamique inclut un champ du type `__component: "common.table-grid"` (selon la version de l’API REST / format de réponse)

---

## Champs du composant

| Champ     | Type        | Obligatoire | Description |
|-----------|-------------|-------------|-------------|
| `caption` | `string`    | Non         | Légende optionnelle (titre au-dessus du tableau) |
| `grid`    | JSON (objet)| Non         | Dimensions + contenu des cellules |

---

## Structure JSON du champ `grid`

```json
{
  "columns": 3,
  "rows": 2,
  "cells": [
    ["L1C1", "L1C2", "L1C3"],
    ["L2C1", "L2C2", "L2C3"]
  ]
}
```

- **`columns`** / **`rows`** : dimensions logiques (cohérentes avec `cells`)
- **`cells`** : tableau de **lignes** ; chaque ligne est un tableau de **strings** (une cellule = une string)

---

## Exemple de bloc dans une réponse API (dynamic zone)

```json
{
  "__component": "common.table-grid",
  "caption": "Guide des tailles",
  "grid": {
    "columns": 2,
    "rows": 2,
    "cells": [
      ["Taille", "Tour de poitrine"],
      ["M", "96 cm"]
    ]
  }
}
```

*(Les champs annexes comme `id` peuvent être présents selon `populate` et la version Strapi.)*

---

## Récupération côté API

- Interroger l’entrée qui contient la dynamic zone (ex. **Product** avec `blocks`)
- Utiliser **`populate`** pour inclure les composants des blocs (profondeur suffisante pour `blocks` / nested components)

---

## Types TypeScript (référence)

```ts
type TableGridData = {
  columns: number;
  rows: number;
  cells: string[][];
};

type TableGridBlock = {
  __component: 'common.table-grid';
  caption?: string | null;
  grid?: TableGridData | null;
};
```

---

## Affichage — option A : HTML généré

Le backend expose une fonction utilitaire (logique reproductible côté front) :

- Fichier de référence dans ce repo : `src/utils/table-grid-to-html.ts`
- Fonction : `tableGridToHtml(grid, caption)` → string HTML `<table class="table-grid">…</table>` avec échappement des caractères sensibles

Exemple React :

```tsx
import { tableGridToHtml } from '@/utils/table-grid-to-html';

function TableGridBlock({ block }: { block: { caption?: string; grid?: unknown } }) {
  const html = tableGridToHtml(block.grid as any, block.caption);
  if (!html) return null;
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
```

---

## Affichage — option B : JSX (recommandé si pas de HTML brut)

Parcourir `grid.cells` avec deux boucles (lignes × colonnes) et rendre `<table>`, `<caption>` si besoin, `<tbody>`, `<tr>`, `<td>`.

---

## Checklist front

1. Filtrer les blocs où `__component === 'common.table-grid'`
2. Lire `caption` et `grid`
3. Gérer `grid` absent ou `cells` vide → ne rien afficher ou fallback
4. Préférer JSX + échappement React aux textes si pas d’`innerHTML`

---

## Fichier source dans le repo

- Utilitaire HTML : [`src/utils/table-grid-to-html.ts`](../src/utils/table-grid-to-html.ts)
- Schéma composant : [`src/components/common/table-grid.json`](../src/components/common/table-grid.json)
