import { DataSource } from "typeorm";
import { TestingModule, Test } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ServiceDao } from "../../src/dao/service.dao";
import { VersionDao } from "../../src/dao/version.dao";
import { dataSource } from "../../src/data-source";
import {Service} from "../../src/entity/service.entity";
import {Version} from "../../src/entity/version.entity";

export interface TestDBSetup {
    db: DataSource;
    serviceDao: ServiceDao;
    versionDao: VersionDao;
}

/**
 * Initializes the test database and sets up DAOs.
 */
export const setupTestDB = async (): Promise<TestDBSetup> => {
    process.env.NODE_ENV = "test";

    if (!dataSource.isInitialized) {
        await dataSource.initialize();
    }
    await dataSource.synchronize(true); // Drops and recreates tables

    const module: TestingModule = await Test.createTestingModule({
        imports: [
            TypeOrmModule.forRoot({
                ...dataSource.options, // Use existing DB config
                autoLoadEntities: true,
            }),
            TypeOrmModule.forFeature([Service, Version]), // Register entities
        ],
        providers: [ServiceDao, VersionDao],
    }).compile();

    return {
        db: dataSource,
        serviceDao: module.get<ServiceDao>(ServiceDao),
        versionDao: module.get<VersionDao>(VersionDao),
    };
};

/**
 * Cleans up the database connection.
 */
export const teardownTestDB = async () => {
    if (dataSource.isInitialized) {
        await dataSource.destroy();
    }
};
