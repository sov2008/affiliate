import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import {
  S3Client,
  PutObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
} from '@aws-sdk/client-s3';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'core/.env') });

export interface UploadResult {
  url: string;
  storageType: 'r2' | 'local';
  bucket?: string;
  key: string;
  bytes: number;
}

export class StorageGateway {
  private static s3Client: S3Client | null = null;
  private static bucketInitialized = false;
  public static readonly DEFAULT_BUCKET = 'affiliate-creatives';

  private static getS3Client(): S3Client | null {
    if (!this.s3Client) {
      const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
      const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
      const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
      const endpoint = process.env.CLOUDFLARE_R2_ENDPOINT || (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined);

      if (accessKeyId && secretAccessKey && endpoint) {
        this.s3Client = new S3Client({
          region: 'auto',
          endpoint,
          credentials: {
            accessKeyId,
            secretAccessKey,
          },
        });
      }
    }
    return this.s3Client;
  }

  /**
   * Ensures the target R2 bucket exists; creates it automatically if missing.
   */
  private static async ensureBucket(bucketName: string, s3: S3Client): Promise<void> {
    if (this.bucketInitialized) return;
    try {
      await s3.send(new HeadBucketCommand({ Bucket: bucketName }));
      this.bucketInitialized = true;
    } catch (err: any) {
      if (err?.$metadata?.httpStatusCode === 404 || err?.name === 'NotFound') {
        console.log(`[StorageGateway] Bucket "${bucketName}" not found. Creating bucket on Cloudflare R2...`);
        try {
          await s3.send(new CreateBucketCommand({ Bucket: bucketName }));
          this.bucketInitialized = true;
          console.log(`[StorageGateway] ✅ Bucket "${bucketName}" successfully created.`);
        } catch (createErr: any) {
          console.warn(`[StorageGateway] Could not auto-create bucket: ${createErr.message}`);
        }
      } else {
        this.bucketInitialized = true;
      }
    }
  }

  /**
   * Uploads creative asset to Cloudflare R2 with automatic fallback to local disk.
   */
  public static async uploadCreative(
    buffer: Buffer,
    filename: string,
    contentType: string = 'image/jpeg',
    bucketName: string = this.DEFAULT_BUCKET
  ): Promise<UploadResult> {
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `creatives/${new Date().toISOString().slice(0, 10)}/${Date.now()}_${sanitizedFilename}`;
    const s3 = this.getS3Client();

    // 1. Try Cloudflare R2 Upload
    if (s3) {
      try {
        await this.ensureBucket(bucketName, s3);

        await s3.send(
          new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: buffer,
            ContentType: contentType,
          })
        );

        const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
        const publicDomain = process.env.CLOUDFLARE_R2_PUBLIC_DOMAIN;
        
        let publicUrl = '';
        if (publicDomain) {
          publicUrl = `${publicDomain.replace(/\/$/, '')}/${key}`;
        } else {
          publicUrl = `https://${accountId}.r2.cloudflarestorage.com/${bucketName}/${key}`;
        }

        console.log(`[StorageGateway] ✅ Successfully uploaded ${buffer.byteLength} bytes to Cloudflare R2 [${bucketName}/${key}]`);
        return {
          url: publicUrl,
          storageType: 'r2',
          bucket: bucketName,
          key,
          bytes: buffer.byteLength,
        };
      } catch (err: any) {
        console.warn(`[StorageGateway] R2 upload failed (${err.message}). Falling back to local disk storage...`);
      }
    }

    // 2. Fallback: Local Disk Storage
    return this.saveToLocalDisk(buffer, sanitizedFilename);
  }

  /**
   * Local storage fallback writes to ./output/creatives/
   */
  public static async saveToLocalDisk(buffer: Buffer, filename: string): Promise<UploadResult> {
    const outDir = path.resolve(process.cwd(), 'output/creatives');
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    const timestamp = Date.now();
    const diskFilename = `${timestamp}_${filename}`;
    const fullPath = path.join(outDir, diskFilename);

    fs.writeFileSync(fullPath, buffer);
    const relativeUrl = `/output/creatives/${diskFilename}`;

    console.log(`[StorageGateway] 💾 Saved creative to local disk: ${fullPath} (${buffer.byteLength} bytes)`);
    return {
      url: relativeUrl,
      storageType: 'local',
      key: diskFilename,
      bytes: buffer.byteLength,
    };
  }
}
