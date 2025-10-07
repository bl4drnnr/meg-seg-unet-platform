import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dataset } from '@datasets/entities/dataset.entity';
import { CreateDatasetDto } from '@datasets/dto/create-dataset.dto';
import { S3Service } from '@shared/services/s3.service';
import { FileValidationService } from '@shared/services/file-validation.service';
import { ApiConfigService } from '@shared/services/api-config.service';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class DatasetsService {
  constructor(
    @InjectRepository(Dataset)
    private datasetsRepository: Repository<Dataset>,
    private s3Service: S3Service,
    private fileValidationService: FileValidationService,
    private apiConfigService: ApiConfigService
  ) {}

  async findAll(): Promise<Dataset[]> {
    return this.datasetsRepository.find({
      order: {
        uploadedAt: 'DESC'
      }
    });
  }

  async create(createDatasetDto: CreateDatasetDto): Promise<Dataset> {
    const dataset = this.datasetsRepository.create(createDatasetDto);
    return this.datasetsRepository.save(dataset);
  }

  async uploadDataset(
    file: Express.Multer.File,
    datasetName: string
  ): Promise<Dataset> {
    const tempDir = path.join(process.cwd(), 'temp');
    const uploadId = uuidv4();
    const extractPath = path.join(tempDir, uploadId);

    // Create initial database record
    let dataset = await this.create({
      name: datasetName,
      s3Bucket: this.apiConfigService.awsS3BucketName,
      s3Key: `datasets/${uploadId}`,
      fileCount: 0,
      totalSizeMb: 0,
      status: 'uploading'
    });

    try {
      // Ensure temp directory exists
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // Validate file size
      this.fileValidationService.validateFileSize(file.path);

      // Extract ZIP
      this.fileValidationService.extractZip(file.path, extractPath);

      // Validate structure
      const { imagesDir, masksDir } =
        this.fileValidationService.validateZipStructure(extractPath);

      // Validate contents
      const { fileCount } = this.fileValidationService.validateDatasetContents(
        imagesDir,
        masksDir
      );

      // Calculate total size
      const totalSizeBytes =
        this.s3Service.calculateDirectorySize(imagesDir) +
        this.s3Service.calculateDirectorySize(masksDir);
      const totalSizeMb = totalSizeBytes / (1024 * 1024);

      // Upload to S3
      const s3KeyPrefix = `datasets/${uploadId}`;
      await this.s3Service.uploadDirectory(imagesDir, `${s3KeyPrefix}/images`);
      await this.s3Service.uploadDirectory(masksDir, `${s3KeyPrefix}/masks`);

      // Update database record
      dataset.fileCount = fileCount;
      dataset.totalSizeMb = parseFloat(totalSizeMb.toFixed(2));
      dataset.status = 'ready';
      dataset = await this.datasetsRepository.save(dataset);

      return dataset;
    } catch (error) {
      // Mark as error in database
      dataset.status = 'error';
      await this.datasetsRepository.save(dataset);

      throw error;
    } finally {
      // Cleanup: remove temp files
      this.fileValidationService.cleanupDirectory(extractPath);
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    }
  }

  async updateStatus(
    id: number,
    status: 'uploading' | 'ready' | 'error'
  ): Promise<Dataset> {
    const dataset = await this.datasetsRepository.findOne({ where: { id } });
    if (!dataset) {
      throw new Error('Dataset not found');
    }
    dataset.status = status;
    return this.datasetsRepository.save(dataset);
  }
}
