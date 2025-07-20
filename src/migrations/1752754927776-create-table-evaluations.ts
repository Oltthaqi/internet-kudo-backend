import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateTableEvaluations1752754927776 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1) create the evaluations table
    await queryRunner.createTable(
      new Table({
        name: 'evaluations',
        columns: [
          {
            name: 'id',
            type: 'char',
            length: '36',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'jobTitle',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
            default: null,
          },
          {
            name: 'jobType',
            type: 'enum',
            enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
            default: `'Full-time'`,
          },
          {
            name: 'requiredEducation',
            type: 'text',
            isNullable: true,
            default: null,
          },
          {
            name: 'requiredExperience',
            type: 'text',
            isNullable: true,
            default: null,
          },
          {
            name: 'keySkillsAndResponsibilities',
            type: 'text',
            isNullable: true,
            default: null,
          },
          {
            name: 'user_id',
            type: 'char',
            length: '36',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // 2) add FK to users(id)
    await queryRunner.createForeignKey(
      'evaluations',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the FK first, then the table
    const table = await queryRunner.getTable('evaluations');
    if (table) {
      const fk = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('user_id') !== -1,
      );
      if (fk) {
        await queryRunner.dropForeignKey('evaluations', fk);
      }
    }
    await queryRunner.dropTable('evaluations');
  }
}
