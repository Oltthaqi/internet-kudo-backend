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
import { Role } from 'src/users/enums/role.enum';
import { UsersEntity } from 'src/users/entitites/users.entity';

@Entity({ name: 'invites' })
export class InvitesEntity {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({
    description: 'Invite UUID',
    type: String,
  })
  id: string;

  @Column({ type: 'varchar', nullable: true, default: null })
  @ApiProperty({
    description: 'The email of the invitee',
    type: String,
  })
  email: string;

  @Column({ type: 'boolean', nullable: true, default: false })
  @ApiProperty({
    description: 'The acceptance status of the invite',
    type: Boolean,
  })
  accepted: boolean;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  @ApiProperty({
    description: 'Role assigned with the invite',
    enum: Role,
  })
  role: Role;

  @Column({ type: 'timestamp', nullable: true, default: null })
  @ApiProperty({ description: 'Expiration time for the invite', type: Date })
  expires_at: Date;

  @Column({ type: 'boolean', nullable: true, default: false })
  @ApiProperty({
    description: 'Soft delete flag',
    type: Boolean,
  })
  is_deleted: boolean;

  @CreateDateColumn()
  @ApiProperty({ description: 'Created at', type: Date })
  created_at: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'Updated at', type: Date })
  updated_at: Date;

  @ManyToOne(() => UsersEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: UsersEntity;

  @Column({ name: 'user_id', type: 'char', length: 36, nullable: true })
  @ApiProperty({
    description: 'The user who sent the invite',
    type: String,
  })
  user_id: string;
}
