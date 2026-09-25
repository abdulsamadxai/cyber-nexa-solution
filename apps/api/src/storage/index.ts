import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { env } from "../config/env.js";
import { badRequest } from "../lib/errors.js";

export const UPLOAD_DIR = path.resolve(process.cwd(), "uploads");

/** Allowed uploads, verified by magic bytes — not by the client-supplied MIME type. SVG is refused (can carry scripts). */
const SIGNATURES: { mime: string; ext: string; test: (b: Buffer) => boolean }[] = [
  { mime: "image/jpeg", ext: "jpg", test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { mime: "image/png", ext: "png", test: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { mime: "image/gif", ext: "gif", test: (b) => b.subarray(0, 4).toString("ascii") === "GIF8" },
  { mime: "image/webp", ext: "webp", test: (b) => b.subarray(0, 4).toString("ascii") === "RIFF" && b.subarray(8, 12).toString("ascii") === "WEBP" },
  { mime: "image/avif", ext: "avif", test: (b) => b.subarray(4, 12).toString("ascii").startsWith("ftypavi") },
  { mime: "image/x-icon", ext: "ico", test: (b) => b[0] === 0 && b[1] === 0 && b[2] === 1 && b[3] === 0 },
  { mime: "application/pdf", ext: "pdf", test: (b) => b.subarray(0, 5).toString("ascii") === "%PDF-" },
];

export interface StoredFile {
  url: string;
  key: string;
  provider: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  filename: string;
}

export function detectType(buf: Buffer) {
  return SIGNATURES.find((s) => s.test(buf));
}

/** Validate, optimise (images → WebP, max 2400px, metadata stripped) and store a file. */
export async function storeUpload(buf: Buffer, originalName: string, folder: string): Promise<StoredFile> {
  const type = detectType(buf);
  if (!type) throw badRequest("Unsupported file type. Upload JPG, PNG, WebP, GIF, AVIF, ICO or PDF files.");

  let body = buf;
  let mime = type.mime;
  let ext = type.ext;
  let width: number | undefined;
  let height: number | undefined;

  if (["image/jpeg", "image/png", "image/webp", "image/avif"].includes(type.mime)) {
    try {
      const out = await sharp(buf, { failOn: "error" })
        .rotate()
        .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer({ resolveWithObject: true });
      body = out.data;
      width = out.info.width;
      height = out.info.height;
      mime = "image/webp";
      ext = "webp";
    } catch {
      throw badRequest("That image appears to be damaged and could not be processed.");
    }
  } else if (type.mime === "image/gif") {
    const meta = await sharp(buf).metadata().catch(() => null);
    width = meta?.width;
    height = meta?.height;
  }

  const base = path
    .parse(originalName)
    .name.toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60) || "file";
  const safeFolder = folder.replace(/[^a-z0-9-]/gi, "").toLowerCase() || "general";
  const filename = `${base}-${crypto.randomBytes(5).toString("hex")}.${ext}`;
  const key = `${safeFolder}/${filename}`;

  const stored = await getStorage().put(key, body, mime);
  return { ...stored, mimeType: mime, size: body.length, width, height, filename };
}

interface Storage {
  name: string;
  put(key: string, body: Buffer, mime: string): Promise<{ url: string; key: string; provider: string }>;
  remove(key: string): Promise<void>;
}

const local: Storage = {
  name: "local",
  async put(key, body) {
    const file = path.join(UPLOAD_DIR, key);
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, body);
    return { url: `${env.BACKEND_URL.replace(/\/$/, "")}/uploads/${key}`, key, provider: "local" };
  },
  async remove(key) {
    const file = path.resolve(UPLOAD_DIR, key);
    if (!file.startsWith(UPLOAD_DIR)) return;
    await fs.rm(file, { force: true });
  },
};

let s3client: S3Client | undefined;
const s3: Storage = {
  name: "s3",
  async put(key, body, mime) {
    if (!env.S3_BUCKET || !env.S3_ACCESS_KEY_ID || !env.S3_SECRET_ACCESS_KEY || !env.S3_PUBLIC_URL)
      throw new Error("S3 storage is not fully configured (S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_PUBLIC_URL)");
    s3client ??= new S3Client({
      region: env.S3_REGION,
      endpoint: env.S3_ENDPOINT,
      forcePathStyle: env.S3_FORCE_PATH_STYLE,
      credentials: { accessKeyId: env.S3_ACCESS_KEY_ID, secretAccessKey: env.S3_SECRET_ACCESS_KEY },
    });
    await s3client.send(
      new PutObjectCommand({ Bucket: env.S3_BUCKET, Key: key, Body: body, ContentType: mime, CacheControl: "public, max-age=31536000, immutable" }),
    );
    return { url: `${env.S3_PUBLIC_URL.replace(/\/$/, "")}/${key}`, key, provider: "s3" };
  },
  async remove(key) {
    if (!s3client || !env.S3_BUCKET) return;
    await s3client.send(new DeleteObjectCommand({ Bucket: env.S3_BUCKET, Key: key }));
  },
};

function cloudinarySign(params: Record<string, string>) {
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return crypto.createHash("sha1").update(toSign + env.CLOUDINARY_API_SECRET).digest("hex");
}

const cloudinary: Storage = {
  name: "cloudinary",
  async put(key, body, mime) {
    if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET)
      throw new Error("Cloudinary is not configured (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)");
    const publicId = `${env.CLOUDINARY_FOLDER}/${key.replace(/\.[^.]+$/, "")}`;
    const params = { public_id: publicId, timestamp: String(Math.floor(Date.now() / 1000)) };
    const form = new FormData();
    form.append("file", new Blob([new Uint8Array(body)], { type: mime }));
    form.append("api_key", env.CLOUDINARY_API_KEY);
    form.append("public_id", params.public_id);
    form.append("timestamp", params.timestamp);
    form.append("signature", cloudinarySign(params));
    const resource = mime === "application/pdf" ? "raw" : "image";
    const res = await fetch(`https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/${resource}/upload`, { method: "POST", body: form });
    const json = (await res.json()) as { secure_url?: string; public_id?: string; error?: { message: string } };
    if (!res.ok || !json.secure_url) throw new Error(`Cloudinary upload failed: ${json.error?.message ?? res.status}`);
    return { url: json.secure_url, key: `${resource}:${json.public_id}`, provider: "cloudinary" };
  },
  async remove(key) {
    const [resource, publicId] = key.includes(":") ? key.split(/:(.+)/) : ["image", key];
    const params = { public_id: publicId, timestamp: String(Math.floor(Date.now() / 1000)) };
    const form = new FormData();
    form.append("api_key", env.CLOUDINARY_API_KEY ?? "");
    form.append("public_id", params.public_id);
    form.append("timestamp", params.timestamp);
    form.append("signature", cloudinarySign(params));
    await fetch(`https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/${resource}/destroy`, { method: "POST", body: form });
  },
};

const providers: Record<string, Storage> = { local, s3, cloudinary };

export function getStorage(name: string = env.STORAGE_PROVIDER): Storage {
  return providers[name] ?? local;
}

export async function removeStored(provider: string, key: string) {
  await getStorage(provider).remove(key);
}
