import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { JobType } from '../enums/job-type.enum';
import { UsersEntity } from 'src/users/entitites/users.entity';

@Entity({ name: 'evaluations' })
export class EvaluationsEntity {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Evaluation UUID', type: String })
  id: string;

  @Column({ type: 'varchar', length: 255 })
  @ApiProperty({ description: 'Job title', type: String })
  jobTitle: string;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({ description: 'Job description', type: String })
  description: string;

  @Column({ type: 'enum', enum: JobType, default: JobType.FULL_TIME })
  @ApiProperty({ description: 'Job type', enum: JobType })
  jobType: JobType;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({ description: 'Required education', type: String })
  requiredEducation: string;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({ description: 'Required experience', type: String })
  requiredExperience: string;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({
    description: 'Key skills and responsibilities',
    type: String,
  })
  keySkillsAndResponsibilities: string;

  @CreateDateColumn()
  @ApiProperty({ description: 'Created at', type: Date })
  created_at: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'Updated at', type: Date })
  updated_at: Date;

  @ManyToOne(() => UsersEntity, (user) => user.evaluations, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: UsersEntity;

  @Column({ name: 'user_id', type: 'char', length: 36 })
  user_id: string;
}
