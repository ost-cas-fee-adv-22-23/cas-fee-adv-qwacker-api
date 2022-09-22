import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBaseDatabase1663859062973 implements MigrationInterface {
  name = 'AddBaseDatabase1663859062973';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "posts" ("id" character varying(26) NOT NULL, "creator" character varying NOT NULL, "text" character varying NOT NULL, "mediaUrl" character varying, "mediaType" character varying, "parentId" character varying, CONSTRAINT "CHK_deb6cafb3599358049bdd953de" CHECK (("mediaUrl" is null and "mediaType" is null) or ("mediaUrl" is not null and "mediaType" is not null)), CONSTRAINT "PK_2829ac61eff60fcec60d7274b9e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "likes" ("postId" character varying(26) NOT NULL, "userId" character varying NOT NULL, CONSTRAINT "PK_74b9b8cd79a1014e50135f266fe" PRIMARY KEY ("postId", "userId"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "posts" ADD CONSTRAINT "FK_070218af41a90b3a4522d8a70b4" FOREIGN KEY ("parentId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "likes" ADD CONSTRAINT "FK_e2fe567ad8d305fefc918d44f50" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`CREATE VIEW "aggregated_posts" AS 
  with postlikes as (
    select 
      l."postId",
      array_remove(array_agg(l."userId"), null) as likers
    from likes l
    group by l."postId"
  ),
  replies as (
    select
      p."parentId",
      count(p.id) as count
    from posts p
    where p."parentId" is not null
    group by p."parentId"
  )
  select
    p.*,
    coalesce(lp.likers, '{}') as "likers",
    coalesce(r.count, 0) as "replyCount"
  from posts p
    left join postlikes lp on p.id = lp."postId"
    left join replies r on r."parentId" = p.id;
  `);
    await queryRunner.query(
      `INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        'public',
        'VIEW',
        'aggregated_posts',
        'with postlikes as (\n    select \n      l."postId",\n      array_remove(array_agg(l."userId"), null) as likers\n    from likes l\n    group by l."postId"\n  ),\n  replies as (\n    select\n      p."parentId",\n      count(p.id) as count\n    from posts p\n    where p."parentId" is not null\n    group by p."parentId"\n  )\n  select\n    p.*,\n    coalesce(lp.likers, \'{}\') as "likers",\n    coalesce(r.count, 0) as "replyCount"\n  from posts p\n    left join postlikes lp on p.id = lp."postId"\n    left join replies r on r."parentId" = p.id;',
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['VIEW', 'aggregated_posts', 'public'],
    );
    await queryRunner.query(`DROP VIEW "aggregated_posts"`);
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
