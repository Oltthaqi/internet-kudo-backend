import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateCompanyTable1752133278984 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'companies',
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
            name: 'user_id',
            type: 'char',
            length: '36',
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'information',
            type: 'varchar',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'locations',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'phone_number',
            type: 'varchar',
            isNullable: false,
            isUnique: true,
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
          {
            name: 'is_deleted',
            type: 'boolean',
            isNullable: false,
            default: false,
          },
        ],
      }),
      true,
    );

    // Add foreign key separately (cleaner & avoids edge issues)
    await queryRunner.createForeignKey(
      'companies',
      new TableForeignKey({
        name: 'FK_companies_user',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop FK first to avoid constraint issues
    const table = await queryRunner.getTable('companies');
    if (table) {
      const foreignKey = table.foreignKeys.find(
        (fk) => fk.name === 'FK_companies_user',
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('companies', foreignKey);
      }
    }

    await queryRunner.dropTable('companies');
  }
}
