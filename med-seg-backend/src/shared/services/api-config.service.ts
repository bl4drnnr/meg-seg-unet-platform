import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiConfigService {
  constructor(private configService: ConfigService) {}

  get apiPort(): number {
    return this.configService.get<number>('API_PORT', 4201);
  }

  get awsAccessKeyId(): string {
    return this.configService.get<string>('AWS_ACCESS_KEY_ID');
  }

  get awsSecretAccessKey(): string {
    return this.configService.get<string>('AWS_SECRET_ACCESS_KEY');
  }

  get awsRegion(): string {
    return this.configService.get<string>('AWS_REGION', 'us-east-1');
  }

  get awsS3BucketName(): string {
    return this.configService.get<string>('AWS_S3_NAME');
  }

  get awsS3BucketUrl(): string {
    return this.configService.get<string>('AWS_S3_BUCKET_URL');
  }

  get nodeEnv(): string {
    return this.configService.get<string>('NODE_ENV', 'development');
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }
}
