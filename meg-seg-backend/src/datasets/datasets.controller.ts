import { Controller, Get, Post, Body } from '@nestjs/common';
import { DatasetsService } from '@datasets/datasets.service';
import { CreateDatasetDto } from '@datasets/dto/create-dataset.dto';
import { Dataset } from '@datasets/entities/dataset.entity';

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
}
