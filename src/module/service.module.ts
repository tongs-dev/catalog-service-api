import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { ServiceController } from "../controller/service.controller";
import { ServiceDao } from "../dao/service.dao";
import { Service } from "../entity/service.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Service])],
    providers: [ServiceDao],
    controllers: [ServiceController],
    exports: [ServiceDao],
})
export class ServiceModule {}
