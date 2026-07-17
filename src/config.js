import "dotenv/config";

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function bool(name, defaultValue) {
  const raw = process.env[name];
  if (raw === undefined || raw === "") return defaultValue;
  return ["1", "true", "yes", "on"].includes(raw.toLowerCase());
}

export const config = {
  bigcommerce: {
    storeHash: required("BIGCOMMERCE_STORE_HASH"),
    accessToken: required("BIGCOMMERCE_ACCESS_TOKEN"),
    pageSize: 250,
    onlyVisible: bool("ONLY_VISIBLE_PRODUCTS", true),
  },
  storeUrl: required("STORE_URL").replace(/\/$/, ""),
  currencyCode: process.env.CURRENCY_CODE || "USD",
  currencySymbol: process.env.CURRENCY_SYMBOL || "$",
  publish: {
    target: (process.env.PUBLISH_TARGET || "local").toLowerCase(),
    outputPath: process.env.OUTPUT_PATH || "output/tolstoy-products.csv",
    github: {
      outputPath: process.env.OUTPUT_PATH || "public/tolstoy-products.csv",
      publicUrl: process.env.GITHUB_PUBLIC_URL || "",
    },
    s3: {
      region: process.env.AWS_REGION || "us-east-1",
      bucket: process.env.S3_BUCKET,
      key: process.env.S3_KEY || "feeds/tolstoy-products.csv",
      publicUrl: process.env.S3_PUBLIC_URL,
    },
  },
  serve: {
    port: Number(process.env.SERVE_PORT || 8080),
    path: process.env.SERVE_PATH || "/feeds/tolstoy-products.csv",
  },
};
