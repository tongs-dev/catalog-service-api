import "reflect-metadata";
import { DataSource, DataSourceOptions } from "typeorm";
import dotenv from "dotenv";
import {Service} from "./entity/service.entity";
import {Version} from "./entity/version.entity";

// Load .env or .env.test
dotenv.config({ path: process.env.NODE_ENV === "test" ? ".env.test" : ".env" });

const options: DataSourceOptions = {
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || "dba",
  password: process.env.DB_PASS || "password",
  database: process.env.DB_NAME || "postgres",
  logging: true,
  synchronize: false,
  migrationsRun: true,
  entities: [Service, Version],
  dropSchema: process.env.NODE_ENV === "test", // Drop schema only in tests
  migrations: ["dist/migration/**/*.js"],
};

export const dataSource = new DataSource(options);
