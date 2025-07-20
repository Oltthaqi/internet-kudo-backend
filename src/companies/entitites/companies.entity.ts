import { ApiProperty } from '@nestjs/swagger';
import { UsersEntity } from 'src/users/entitites/users.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'companies' })
export class CompaniesEntity {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({
    description: 'User UUID',
    type: String,
  })
  id: string;

  @ManyToOne(() => UsersEntity, (user) => user.companies, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: UsersEntity;

  @Column({ name: 'user_id', type: 'char', length: 36 })
  user_id: string;

  @Column({ type: 'varchar', nullable: false, default: null, unique: true })
  @ApiProperty({
    description: 'The name',
    type: String,
  })
  name: string;

  @Column({ type: 'varchar', nullable: false, default: null, unique: true })
  @ApiProperty({
    description: 'The information',
    type: String,
  })
  information: string;

  @Column({ type: 'json', nullable: true })
  locations: string[];

  @Column({ type: 'varchar', nullable: false, default: null, unique: true })
  @ApiProperty({
    description: 'The phone_number',
    type: String,
  })
  phone_number: string;

  @CreateDateColumn()
  @ApiProperty({ description: 'Created at', type: Date })
  created_at: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'Updated at', type: Date })
  updated_at: Date;

  @Column({ type: 'boolean', nullable: false, default: false })
  @ApiProperty({
    description: 'The is deleted',
    type: Boolean,
  })
  is_deleted: boolean;
}
