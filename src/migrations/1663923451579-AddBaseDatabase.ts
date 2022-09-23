import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBaseDatabase1663923451579 implements MigrationInterface {
  name = 'AddBaseDatabase1663923451579';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "posts" DROP CONSTRAINT "FK_070218af41a90b3a4522d8a70b4"
        `);
    await queryRunner.query(`
            ALTER TABLE "likes" DROP CONSTRAINT "FK_e2fe567ad8d305fefc918d44f50"
        `);
    await queryRunner.query(`
            ALTER TABLE "posts"
            ADD CONSTRAINT "FK_070218af41a90b3a4522d8a70b4" FOREIGN KEY ("parentId") REFERENCES "posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "likes"
            ADD CONSTRAINT "FK_e2fe567ad8d305fefc918d44f50" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "likes" DROP CONSTRAINT "FK_e2fe567ad8d305fefc918d44f50"
        `);
    await queryRunner.query(`
            ALTER TABLE "posts" DROP CONSTRAINT "FK_070218af41a90b3a4522d8a70b4"
        `);
    await queryRunner.query(`
            ALTER TABLE "likes"
            ADD CONSTRAINT "FK_e2fe567ad8d305fefc918d44f50" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "posts"
            ADD CONSTRAINT "FK_070218af41a90b3a4522d8a70b4" FOREIGN KEY ("parentId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
  }
}
