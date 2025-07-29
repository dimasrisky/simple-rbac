import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUser1753239825558 implements MigrationInterface {
  name = 'UpdateUser1753239825558';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "is_active" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "is_active"`);
  }
}
