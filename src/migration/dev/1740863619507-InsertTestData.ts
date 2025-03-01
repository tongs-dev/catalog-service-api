import { MigrationInterface, QueryRunner } from "typeorm";

export class InsertTestData1740863619507 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Insert test service data
        await queryRunner.query(
            `INSERT INTO service (id, name, description, created_at, updated_at) VALUES
            ('550e8400-e29b-41d4-a716-446655440000', 'Test Service 1', 'Server 1', NOW(), NOW()),
            ('97a60546-8205-40f2-b392-8c46cdce9cb9', 'Test Service 2', 'Server 2', NOW(), NOW()),
            ('11c6edcd-9e48-44cb-aaa7-a3c7c6e3658a', 'Test Service 3', 'Server 3', NOW(), NOW());`
        );

        // Insert test version data
        await queryRunner.query(
            `INSERT INTO version (id, service_id, name, description, created_at, updated_at) VALUES
            ('1152e843-e3c5-40f1-8fad-b03d445591a0', '550e8400-e29b-41d4-a716-446655440000', 'v1.0', 'version 1.0', NOW(), NOW()),
            ('a7718709-09cc-40f2-9a6c-dc6d7bf556a3', '550e8400-e29b-41d4-a716-446655440000', 'v1.1', 'version 1.1', NOW(), NOW()),
            ('2253f954-f4d6-41f2-9adc-c03f556602b1', '97a60546-8205-40f2-b392-8c46cdce9cb9', 'v0.1', 'version 0.1', NOW(), NOW());`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DELETE FROM version WHERE id IN (
                '1152e843-e3c5-40f1-8fad-b03d445591a0', 'a7718709-09cc-40f2-9a6c-dc6d7bf556a3', '2253f954-f4d6-41f2-9adc-c03f556602b1'
            )`
        );
        await queryRunner.query(
            `DELETE FROM service WHERE id IN (
                '550e8400-e29b-41d4-a716-446655440000', '97a60546-8205-40f2-b392-8c46cdce9cb9', '11c6edcd-9e48-44cb-aaa7-a3c7c6e3658a'
            )`
        );
    }
}
