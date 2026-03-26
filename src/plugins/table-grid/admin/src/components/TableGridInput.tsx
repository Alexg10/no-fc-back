import * as React from 'react';
import { Field, Flex, NumberInput, TextInput, Typography } from '@strapi/design-system';
import { GridFour } from '@strapi/icons';

export type TableGridValue = {
  columns: number;
  rows: number;
  cells: string[][];
};

const MAX_COLS = 20;
const MAX_ROWS = 50;

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function emptyGrid(columns: number, rows: number): string[][] {
  return Array.from({ length: rows }, () => Array.from({ length: columns }, () => ''));
}

function resizeGrid(
  prev: string[][] | undefined,
  columns: number,
  rows: number
): string[][] {
  const next = emptyGrid(columns, rows);
  if (!prev || !Array.isArray(prev)) return next;
  for (let r = 0; r < rows; r += 1) {
    const row = prev[r];
    if (!Array.isArray(row)) continue;
    for (let c = 0; c < columns; c += 1) {
      if (typeof row[c] === 'string') next[r][c] = row[c];
    }
  }
  return next;
}

export function normalizeTableGridValue(value: unknown): TableGridValue {
  const fallback: TableGridValue = { columns: 2, rows: 2, cells: emptyGrid(2, 2) };
  if (value == null) return fallback;
  let obj: unknown = value;
  if (typeof value === 'string') {
    try {
      obj = JSON.parse(value);
    } catch {
      return fallback;
    }
  }
  if (typeof obj !== 'object' || obj === null) return fallback;
  const o = obj as Record<string, unknown>;
  const columns = clamp(Number(o.columns) || 2, 1, MAX_COLS);
  const rows = clamp(Number(o.rows) || 2, 1, MAX_ROWS);
  let cells = o.cells;
  if (!Array.isArray(cells)) cells = [];
  const grid = resizeGrid(cells as string[][], columns, rows);
  return { columns, rows, cells: grid };
}

export const TableGridInput = React.forwardRef<HTMLDivElement, any>((props, ref) => {
  const {
    attribute,
    disabled,
    intlLabel,
    name,
    onChange,
    required,
    value,
  } = props;

  const state = React.useMemo(() => normalizeTableGridValue(value), [value]);

  const [columns, setColumns] = React.useState(state.columns);
  const [rows, setRows] = React.useState(state.rows);
  const [cells, setCells] = React.useState(state.cells);

  React.useEffect(() => {
    const n = normalizeTableGridValue(value);
    setColumns(n.columns);
    setRows(n.rows);
    setCells(n.cells);
  }, [value]);

  const push = React.useCallback(
    (next: TableGridValue) => {
      onChange({
        target: {
          name,
          type: attribute.type,
          value: next,
        },
      });
    },
    [attribute.type, name, onChange]
  );

  const applyDimensions = (cols: number, rws: number) => {
    const c = clamp(cols, 1, MAX_COLS);
    const r = clamp(rws, 1, MAX_ROWS);
    setColumns(c);
    setRows(r);
    setCells((prev) => {
      const nextCells = resizeGrid(prev, c, r);
      push({ columns: c, rows: r, cells: nextCells });
      return nextCells;
    });
  };

  const setCell = (row: number, col: number, text: string) => {
    setCells((prev) => {
      const next = prev.map((rowArr) => (rowArr ? [...rowArr] : []));
      if (!next[row]) next[row] = Array.from({ length: columns }, () => '');
      next[row][col] = text;
      push({ columns, rows, cells: next });
      return next;
    });
  };

  return (
    <Field.Root>
      <Flex ref={ref} direction="column" alignItems="stretch" gap={3} width="100%">
        <Flex gap={2} alignItems="center">
          <GridFour width="16px" height="16px" />
          <Typography variant="pi" fontWeight="bold">
            {intlLabel?.defaultMessage ?? 'Table grid'}
          </Typography>
        </Flex>
        <Flex gap={4} wrap="wrap">
          <Field.Root name={`${name}_columns`}>
            <Field.Label>
              Columns
              {required ? ' *' : ''}
            </Field.Label>
            <NumberInput
              disabled={disabled}
              min={1}
              max={MAX_COLS}
              value={columns}
              onValueChange={(v: number | undefined) => applyDimensions(Number(v ?? columns), rows)}
            />
          </Field.Root>
          <Field.Root name={`${name}_rows`}>
            <Field.Label>Rows</Field.Label>
            <NumberInput
              disabled={disabled}
              min={1}
              max={MAX_ROWS}
              value={rows}
              onValueChange={(v: number | undefined) => applyDimensions(columns, Number(v ?? rows))}
            />
          </Field.Root>
        </Flex>
        <Flex direction="column" gap={2}>
          {Array.from({ length: rows }, (_, r) => (
            <Flex key={r} gap={2} wrap="wrap">
              {Array.from({ length: columns }, (_, c) => (
                <TextInput
                  key={`${r}-${c}`}
                  disabled={disabled}
                  label={`R${r + 1} C${c + 1}`}
                  name={`${name}_cell_${r}_${c}`}
                  value={cells[r]?.[c] ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setCell(r, c, e.target.value)
                  }
                />
              ))}
            </Flex>
          ))}
        </Flex>
      </Flex>
    </Field.Root>
  );
});

TableGridInput.displayName = 'TableGridInput';
