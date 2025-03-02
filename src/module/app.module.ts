import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { User } from "../auth/entity/user.entity";
import { AuthModule } from "../auth/module/auth.module";
import { Version } from "../entity/version.entity";
import { Service } from "../entity/service.entity";
import { SecureResourceModule } from "./secure-resouces.module";
import { ServiceModule } from "./service.module";
import { VersionModule } from "./version.module";

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: "postgres",
            host: process.env.DB_HOST || "localhost",
            port: Number(process.env.DB_PORT) || 5432,
            username: process.env.DB_USER || "test_user",
            password: process.env.DB_PASS || "password",
            database: process.env.DB_NAME || "postgres",
            entities: [Service, Version, User],
            synchronize: false,
            autoLoadEntities: true,
        }),
        ServiceModule,
        VersionModule,
        AuthModule,
        SecureResourceModule,
    ],
})
export class AppModule {}
