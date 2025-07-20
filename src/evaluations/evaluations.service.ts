import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { UpdateEvaluationDto } from './dto/update-evaluation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EvaluationsEntity } from './entities/evaluation.entity';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import PagableParamsDto from 'src/common/dto/pagable-params.dto';

@Injectable()
export class EvaluationsService {
  constructor(
    @InjectRepository(EvaluationsEntity)
    private readonly evaluationsRepository: Repository<EvaluationsEntity>,
    private readonly userService: UsersService,
  ) {}
  async create(
    createEvaluationDto: CreateEvaluationDto,
  ): Promise<EvaluationsEntity> {
    if (!createEvaluationDto.user_id) {
      throw new BadRequestException('User ID is required');
    }
    const user = await this.userService.getMainDataByUserId(
      createEvaluationDto.user_id,
    );
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const evaluation = this.evaluationsRepository.create({
      ...createEvaluationDto,
      user,
    });
    return await this.evaluationsRepository.save(evaluation);
  }

  findAll(
    pagableParams: PagableParamsDto,
  ): Promise<[data: EvaluationsEntity[], total: number]> {
    const { page, limit } = pagableParams;
    return this.evaluationsRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<EvaluationsEntity> {
    const evaluation = await this.evaluationsRepository.findOne({
      where: { id },
    });
    if (!evaluation) {
      throw new NotFoundException(`Evaluation with ID ${id} not found`);
    }
    return evaluation;
  }

  async update(
    id: string,
    updateEvaluationDto: UpdateEvaluationDto,
  ): Promise<EvaluationsEntity> {
    const evaluation = await this.findOne(id);
    if (!evaluation) {
      throw new NotFoundException(`Evaluation with ID ${id} not found`);
    }
    await this.evaluationsRepository.update(id, {
      ...updateEvaluationDto,
    });
    return await this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const evaluation = await this.findOne(id);
    if (!evaluation) {
      throw new NotFoundException(`Evaluation with ID ${id} not found`);
    }
    await this.evaluationsRepository.remove(evaluation);
  }
}
