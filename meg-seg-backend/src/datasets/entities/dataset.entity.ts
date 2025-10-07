import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('datasets')
export class Dataset {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ name: 's3_bucket' })
  s3Bucket: string;

  @Column({ name: 's3_key' })
  s3Key: string;

  @CreateDateColumn({ name: 'uploaded_at' })
  uploadedAt: Date;

  @Column({ name: 'file_count' })
  fileCount: number;

  @Column('real', { name: 'total_size_mb' })
  totalSizeMb: number;

  @Column({ default: 'uploaded' })
  status: 'uploaded' | 'ready' | 'error';
}
