import { QueryFailedError, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { Version } from "../entity/version.entity";
import { VersionResponseDto } from "../dto/response.dto";
import { ResponseDtoTransformer } from "../dto/response-dto-transformer";

/**
 * Data Access Object (DAO) for managing Version entity interactions with the database.
 */
@Injectable()
export class VersionDao {
    constructor(
        @InjectRepository(Version)
        private readonly versionRepository: Repository<Version>,
    ) {}

    /**
     * Creates a new version.
     *
     * @param newVersion - The version details.
     * @returns The created version or null if a duplicate version is detected.
     */
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

    /**
     * Retrieves a version by its ID.
     *
     * @param id - The ID of the version.
     * @returns The version details or null if the version does not exist.
     */
    async getVersionById(id: string): Promise<VersionResponseDto> {
        const result = await this.versionRepository.findOne({ where: { id }, relations: ["service"] });

        return result ? ResponseDtoTransformer.toVersionDto(result) : null;
    }

    /**
     * Updates an existing version.
     *
     * @param id - The ID of the version to update.
     * @param updateData - The updated version details.
     * @returns The updated version or null if the version does not exist.
     */
    async updateVersion(id: string, updateData: Partial<Version>): Promise<VersionResponseDto> {
        await this.versionRepository.update(id, updateData);

        const result = await this.versionRepository.findOne({ where: { id }, relations: ["service"] });

        return result ? ResponseDtoTransformer.toVersionDto(result) : null;
    }

    /**
     * Deletes a version.
     *
     * @param id - The ID of the version to delete.
     * @returns True if deletion was successful, otherwise false.
     */
    async deleteVersion(id: string): Promise<boolean> {
        const result = await this.versionRepository.delete(id);

        return result.affected > 0;
    }
}
