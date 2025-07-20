import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { EvaluationsService } from './evaluations.service';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { UpdateEvaluationDto } from './dto/update-evaluation.dto';
import PagableParamsDto from 'src/common/dto/pagable-params.dto';
import { EvaluationsEntity } from './entities/evaluation.entity';

@Controller('evaluations')
export class EvaluationsController {
  constructor(private readonly evaluationsService: EvaluationsService) {}

  @Post()
  create(
    @Body() createEvaluationDto: CreateEvaluationDto,
  ): Promise<EvaluationsEntity> {
    return this.evaluationsService.create(createEvaluationDto);
  }

  @Get()
  findAll(
    @Query() pagableParams: PagableParamsDto,
  ): Promise<[data: EvaluationsEntity[], total: number]> {
    return this.evaluationsService.findAll(pagableParams);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.evaluationsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEvaluationDto: UpdateEvaluationDto,
  ) {
    return this.evaluationsService.update(id, updateEvaluationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.evaluationsService.remove(id);
  }
}
