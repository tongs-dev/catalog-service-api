import { QueryFailedError, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { Version } from "../entity/version.entity";
import { VersionResponseDto } from "../dto/response.dto";
import { ResponseDtoTransformer } from "../dto/response-dto-transformer";

@Injectable()
export class VersionDao {
    constructor(
        @InjectRepository(Version)
        private readonly versionRepository: Repository<Version>,
    ) {}

    async createVersion(serviceId: string, name: string): Promise<VersionResponseDto> {
        try {
            const newVersion = this.versionRepository.create({ service: { id: serviceId }, name });
            const result = await this.versionRepository.save(newVersion);

            return ResponseDtoTransformer.toVersionDto(result);
        } catch (err) {
            if (err instanceof QueryFailedError && err.message.includes("idx_version_name_service")) {
                console.log("Duplicate version detected:", serviceId, name, err.message);
                return null;
            }
            throw err;
        }
    }

    async getVersionById(id: string): Promise<VersionResponseDto> {
        const result = await this.versionRepository.findOne({ where: { id }, relations: ["service"] });

        return result ? ResponseDtoTransformer.toVersionDto(result) : null;
    }

    async updateVersion(id: string, name: string): Promise<VersionResponseDto> {
        const version = await this.getVersionById(id);
        if (!version) return null;

        await this.versionRepository.update(id, { name });

        const result = await this.versionRepository.findOne({ where: { id }, relations: ["service"] });

        return result ? ResponseDtoTransformer.toVersionDto(result) : null;
    }

    async deleteVersion(id: string): Promise<boolean> {
        const result = await this.versionRepository.delete(id);

        return result.affected > 0;
    }
}
