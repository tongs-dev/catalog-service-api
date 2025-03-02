import { Controller, Post, Body } from "@nestjs/common";

import { User } from "../entity/user.entity";
import { AuthService } from "../service/auth.service";

/**
 * Controller for managing authentication-related operations.
 */
@Controller("auth")
export class AuthController {
    constructor(private authService: AuthService) {}

    /**
     * Registers a new user.
     *
     * Request Format
     *     POST /api/auth/register \
     * Headers
     *     Content-Type: application/json
     * Payload
     *     { "username": {user_name}, "password": {password} }
     *
     * Response Format
     *     {
     *         "username": {user_name},
     *         "password": {encrypted_password},
     *         "id": $(user_id)
     *     }
     *
     * Example Request
     *     curl -X POST http://localhost:3000/api/auth/register \
     *          -H "Content-Type: application/json" \
     *          -d '{"username": "admin", "password": "password"}'
     */
    @Post("register")
    async register(@Body() body: { username: string; password: string }): Promise<User> {
        return this.authService.register(body.username, body.password);
    }

    /**
     * Authenticates a user and returns a JWT token.
     *
     * Request Format
     *     POST http://localhost:3000/api/auth/login \
     * Headers
     *     Content-Type: application/json
     * Payload
     *     '{"username": {user_name}, "password": {password}}'
     *
     * Response Format
     *     {
     *         "access_token":$(TOKEN)
     *     }
     *
     * Example Request
     *     curl -X POST http://localhost:3000/api/auth/login \
     *          -H "Content-Type: application/json" \
     *          -d '{"username": "admin", "password": "password"}'
     */
    @Post("login")
    async login(@Body() body: { username: string; password: string }) {
        return this.authService.login(body);
    }
}
