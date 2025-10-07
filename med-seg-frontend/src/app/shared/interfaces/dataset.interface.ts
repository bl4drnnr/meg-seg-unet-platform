export interface Dataset {
  id: number;
  name: string;
  s3Bucket: string;
  s3Key: string;
  uploadedAt: Date;
  fileCount: number;
  totalSizeMb: number;
  status: 'uploading' | 'ready' | 'error';
}
