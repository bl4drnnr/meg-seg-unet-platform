import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatasetsController } from '@datasets/datasets.controller';
import { DatasetsService } from '@datasets/datasets.service';
import { Dataset } from '@datasets/entities/dataset.entity';
import { SharedModule } from '@shared/shared.module';

@Module({
  imports: [TypeOrmModule.forFeature([Dataset]), SharedModule],
  controllers: [DatasetsController],
  providers: [DatasetsService],
  exports: [DatasetsService]
})
export class DatasetsModule {}
