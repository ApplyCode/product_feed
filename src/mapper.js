import { config } from "./config.js";
import { htmlToPlainText } from "./html-to-plain-text.js";

function productUrl(product) {
  const slug = product.custom_url?.url;
  if (!slug) {
    return `${config.storeUrl}/products/${product.id}`;
  }
  const path = slug.startsWith("/") ? slug : `/${slug}`;
  return `${config.storeUrl}${path}`;
}

function primaryImageUrl(product) {
  const primary = product.primary_image;
  if (primary?.url_standard) return primary.url_standard;
  if (primary?.url_zoom) return primary.url_zoom;
  if (primary?.url_thumbnail) return primary.url_thumbnail;

  const images = product.images || [];
  const sorted = [...images].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
  );
  const first = sorted[0];
  return (
    first?.url_standard ||
    first?.url_zoom ||
    first?.url_thumbnail ||
    ""
  );
}

function additionalImageUrls(product) {
  const primaryUrl = primaryImageUrl(product);
  const images = product.images || [];
  const urls = images
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((img) => img.url_standard || img.url_zoom || img.url_thumbnail)
    .filter(Boolean)
    .filter((url) => url !== primaryUrl);

  return urls.join(",");
}

function formatPrice(value) {
  if (value === null || value === undefined || value === "") return "";
  const num = Number(value);
  if (Number.isNaN(num)) return "";
  return num.toFixed(2);
}

/**
 * Map a BigCommerce product to a Tolstoy CSV row.
 */
export function mapProductToTolstoyRow(product) {
  const price =
    product.calculated_price ??
    product.sale_price ??
    product.price ??
    "";
  const compareAt =
    product.sale_price != null &&
    product.price != null &&
    Number(product.sale_price) < Number(product.price)
      ? product.price
      : "";

  return {
    id: String(product.id),
    title: product.name || "",
    descriptionHtml: htmlToPlainText(product.description),
    url: productUrl(product),
    imageUrl: primaryImageUrl(product),
    images: additionalImageUrls(product),
    price: formatPrice(price),
    compareAtPrice: formatPrice(compareAt),
    currencyCode: config.currencyCode,
    currencySymbol: config.currencySymbol,
    inventory:
      product.inventory_level != null
        ? String(product.inventory_level)
        : "",
  };
}
