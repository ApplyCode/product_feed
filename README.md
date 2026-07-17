# BigCommerce → Tolstoy product feed

Middleware that pulls products from the BigCommerce Catalog API, maps them to [Tolstoy’s CSV format](https://help.gotolstoy.com/en/articles/13832207-how-to-upload-your-product-catalog-via-csv-to-tolstoy-in-the-new-platform), and publishes the file to a stable public URL for Tolstoy to refresh daily.

## CSV columns (matches `tolstoy-products-example.csv`)

| Column | Required | BigCommerce source |
|--------|----------|-------------------|
| `id` | Yes | Product `id` |
| `title` | Yes | `name` |
| `url` | Yes | `STORE_URL` + `custom_url.url` |
| `imageUrl` | Yes | `primary_image` or first `images[]` |
| `price` | Yes | `calculated_price` (fallback: `sale_price`, `price`) |
| `descriptionHtml` | No | `description` (HTML stripped to plain text, Feedonomics-style) |
| `images` | No | Additional image URLs (comma-separated) |
| `compareAtPrice` | No | `price` when on sale |
| `currencyCode` | No | `CURRENCY_CODE` env |
| `currencySymbol` | No | `CURRENCY_SYMBOL` env |
| `inventory` | No | `inventory_level` |

Header names must match Tolstoy exactly — the generator uses the same order as the example file.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in:

   - **BigCommerce**: [API account](https://support.bigcommerce.com/s/article/Store-API-Accounts) with `Products: read-only` (or modify scope if you extend the script).
   - **STORE_URL**: Your live storefront base URL (e.g. `https://www.yourstore.com`).
   - **PUBLISH_TARGET**: `local` for testing, `github` for GitHub Pages (via Actions).

3. Generate once:

   ```bash
   npm run generate
   ```

   Output: `output/tolstoy-products.csv` (when `PUBLISH_TARGET=local`).

## Stable public URL

Tolstoy needs a URL it can fetch on a schedule (they pull updates about daily; this project refreshes every **24 hours**).

### Option A — GitHub Pages + Actions (recommended for public repos)

No AWS or always-on server. The workflow in `.github/workflows/refresh-feed.yml` runs daily, builds the CSV, and publishes it to the `gh-pages` branch.

**1. Push this repo to a public GitHub repository**

**2. Add Actions secrets** (Settings → Secrets and variables → Actions):

| Secret | Required | Example |
|--------|----------|---------|
| `BIGCOMMERCE_STORE_HASH` | Yes | `abc123` |
| `BIGCOMMERCE_ACCESS_TOKEN` | Yes | your API token |
| `STORE_URL` | Yes | `https://foxylocks.com` |
| `CURRENCY_CODE` | No | `GBP` (defaults to USD) |
| `CURRENCY_SYMBOL` | No | `£` (defaults to $) |
| `ONLY_VISIBLE_PRODUCTS` | No | `true` |

**3. Enable GitHub Pages**

After the first workflow run (Actions → **Refresh Tolstoy product feed** → **Run workflow**):

1. Go to **Settings → Pages**
2. Source: **Deploy from a branch**
3. Branch: **`gh-pages`** / **`/ (root)`**
4. Save

**4. Your Tolstoy CSV URL**

```
https://YOUR_GITHUB_USERNAME.github.io/YOUR_REPO_NAME/tolstoy-products.csv
```

Example: repo `FoxySEO/product_feed` →  
`https://foxyseo.github.io/product_feed/tolstoy-products.csv`

Paste that URL into Tolstoy → product catalog CSV URL. The workflow re-runs daily at **06:00 UTC**.

### Option B — AWS S3

Set `PUBLISH_TARGET=s3` and S3/AWS secrets in `.env` or Actions. Use when you already host assets on S3/CloudFront.

### Option C — Long-running host + `npm run schedule`

On a VPS or container:

```bash
npm run schedule
```

Runs an immediate sync, then every 24 hours. Pair with `npm run serve` behind nginx if you serve the file from your own domain.

## Commands

| Command | Description |
|---------|-------------|
| `npm run generate` | One-shot: fetch BC → CSV → publish |
| `npm run schedule` | Same + repeat every 24h |
| `npm run serve` | Regenerate on start + every 24h; HTTP serve at `SERVE_PATH` |

## Tolstoy

In Tolstoy settings, add your **public CSV URL** (not a local file path). Tolstoy validates required columns: `id`, `title`, `url`, `imageUrl`, `price`.

## Troubleshooting GitHub Actions

**Node.js 20 deprecated warning** — harmless if the job succeeds. The workflow uses Node **22**; push the latest workflow file if you still see Node 20.

**`Process completed with exit code 1`** — open the failed run and expand the step that failed:

| Failed step | Likely cause |
|-------------|----------------|
| **Validate required secrets** | A secret is missing. Add `BIGCOMMERCE_STORE_HASH`, `BIGCOMMERCE_ACCESS_TOKEN`, and `STORE_URL` under Settings → Secrets and variables → Actions. Names must match exactly. |
| **Generate Tolstoy CSV** | BigCommerce API error (wrong token/store hash) or invalid `STORE_URL`. Read the red error line in the log. |
| **npm ci** | `package-lock.json` not pushed to GitHub. Commit and push it. |
| **Deploy CSV to GitHub Pages** | Repo permissions — ensure Actions can write to `gh-pages` (workflow already sets `contents: write`). |

## Notes

- Products without an image or price are skipped (Tolstoy would reject them).
- `ONLY_VISIBLE_PRODUCTS=true` (default) limits the feed to visible catalog items.
- For Windows Task Scheduler: run `npm run generate` daily with working directory set to this folder and env vars loaded.
