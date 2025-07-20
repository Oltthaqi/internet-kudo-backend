import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { CompaniesEntity } from './entitites/companies.entity';
import { UpdateCompanyDto } from './dto/update-company.dto';
import PagableParamsDto from 'src/common/dto/pagable-params.dto';
import { JwtRolesGuard } from 'src/auth/utils/jwt‑roles.guard';
import { Roles } from 'src/auth/utils/roles.decorator';
import { Role } from 'src/users/enums/role.enum';

@Controller('companies')
@UseGuards(JwtRolesGuard)
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post()
  async create(
    @Body() createCompanyDto: CreateCompanyDto,
  ): Promise<CompaniesEntity> {
    return await this.companiesService.create(createCompanyDto);
  }

  @Roles(Role.SUPER_ADMIN)
  @Get()
  async findAll(
    @Query() params: PagableParamsDto,
  ): Promise<{ data: CompaniesEntity[]; total: number }> {
    return await this.companiesService.findAll(params);
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get('/company-invites/:company_id')
  async findAllInvites(
    @Param('company_id') company_id: string,
  ): Promise<CompaniesEntity> {
    return await this.companiesService.findAllInvites(company_id);
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.companiesService.findOne(id);
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ): Promise<CompaniesEntity | null> {
    return await this.companiesService.update(id, updateCompanyDto);
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<boolean> {
    return await this.companiesService.remove(id);
  }
}
