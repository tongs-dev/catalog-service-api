import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Service } from "../entity/service.entity";
import { ServiceDao } from "../dao/service.dao";
import { ServiceController } from "../controller/service.controller";

@Module({
    imports: [TypeOrmModule.forFeature([Service])],
    providers: [ServiceDao],
    controllers: [ServiceController],
    exports: [ServiceDao],
})
export class ServiceModule {}
