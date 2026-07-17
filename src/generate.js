import { fetchAllProducts } from "./bigcommerce.js";
import { mapProductToTolstoyRow } from "./mapper.js";
import { rowsToCsv } from "./tolstoy-csv.js";
import { publishFeed } from "./publish.js";

export async function generateAndPublish() {
  console.log("Fetching products from BigCommerce...");
  const products = await fetchAllProducts();
  console.log(`Fetched ${products.length} products.`);

  const rows = products
    .map(mapProductToTolstoyRow)
    .filter((row) => row.id && row.title && row.url && row.imageUrl && row.price);

  const skipped = products.length - rows.length;
  if (skipped > 0) {
    console.warn(
      `Skipped ${skipped} products missing required Tolstoy fields (id, title, url, imageUrl, price).`
    );
  }

  const csv = rowsToCsv(rows);
  const { location } = await publishFeed(csv);

  console.log(`Wrote ${rows.length} rows to Tolstoy CSV.`);
  console.log(`Public feed location: ${location}`);

  return { rowCount: rows.length, location, csv };
}
