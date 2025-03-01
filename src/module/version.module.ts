import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { VersionController } from "../controller/version.controller";
import { VersionDao } from "../dao/version.dao";
import { Version } from "../entity/version.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Version])],
    providers: [VersionDao],
    controllers: [VersionController],
    exports: [VersionDao],
})
export class VersionModule {}
