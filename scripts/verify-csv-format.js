/**
 * Verifies generated CSV headers match Tolstoy example (no API call).
 */
import fs from "fs";
import { TOLSTOY_COLUMNS } from "../src/tolstoy-csv.js";
import { rowsToCsv } from "../src/tolstoy-csv.js";

const examplePath = "tolstoy-products-example.csv";
const exampleHeader = fs
  .readFileSync(examplePath, "utf8")
  .split("\n")[0]
  .trim();

const generatedHeader = rowsToCsv([]).split("\n")[0].trim();

if (exampleHeader !== generatedHeader) {
  console.error("Header mismatch!");
  console.error("Example:   ", exampleHeader);
  console.error("Generated: ", generatedHeader);
  process.exit(1);
}

console.log("CSV headers match Tolstoy example.");
console.log("Columns:", TOLSTOY_COLUMNS.join(", "));
