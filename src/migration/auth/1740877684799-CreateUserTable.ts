import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserTable1740877684799 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "user" (
                "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "username" VARCHAR(255) UNIQUE NOT NULL,
                "password" TEXT NOT NULL
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "user";`);
    }

}
