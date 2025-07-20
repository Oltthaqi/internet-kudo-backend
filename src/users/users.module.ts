import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from './entitites/users.entity';
import { VerificationEntity } from './entitites/verification.entity';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { UsersService } from './users.service';
import { EvaluationsEntity } from 'src/evaluations/entities/evaluation.entity';
@Module({
  imports: [
    HttpModule.register({
      maxRedirects: 5,
    }),
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([UsersEntity, VerificationEntity]),
    EvaluationsEntity,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
