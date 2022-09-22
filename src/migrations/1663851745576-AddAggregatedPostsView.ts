import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAggregatedPostsView1663851745576 implements MigrationInterface {
    name = 'AddAggregatedPostsView1663851745576'

    public async up(queryRunner: QueryRunner): Promise<void> {
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
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`, ["public","VIEW","aggregated_posts","with postlikes as (\n    select \n      l.\"postId\",\n      array_remove(array_agg(l.\"userId\"), null) as likers\n    from likes l\n    group by l.\"postId\"\n  ),\n  replies as (\n    select\n      p.\"parentId\",\n      count(p.id) as count\n    from posts p\n    where p.\"parentId\" is not null\n    group by p.\"parentId\"\n  )\n  select\n    p.*,\n    coalesce(lp.likers, '{}') as \"likers\",\n    coalesce(r.count, 0) as \"replyCount\"\n  from posts p\n    left join postlikes lp on p.id = lp.\"postId\"\n    left join replies r on r.\"parentId\" = p.id;"]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`, ["VIEW","aggregated_posts","public"]);
        await queryRunner.query(`DROP VIEW "aggregated_posts"`);
    }

}
