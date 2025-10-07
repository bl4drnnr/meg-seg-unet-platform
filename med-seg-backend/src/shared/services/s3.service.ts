import { Injectable } from '@nestjs/common';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import * as fs from 'fs';
import * as path from 'path';
import { UploadException } from '@common/exceptions/upload.exception';
import { ApiConfigService } from '@shared/services/api-config.service';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(private apiConfigService: ApiConfigService) {
    this.s3Client = new S3Client({
      region: this.apiConfigService.awsRegion,
      credentials: {
        accessKeyId: this.apiConfigService.awsAccessKeyId,
        secretAccessKey: this.apiConfigService.awsSecretAccessKey
      }
    });
    this.bucketName = this.apiConfigService.awsS3BucketName;
  }

  async uploadFile(filePath: string, s3Key: string): Promise<void> {
    try {
      const fileStream = fs.createReadStream(filePath);
      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: this.bucketName,
          Key: s3Key,
          Body: fileStream
        }
      });

      await upload.done();
    } catch (error) {
      throw new UploadException(`Failed to upload file to S3: ${error.message}`);
    }
  }

  async uploadDirectory(localDir: string, s3Prefix: string): Promise<number> {
    const files = fs.readdirSync(localDir);
    let uploadedCount = 0;

    for (const file of files) {
      const filePath = path.join(localDir, file);
      const stat = fs.statSync(filePath);

      if (stat.isFile()) {
        const s3Key = `${s3Prefix}/${file}`;
        await this.uploadFile(filePath, s3Key);
        uploadedCount++;
      }
    }

    return uploadedCount;
  }

  async deleteDirectory(s3Prefix: string): Promise<void> {
    // For now, we'll implement a basic delete
    // In production, you'd want to list all objects and delete them
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: s3Prefix
      });
      await this.s3Client.send(command);
    } catch (error) {
      console.error(`Failed to delete from S3: ${error.message}`);
    }
  }

  calculateDirectorySize(dirPath: string): number {
    let totalSize = 0;
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);

      if (stat.isFile()) {
        totalSize += stat.size;
      } else if (stat.isDirectory()) {
        totalSize += this.calculateDirectorySize(filePath);
      }
    }

    return totalSize;
  }
}
