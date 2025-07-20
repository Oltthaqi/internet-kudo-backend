import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateInviteDto } from './dto/create-invite.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { InvitesEntity } from './entities/invite.entity';
import { Like, Repository } from 'typeorm';
import { EmailService } from 'src/email/email.service';
import PagableParamsDto from 'src/common/dto/pagable-params.dto';
import { UsersService } from 'src/users/users.service';
import { CompaniesService } from 'src/companies/companies.service';
import { Status } from 'src/common/enums/status.enum';
import { Role } from 'src/users/enums/role.enum';

@Injectable()
export class InvitesService {
  constructor(
    @InjectRepository(InvitesEntity)
    private readonly inviteRepository: Repository<InvitesEntity>,
    private readonly emailService: EmailService,
    private readonly userService: UsersService,
    private readonly companyService: CompaniesService,
  ) {}
  async create(
    createInviteDto: CreateInviteDto,
    user_id: string,
  ): Promise<InvitesEntity> {
    const now = new Date();
    const existingInvite = await this.inviteRepository.findOne({
      where: {
        email: createInviteDto.email,
        is_deleted: false,
        accepted: true,
      },
    });
    if (existingInvite) {
      throw new BadRequestException('User is already part of the company');
    }
    const user = await this.userService.getUserById(user_id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let role: Role;
    if (user.role === Role.SUPER_ADMIN) {
      role = Role.ADMIN;
    } else if (user.role === Role.ADMIN) {
      role = Role.USER;
    } else {
      throw new BadRequestException(
        'User does not have permission to create invites',
      );
    }

    const invite = this.inviteRepository.create({
      ...createInviteDto,
      expires_at: new Date(now.getTime() + 48 * 60 * 60 * 1000),
      user_id,
      role,
    });
    await this.inviteRepository.save(invite);
    if (!invite) {
      throw new BadRequestException('Failed to create invite');
    }
    const verifyTokenLink = `${process.env.URL}/api/invites/verify?invite_id=${invite.id}`;

    await this.emailService.sendInviteEmail(
      {
        to: invite.email,
        subject: `You have been invited to join `,
        body: '',
      },
      verifyTokenLink,
      '',
    );
    return invite;
  }

  async findAll(params: PagableParamsDto): Promise<{
    data: (InvitesEntity & { user_name?: string })[];
    total: number;
  }> {
    const { page, limit, search, status } = params;

    const [inviteEntities, total] = await this.inviteRepository.findAndCount({
      where: {
        is_deleted: false,
        ...(search ? { email: Like(`%${search}%`) } : {}),
        ...(status === Status.ACTIVE
          ? { accepted: true }
          : status === Status.INACTIVE
            ? { accepted: false }
            : {}),
      },
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });

    const emails = inviteEntities.map((inv) => inv.email);
    const users = await this.userService.getUsersByEmail(emails);
    const userNameMap = new Map(
      (users ?? []).map((u) => [u.email, u.first_name] as [string, string]),
    );

    const data = inviteEntities.map((inv) => ({
      ...inv,
      user_name: userNameMap.get(inv.email),
    }));

    return { data, total };
  }

  async findOne(id: string): Promise<InvitesEntity> {
    const invite = await this.inviteRepository.findOne({
      where: { id, is_deleted: false },
    });
    if (!invite) {
      throw new NotFoundException('Invite not found');
    }
    return invite;
  }

  async findInviteByEmail(email: string): Promise<InvitesEntity> {
    const invite = await this.inviteRepository.findOne({
      where: { email, is_deleted: false },
      relations: ['user'],
    });
    if (!invite) {
      throw new NotFoundException('Invite not found');
    }
    return invite;
  }

  async deleteOne(id: string): Promise<boolean> {
    await this.findOne(id);
    const result = await this.inviteRepository.update(
      { id, is_deleted: false },
      { is_deleted: true },
    );
    if (result.affected === 0) {
      throw new BadRequestException(`Failed to delete invite`);
    }
    return true;
  }
  async verify(id: string): Promise<boolean> {
    const invite = await this.inviteRepository.findOne({
      where: { id, is_deleted: false },
    });

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }
    if (invite.expires_at < new Date()) {
      throw new BadRequestException('Invite expired');
    }
    if (invite.accepted) {
      throw new BadRequestException('Invite already accepted');
    }
    return true;
  }

  async acceptInvite(id: string): Promise<InvitesEntity> {
    const result = await this.inviteRepository.update(
      { id, is_deleted: false },
      { accepted: true },
    );

    if (result.affected === 0) {
      throw new NotFoundException('Invite not found');
    }
    const invite = await this.inviteRepository.findOne({
      where: { id, is_deleted: false },
    });
    if (!invite) {
      throw new NotFoundException('Invite not found');
    }
    return invite;
  }

  async redirectUser(id: string): Promise<string> {
    const invite = await this.inviteRepository.findOne({
      where: { id, is_deleted: false },
    });
    if (!invite) {
      throw new NotFoundException('Invite not found');
    }
    let inviteLink = '';
    const existingUser = await this.userService.getUserByEmail(invite.email);

    if (existingUser) {
      inviteLink = `${process.env.URL}/auth/login?invite_id=${invite.id}`;
    } else {
      inviteLink = `${process.env.URL}/auth/register?invite_id=${invite.id}`;
    }
    return inviteLink;
  }

  async findInvitesByUserId(
    user_id: string,
    pagableParams: PagableParamsDto,
  ): Promise<{ data: InvitesEntity[]; total: number }> {
    const { page, limit, search } = pagableParams;
    const [data, total] = await this.inviteRepository.findAndCount({
      where: { user_id, is_deleted: false },
      ...(search ? { email: Like(`%${search}%`) } : {}),
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }
}
