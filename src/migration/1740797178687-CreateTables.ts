import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTables1740797178687 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Enable UUID extension (if not already enabled)
        await queryRunner.query("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";");

        // Create service table
        await queryRunner.query(`
            CREATE TABLE service (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                name VARCHAR(255) NOT NULL,
                description VARCHAR(500) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        await queryRunner.commitTransaction();

        // Create service index
        await queryRunner.query("CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_service_name ON service(name);");
        await queryRunner.startTransaction();

        // Create version table
        await queryRunner.query(`
            CREATE TABLE version (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                service_id UUID NOT NULL,
                name VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT fk_version_service FOREIGN KEY (service_id) REFERENCES service(id) ON DELETE CASCADE
            );
        `);
        await queryRunner.commitTransaction();

        // Create unique index on version table
        await queryRunner.query("CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_version_name_service ON version (name, service_id);");
        await queryRunner.startTransaction();
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes first
        await queryRunner.query("DROP INDEX IF EXISTS idx_version_name_service;");
        await queryRunner.query("DROP INDEX IF EXISTS idx_service_name;");

        // Drop version table and its foreign key
        await queryRunner.query("ALTER TABLE version DROP CONSTRAINT IF EXISTS fk_version_service;");
        await queryRunner.query("DROP TABLE IF EXISTS version;");

        // Drop service table
        await queryRunner.query("DROP TABLE IF EXISTS service;");
    }
}
