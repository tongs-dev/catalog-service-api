import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

/**
 * JWT authentication strategy using Passport.
 * This strategy extracts the JWT from the Authorization header,
 * verifies its validity, and extracts the payload.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || "my_secret",
        });
    }

    /**
     * Validates and extracts user details from the JWT payload.
     *
     * @param payload - The decoded JWT payload.
     * @returns An object containing the user ID and username.
     */
    async validate(payload: any) {
        return { userId: payload.sub, username: payload.username };
    }
}
