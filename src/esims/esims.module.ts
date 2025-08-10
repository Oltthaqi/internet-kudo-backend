import { Module } from '@nestjs/common';
import { EsimsService } from './esims.service';
import { EsimsController } from './esims.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Esim } from './entities/esim.entity';
import { OcsModule } from 'src/ocs/ocs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Esim]),
    OcsModule, // so EsimsService can use OcsService
  ],
  controllers: [EsimsController],
  providers: [EsimsService],
  exports: [EsimsService],
})
export class EsimsModule {}
