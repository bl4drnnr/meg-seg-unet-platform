import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Dataset } from '@datasets/entities/dataset.entity';
import { DatasetsModule } from '@datasets/datasets.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'medseg.db',
      entities: [Dataset],
      synchronize: true
    }),
    DatasetsModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
