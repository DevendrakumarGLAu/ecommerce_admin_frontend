import { DataTableColumn } from './data-table.component';

/** Builds a CSV file from the given rows/columns and triggers a browser download. */
export function exportRowsToCsv<T extends object>(filename: string, columns: DataTableColumn<T>[], rows: T[]): void {
  const header = columns.map((col) => escapeCsvValue(col.label)).join(',');
  const lines = rows.map((row) =>
    columns
      .map((col) => escapeCsvValue(col.accessor ? col.accessor(row) : (row as Record<string, unknown>)[col.key]))
      .join(',')
  );

  const csvContent = [header, ...lines].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function escapeCsvValue(value: unknown): string {
  const str = value === null || value === undefined ? '' : String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}
