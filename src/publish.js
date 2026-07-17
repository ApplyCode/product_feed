import fs from "fs/promises";
import path from "path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { config } from "./config.js";

async function writeLocal(csv, outputPath) {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, csv, "utf8");
  return { location: path.resolve(outputPath) };
}

async function publishS3(csv) {
  const { bucket, key, region, publicUrl } = config.publish.s3;
  if (!bucket) {
    throw new Error("S3_BUCKET is required when PUBLISH_TARGET=s3");
  }

  const client = new S3Client({ region });
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: csv,
      ContentType: "text/csv; charset=utf-8",
      CacheControl: "max-age=3600",
    })
  );

  const url =
    publicUrl ||
    `https://${bucket}.s3.${region}.amazonaws.com/${key.replace(/^\//, "")}`;

  return { location: url };
}

async function publishGithub(csv) {
  const { outputPath, publicUrl } = config.publish.github;
  await writeLocal(csv, outputPath);
  return {
    location: publicUrl || path.resolve(outputPath),
  };
}

export async function publishFeed(csv) {
  const target = config.publish.target;

  if (target === "s3") {
    return publishS3(csv);
  }

  if (target === "github") {
    return publishGithub(csv);
  }

  if (target === "local" || target === "") {
    return writeLocal(csv, config.publish.outputPath);
  }

  throw new Error(
    `Unknown PUBLISH_TARGET "${target}". Use "local", "github", or "s3".`
  );
}
