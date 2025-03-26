import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import { r2 } from "../../../lib/cloudflare";
import { StorageProvider } from "../storage-provider";

export class R2StorageProvider implements StorageProvider {
  private bucket = 'sintonia';

  async upload({ fileName, fileType, buffer }: {
    fileName: string;
    fileType: string;
    buffer: Buffer;
  }) {
    const fileKey = randomUUID().concat('-').concat(fileName);

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: fileKey,
      Body: buffer,
      ContentType: fileType,
    });

    await r2.send(command);

    const url = await this.getUrl(fileKey);

    return { url, key: fileKey };
  }

  async getUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const signedUrl = await getSignedUrl(r2, command, { expiresIn: 10 });
    return signedUrl;
  }
}