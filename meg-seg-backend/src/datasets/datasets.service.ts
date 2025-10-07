import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dataset } from '@datasets/entities/dataset.entity';
import { CreateDatasetDto } from '@datasets/dto/create-dataset.dto';

@Injectable()
export class DatasetsService {
  constructor(
    @InjectRepository(Dataset)
    private datasetsRepository: Repository<Dataset>
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
}
