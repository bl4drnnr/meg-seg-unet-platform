export class CreateDatasetDto {
  name: string;
  s3Bucket: string;
  s3Key: string;
  fileCount: number;
  totalSizeMb: number;
  status?: 'uploaded' | 'ready' | 'error';
}
