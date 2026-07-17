const NAMED_ENTITIES = {
  nbsp: " ",
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  rsquo: "'",
  lsquo: "'",
  rdquo: '"',
  ldquo: '"',
  hellip: "...",
  ndash: "-",
  mdash: "—",
  bull: "•",
  copy: "©",
  reg: "®",
  trade: "™",
};

/**
 * Convert BigCommerce HTML product descriptions to plain text
 * (similar to Feedonomics meta.feedonomics.com exports).
 */
export function htmlToPlainText(html) {
  if (!html || typeof html !== "string") return "";

  let text = html.replace(/\r\n/g, "\n");

  text = text.replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(/<\/p>/gi, "\n\n");
  text = text.replace(/<\/div>/gi, "\n");
  text = text.replace(/<\/h[1-6]>/gi, "\n\n");
  text = text.replace(/<li[^>]*>/gi, "\n");
  text = text.replace(/<\/li>/gi, "\n");
  text = text.replace(/<\/?(ul|ol|table|tr|td|th|thead|tbody)[^>]*>/gi, "\n");

  text = text.replace(/<[^>]+>/g, "");
  text = decodeHtmlEntities(text);

  text = text
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .join("\n");

  text = text.replace(/\n{3,}/g, "\n\n").trim();

  return text;
}

function decodeHtmlEntities(text) {
  return text
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCodePoint(parseInt(hex, 16))
    )
    .replace(
      /&([a-z]+);/gi,
      (_, name) => NAMED_ENTITIES[name.toLowerCase()] ?? `&${name};`
    );
}
