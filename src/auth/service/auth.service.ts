import * as bcrypt from "bcrypt";

import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import {InjectRepository} from "@nestjs/typeorm";
import {User} from "../entity/user.entity";
import {Repository} from "typeorm";

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        @InjectRepository(User)
        private userRepository: Repository<User>
    ) {}

    async validateUser(username: string, password: string): Promise<any> {
        const user = await this.userRepository.findOne({ where: { username } });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new UnauthorizedException("Invalid credentials");
        }

        return { id: user.id, username: user.username };
    }

    async register(username: string, password: string): Promise<User> {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = this.userRepository.create({ username, password: hashedPassword });
        return this.userRepository.save(newUser);
    }

    async login(user: any) {
        const payload = { username: user.username, sub: user.id };
        return { access_token: this.jwtService.sign(payload) };
    }
}
