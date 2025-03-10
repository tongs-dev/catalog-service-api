import "reflect-metadata";
import dotenv from "dotenv";
import { DataSource, DataSourceOptions } from "typeorm";

import { Service } from "./entity/service.entity";
import { Version } from "./entity/version.entity";

// Load .env for test environment
if (process.env.NODE_ENV === "test") {
    dotenv.config({ path: ".env" });
}

const options: DataSourceOptions = {
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USER || "test_user",
    password: process.env.DB_PASS || "password",
    database: process.env.DB_NAME || "postgres",
    logging: false,
    synchronize: false,
    migrationsRun: true,
    entities: [Service, Version],
    dropSchema: process.env.NODE_ENV === "test", // Drop schema only in tests
    migrations: process.env.MIGRATION_PATH ? [process.env.MIGRATION_PATH] : ["dist/migration/**/*.js"],
};

export const dataSource = new DataSource(options);
