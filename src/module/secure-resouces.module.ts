import { Module } from "@nestjs/common";

import { SecureResourceController } from "../controller/secure-resource.controller";

@Module({
    imports: [],
    providers: [],
    controllers: [SecureResourceController],
    exports: [],
})
export class SecureResourceModule {}