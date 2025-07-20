import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CompaniesEntity } from './entitites/companies.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import PagableParamsDto from 'src/common/dto/pagable-params.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(CompaniesEntity)
    private readonly companiesRepository: Repository<CompaniesEntity>,
    private readonly userService: UsersService,
  ) {}

  async create(createCompanyDto: CreateCompanyDto): Promise<CompaniesEntity> {
    if (!createCompanyDto?.user_id) {
      throw new BadRequestException('user_id is required');
    }
    const user = await this.userService.getMainDataByUserId(
      createCompanyDto.user_id,
    );
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const company = this.companiesRepository.create({
      ...createCompanyDto,
      user,
    });
    return await this.companiesRepository.save(company);
  }

  async findAll(params: PagableParamsDto): Promise<{
    data: CompaniesEntity[];
    total: number;
  }> {
    const { page, limit, search } = params;
    const [data, total] = await this.companiesRepository.findAndCount({
      where: {
        is_deleted: false,
        ...(search ? { name: Like(`%${search}%`) } : {}),
      },
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });
    return { data, total };
  }

  async findAllInvites(company_id: string): Promise<CompaniesEntity> {
    await this.findOne(company_id);
    const data = await this.companiesRepository.findOne({
      where: {
        id: company_id,
        is_deleted: false,
      },
      relations: ['invites'],
      order: { created_at: 'DESC' },
    });
    if (!data) {
      throw new NotFoundException('Company not found');
    }
    return data;
  }

  async findOne(id: string): Promise<CompaniesEntity> {
    const company = await this.companiesRepository.findOne({
      where: {
        id,
        is_deleted: false,
      },
    });
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    return company;
  }

  async update(
    id: string,
    updateCompanyDto: UpdateCompanyDto,
  ): Promise<CompaniesEntity | null> {
    await this.findOne(id);

    // Update company details
    await this.companiesRepository.update(id, {
      ...updateCompanyDto,
    });
    return await this.findOne(id);
  }

  async remove(id: string): Promise<boolean> {
    await this.findOne(id); // ensure company exists

    // Soft delete the company
    const result = await this.companiesRepository.update(
      { id, is_deleted: false },
      { is_deleted: true },
    );

    if (result.affected === 0) {
      throw new BadRequestException(`Failed to delete company`);
    }

    return true;
  }
}
