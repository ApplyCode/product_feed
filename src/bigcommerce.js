import { config } from "./config.js";

const BASE = `https://api.bigcommerce.com/stores/${config.bigcommerce.storeHash}/v3`;

async function bcFetch(path, searchParams = {}) {
  const url = new URL(`${BASE}${path}`);
  for (const [key, value] of Object.entries(searchParams)) {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  }

  const res = await fetch(url, {
    headers: {
      "X-Auth-Token": config.bigcommerce.accessToken,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `BigCommerce API ${res.status} ${res.statusText}: ${body.slice(0, 500)}`
    );
  }

  return res.json();
}

/**
 * Fetch all catalog products with images (paginated).
 */
export async function fetchAllProducts() {
  const products = [];
  let page = 1;
  let totalPages = 1;

  do {
    const params = {
      limit: config.bigcommerce.pageSize,
      page,
      include: "images,primary_image",
    };
    if (config.bigcommerce.onlyVisible) {
      params["is_visible"] = true;
    }

    const json = await bcFetch("/catalog/products", params);
    const batch = json.data || [];
    products.push(...batch);

    totalPages = json.meta?.pagination?.total_pages ?? 1;
    page += 1;
  } while (page <= totalPages);

  return products;
}
