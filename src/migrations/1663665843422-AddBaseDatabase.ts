import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBaseDatabase1663665843422 implements MigrationInterface {
  name = 'AddBaseDatabase1663665843422';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "posts" ("id" character varying(26) NOT NULL, "creator" character varying NOT NULL, "text" character varying NOT NULL, "mediaUrl" character varying, "mediaType" character varying, "parentId" character varying(26), CONSTRAINT "CHK_deb6cafb3599358049bdd953de" CHECK (("mediaUrl" is null and "mediaType" is null) or ("mediaUrl" is not null and "mediaType" is not null)), CONSTRAINT "PK_2829ac61eff60fcec60d7274b9e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "likes" ("postId" character varying(26) NOT NULL, "userId" character varying NOT NULL, CONSTRAINT "PK_74b9b8cd79a1014e50135f266fe" PRIMARY KEY ("postId", "userId"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "posts" ADD CONSTRAINT "FK_070218af41a90b3a4522d8a70b4" FOREIGN KEY ("parentId") REFERENCES "posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "likes" ADD CONSTRAINT "FK_e2fe567ad8d305fefc918d44f50" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "likes" DROP CONSTRAINT "FK_e2fe567ad8d305fefc918d44f50"`,
    );
    await queryRunner.query(
      `ALTER TABLE "posts" DROP CONSTRAINT "FK_070218af41a90b3a4522d8a70b4"`,
    );
    await queryRunner.query(`DROP TABLE "likes"`);
    await queryRunner.query(`DROP TABLE "posts"`);
  }
}
