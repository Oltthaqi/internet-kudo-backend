import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('esims')
export class Esim {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  subscriberId: number;

  @Column({ nullable: true })
  imsi: string;

  @Column({ nullable: true })
  iccid: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  smdpServer: string;

  @Column({ nullable: true })
  activationCode: string;

  @Column({ nullable: true })
  batchId: string;

  @Column()
  accountId: number;

  @Column()
  resellerId: number;

  @Column({ default: true })
  prepaid: boolean;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  balance: number;

  @Column({ nullable: true })
  simStatus: string;

  @Column({ nullable: true })
  status: string;

  @Column({ type: 'timestamp', nullable: true })
  activationDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
