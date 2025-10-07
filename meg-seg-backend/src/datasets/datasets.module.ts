import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatasetsController } from '@datasets/datasets.controller';
import { DatasetsService } from '@datasets/datasets.service';
import { Dataset } from '@datasets/entities/dataset.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Dataset])],
  controllers: [DatasetsController],
  providers: [DatasetsService],
  exports: [DatasetsService]
})
export class DatasetsModule {}
