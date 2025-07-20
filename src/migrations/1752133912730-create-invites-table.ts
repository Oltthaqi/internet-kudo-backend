import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateInvitesTable1752133912730 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'invites',
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
            isNullable: true,
          },
          {
            name: 'email',
            type: 'varchar',
            isNullable: true,
            default: null,
          },
          {
            name: 'accepted',
            type: 'boolean',
            isNullable: true,
            default: false,
          },
          {
            name: 'role',
            type: 'enum',
            enum: ['USER', 'ADMIN', 'SUPER_ADMIN'],
            default: `'USER'`,
          },
          {
            name: 'expires_at',
            type: 'timestamp',
            isNullable: true,
            default: null,
          },
          {
            name: 'is_deleted',
            type: 'boolean',
            isNullable: true,
            default: false,
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
    await queryRunner.createForeignKey(
      'invites',
      new TableForeignKey({
        name: 'FK_invites_user',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('invites');
    if (table) {
      const fk = table.foreignKeys.find((fk) =>
        fk.columnNames.includes('user_id'),
      );
      if (fk) {
        await queryRunner.dropForeignKey('invites', fk);
      }
    }
  }
}
