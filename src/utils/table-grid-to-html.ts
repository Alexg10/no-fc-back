/**
 * Convertit la valeur JSON du custom field `table-grid` en HTML `<table>`.
 * À utiliser côté frontend (Next, etc.) lorsque vous affichez un bloc `common.table-grid`.
 */

export type TableGridData = {
  columns: number;
  rows: number;
  cells: string[][];
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * @param grid - valeur du champ custom `grid` (JSON)
 * @param caption - optionnel, ex. depuis le composant `common.table-grid.caption`
 */
export function tableGridToHtml(
  grid: TableGridData | null | undefined,
  caption?: string | null
): string {
  if (!grid || !Array.isArray(grid.cells) || grid.cells.length === 0) {
    return '';
  }
  const cap =
    caption && String(caption).trim()
      ? `<caption>${escapeHtml(String(caption))}</caption>`
      : '';
  const bodyRows = grid.cells
    .map(
      (row) =>
        `<tr>${(Array.isArray(row) ? row : [])
          .map((cell) => `<td>${escapeHtml(cell == null ? '' : String(cell))}</td>`)
          .join('')}</tr>`
    )
    .join('');
  return `<table class="table-grid">${cap}<tbody>${bodyRows}</tbody></table>`;
}
