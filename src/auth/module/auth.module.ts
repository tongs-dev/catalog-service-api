import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";

import { AuthController } from "../controller/auth.controller";
import { AuthService } from "../service/auth.service";
import { JwtStrategy } from "../jwt.strategy";
import {TypeOrmModule} from "@nestjs/typeorm";
import {User} from "../entity/user.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        PassportModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET || "my_secret",
            signOptions: { expiresIn: "1h" },
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
    exports: [AuthService],
})

export class AuthModule {}
