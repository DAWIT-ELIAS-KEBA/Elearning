import {
  Injectable,
  Inject,
  OnModuleInit,
  Logger,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as Minio from 'minio';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private readonly bucketName: string;
  private readonly minioClient: Minio.Client;

  constructor(private readonly configService: ConfigService) {
    // Read environment variables for MinIO
    const endPoint = this.configService.get<string>('MINIO_ENDPOINT') || 'minio1';
    const port = Number(this.configService.get<number>('MINIO_PORT') || 9000);
    const accessKey = this.configService.get<string>('MINIO_ACCESS_KEY') || 'minioadmin';
    const secretKey = this.configService.get<string>('MINIO_SECRET_KEY') || 'minioadmin';
    this.bucketName = this.configService.get<string>('MINIO_BUCKET_NAME') || 'elearning';

    this.minioClient = new Minio.Client({
      endPoint,
      port,
      useSSL: false,
      accessKey,
      secretKey,
    });
  }

  async onModuleInit() {
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
        this.logger.log(`Bucket '${this.bucketName}' created successfully.`);
      } else {
        this.logger.log(`Bucket '${this.bucketName}' already exists.`);
      }
    } catch (error: any) {
      this.logger.warn(
        `Could not initialize MinIO bucket '${this.bucketName}': ${error.message}`,
      );
      // Don't throw here; app can continue. Optionally retry later.
    }
  }

  async uploadFile(
    objectName: string,
    fileBuffer: Buffer,
    metaData?: Minio.ItemBucketMetadata,
  ): Promise<{ etag: string; versionId: string | null }> {
    try {
      return await this.minioClient.putObject(
        this.bucketName,
        objectName,
        fileBuffer,
        fileBuffer.length,
        metaData,
      );
    } catch (error: any) {
      this.logger.error(`Failed to upload file '${objectName}': ${error.message}`);
      throw new InternalServerErrorException(`Failed to upload file: ${error.message}`);
    }
  }

  async getFile(objectName: string): Promise<NodeJS.ReadableStream> {
    try {
      return await this.minioClient.getObject(this.bucketName, objectName);
    } catch (error: any) {
      if (error.code === 'NoSuchKey') {
        throw new NotFoundException(`File '${objectName}' not found in MinIO.`);
      }
      throw new InternalServerErrorException(`Failed to retrieve file: ${error.message}`);
    }
  }

  async deleteFile(objectName: string): Promise<void> {
    try {
      await this.minioClient.removeObject(this.bucketName, objectName);
      this.logger.log(`File '${objectName}' deleted successfully.`);
    } catch (error: any) {
      throw new InternalServerErrorException(`Failed to delete file: ${error.message}`);
    }
  }

  async deleteMultipleFiles(objectNames: string[]): Promise<void> {
    if (!objectNames.length) return;
    try {
      await this.minioClient.removeObjects(this.bucketName, objectNames);
      this.logger.log(`Files ${objectNames.join(', ')} deleted successfully.`);
    } catch (error: any) {
      throw new InternalServerErrorException(`Failed to delete files: ${error.message}`);
    }
  }

  async getPresignedUrl(objectName: string, expirySeconds = 60 * 60 * 24 * 7): Promise<string> {
    try {
      return await this.minioClient.presignedGetObject(
        this.bucketName,
        objectName,
        expirySeconds,
      );
    } catch (error: any) {
      if (error.code === 'NoSuchKey') {
        throw new NotFoundException(`File '${objectName}' not found for URL generation.`);
      }
      throw new InternalServerErrorException(`Failed to generate presigned URL: ${error.message}`);
    }
  }

  async getFileBuffer(objectName: string): Promise<Buffer> {
    const stream = await this.getFile(objectName);
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }

  async getFileAsBase64(objectName: string): Promise<string> {
    const buffer = await this.getFileBuffer(objectName);
    let mimeType = 'application/octet-stream';
    try {
      const meta = await this.minioClient.statObject(this.bucketName, objectName);
      if (meta && meta.metaData && meta.metaData['content-type']) {
        mimeType = meta.metaData['content-type'];
      }
    } catch {}
    return `data:${mimeType};base64,${buffer.toString('base64')}`;
  }
}
