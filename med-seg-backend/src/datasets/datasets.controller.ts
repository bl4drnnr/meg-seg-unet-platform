import {
  Controller,
  Get,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { DatasetsService } from '@datasets/datasets.service';
import { CreateDatasetDto } from '@datasets/dto/create-dataset.dto';
import { Dataset } from '@datasets/entities/dataset.entity';
import * as path from 'path';
import * as fs from 'fs';

@Controller('datasets')
export class DatasetsController {
  constructor(private readonly datasetsService: DatasetsService) {}

  @Get()
  async findAll(): Promise<Dataset[]> {
    return this.datasetsService.findAll();
  }

  @Post()
  async create(@Body() createDatasetDto: CreateDatasetDto): Promise<Dataset> {
    return this.datasetsService.create(createDatasetDto);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = path.join(process.cwd(), 'temp', 'uploads');
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `dataset-${uniqueSuffix}.zip`);
        }
      }),
      fileFilter: (req, file, cb) => {
        if (
          file.mimetype === 'application/zip' ||
          file.originalname.endsWith('.zip')
        ) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only ZIP files are allowed'), false);
        }
      }
    })
  )
  async uploadDataset(
    @UploadedFile() file: Express.Multer.File,
    @Body('name') name: string
  ): Promise<Dataset> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!name || name.trim().length === 0) {
      throw new BadRequestException('Dataset name is required');
    }

    return this.datasetsService.uploadDataset(file, name);
  }
}
