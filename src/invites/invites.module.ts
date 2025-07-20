import { forwardRef, Module } from '@nestjs/common';
import { InvitesService } from './invites.service';
import { InvitesController } from './invites.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvitesEntity } from './entities/invite.entity';
import { EmailModule } from 'src/email/email.module';
import { UsersModule } from 'src/users/users.module';
import { CompaniesModule } from 'src/companies/companies.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([InvitesEntity]),
    EmailModule,
    UsersModule,
    CompaniesModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [InvitesController],
  providers: [InvitesService],
  exports: [InvitesService],
})
export class InvitesModule {}
