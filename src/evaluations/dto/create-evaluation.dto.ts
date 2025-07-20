import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { JobType } from '../enums/job-type.enum';

export class CreateEvaluationDto {
  @ApiProperty({ description: 'Job title', type: String })
  @IsString()
  jobTitle: string;

  @ApiProperty({
    description: 'Job description',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Job type',
    enum: JobType,
    default: JobType.FULL_TIME,
  })
  @IsEnum(JobType)
  jobType: JobType;

  @ApiProperty({
    description: 'Required education',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  requiredEducation: string;

  @ApiProperty({
    description: 'Required experience',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  requiredExperience: string;

  @ApiProperty({
    description: 'Key skills and responsibilities',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  keySkillsAndResponsibilities: string;

  @IsString()
  @ApiProperty({
    description: 'User ID of the creator',
    type: String,
  })
  user_id: string;
}
