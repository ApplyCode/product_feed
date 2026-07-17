/**
 * Tolstoy CSV columns — must match Tolstoy docs and tolstoy-products-example.csv exactly.
 * Required: id, title, url, imageUrl, price
 */
export const TOLSTOY_COLUMNS = [
  "id",
  "title",
  "descriptionHtml",
  "url",
  "imageUrl",
  "images",
  "price",
  "compareAtPrice",
  "currencyCode",
  "currencySymbol",
  "inventory",
];

function escapeCsvField(value) {
  if (value === null || value === undefined) return '""';
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

export function rowToCsvLine(row) {
  return TOLSTOY_COLUMNS.map((col) => escapeCsvField(row[col] ?? "")).join(",");
}

export function rowsToCsv(rows) {
  const header = TOLSTOY_COLUMNS.map((col) => `"${col}"`).join(",");
  const lines = rows.map(rowToCsvLine);
  return [header, ...lines].join("\n") + "\n";
}
