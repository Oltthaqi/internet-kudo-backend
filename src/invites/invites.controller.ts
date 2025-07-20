import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { InvitesService } from './invites.service';
import { CreateInviteDto } from './dto/create-invite.dto';
import { InvitesEntity } from './entities/invite.entity';
import PagableParamsDto from 'src/common/dto/pagable-params.dto';
import { Response } from 'express';
import { ApiBody } from '@nestjs/swagger';
import { JwtRolesGuard } from 'src/auth/utils/jwt‑roles.guard';
import { Roles } from 'src/auth/utils/roles.decorator';
import { Role } from 'src/users/enums/role.enum';

@UseGuards(JwtRolesGuard)
@Controller('invites')
export class InvitesController {
  constructor(private readonly invitesService: InvitesService) {}

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post('/user/:user_id')
  async create(
    @Param('user_id') user_id: string,
    @Body() createInviteDto: CreateInviteDto,
  ): Promise<InvitesEntity> {
    return await this.invitesService.create(createInviteDto, user_id);
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.USER)
  @Get('verify')
  async verify(
    @Query('invite_id') inviteId: string,
    @Res() res: Response,
  ): Promise<void> {
    await this.invitesService.verify(inviteId);
    const link = await this.invitesService.redirectUser(inviteId);

    return res.redirect(`${link}`);
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.USER)
  @Patch('accept-invite')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          example: '',
        },
      },
      required: ['id'],
    },
  })
  async acceptInvite(@Body('id') id: string): Promise<InvitesEntity> {
    return await this.invitesService.acceptInvite(id);
  }
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get(':user_id')
  async findAllByUserId(
    @Param('user_id') user_id: string,
    @Query() params: PagableParamsDto,
  ): Promise<{ data: InvitesEntity[]; total: number }> {
    return await this.invitesService.findInvitesByUserId(user_id, params);
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<InvitesEntity> {
    return await this.invitesService.findOne(id);
  }

  // @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  // @Get(':company_id')
  // async findAll(@Query() params: PagableParamsDto): Promise<{
  //   data: (InvitesEntity & { user_name?: string })[];
  //   total: number;
  // }> {
  //   return await this.invitesService.findAll(params);
  // }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<boolean> {
    return await this.invitesService.deleteOne(id);
  }
}
