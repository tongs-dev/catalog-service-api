import { QueryFailedError, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { Version } from "../entity/version.entity";
import { VersionResponseDto } from "../dto/response.dto";
import { ResponseDtoTransformer } from "../dto/response-dto-transformer";
import {Service} from "../entity/service.entity";
import {version} from "ts-jest/dist/transformers/hoist-jest";

@Injectable()
export class VersionDao {
    constructor(
        @InjectRepository(Version)
        private readonly versionRepository: Repository<Version>,
    ) {}

    async createVersion(newVersion: Partial<Version>): Promise<VersionResponseDto> {
        try {
            const version = this.versionRepository.create(newVersion);

            const result = await this.versionRepository.save(version);

            return ResponseDtoTransformer.toVersionDto(result);
        } catch (err) {
            if (err instanceof QueryFailedError && err.message.includes("idx_version_name_service")) {
                console.log("Duplicate version detected:", newVersion.service.id, newVersion.name, err.message);
                return null;
            }
            throw err;
        }
    }

    async getVersionById(id: string): Promise<VersionResponseDto> {
        const result = await this.versionRepository.findOne({ where: { id }, relations: ["service"] });

        return result ? ResponseDtoTransformer.toVersionDto(result) : null;
    }

    async updateVersion(id: string, updateData: Partial<Version>): Promise<VersionResponseDto> {
        await this.versionRepository.update(id, updateData);

        const result = await this.versionRepository.findOne({ where: { id }, relations: ["service"] });

        return result ? ResponseDtoTransformer.toVersionDto(result) : null;
    }

    async deleteVersion(id: string): Promise<boolean> {
        const result = await this.versionRepository.delete(id);

        return result.affected > 0;
    }
}
