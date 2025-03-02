import {
    Body,
    ConflictException,
    Controller, Delete,
    Get, HttpCode,
    HttpException,
    InternalServerErrorException,
    NotFoundException,
    Param, Patch,
    Post,
    UsePipes,
    ValidationPipe,
} from "@nestjs/common";

import { VersionDao } from "../dao/version.dao";
import { VersionResponseDto } from "../dto/response.dto";
import {
    CreateVersionRequestDto,
    UpdateVersionRequestDto,
    VersionRequestPathParamDto
} from "../dto/request.dto";
import {Service} from "../entity/service.entity";
import {ResponseDtoTransformer} from "../dto/request-dto-transformer";

/**
 * Controller for managing versions.
 */
@Controller("versions")
export class VersionController {
    constructor(private readonly versionDao: VersionDao) {}

    /**
     * Creates a new version.
     * @param newVersion - The version details.
     * @returns The created version.
     *
     * Request Format
     *     POST /api/versions
     * Payload fields:
     *     - name (required): The name of the version
     *     - description (required): The description of the version
     *     - serviceId (required): The service ID this version belongs to
     *
     * Response Status Codes:
     * - 201 Created - Successfully created version
     * - 400 Bad Request - If any request parameter is invalid
     * - 500 Internal Server Error - If an unexpected error occurs
     *
     * Example Request:
     *     curl -X POST http://localhost:3000/api/versions \
     *          -H "Content-Type: application/json" \
     *          -d '{"name": "New Version", "description": "Version description", "serviceId": "97a60546-8205-40f2-b392-8c46cdce9cb9"}'
     * Example Response:
     * {
     *     "id":"66ca11ab-ba54-41e6-91db-70302c418939",
     *     "name":"New Version",
     *     "description":"Version description",
     *     "createdAt":"2025-03-02T02:54:55.566Z",
     *     "updatedAt":"2025-03-02T02:54:55.566Z",
     *     "serviceId":"97a60546-8205-40f2-b392-8c46cdce9cb9"
 *     }
     */
    @Post()
    @UsePipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }))
    async createVersion(@Body() newVersion: CreateVersionRequestDto): Promise<VersionResponseDto> {
        try {
            const result = await this.versionDao.createVersion(
                ResponseDtoTransformer.toVersion(newVersion)
            );

            if (!result) {
                throw new ConflictException("Duplicate version name for this service");
            }

            return result;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }

            throw new InternalServerErrorException("Internal server error", error);
        }
    }

    /**
     * Retrieves a specific version.
     * @param params - The ID of the version.
     * @returns The version.
     *
     * Request Format
     *     GET /api/versions/{version_id}
     * Path parameter:
     *     - id (required): The id of the service
     *
     * Response Status Codes:
     *     - 200 OK - Successfully retrieved version
     *     - 400 Bad Request - If any request parameter is invalid
     *     - 404 Not Found - If the version does not exist
     *     - 500 Internal Server Error - If an unexpected error occurs
     *
     * Example request:
     *     curl -X GET http://localhost:3000/api/versions/1152e843-e3c5-40f1-8fad-b03d445591a0
     * Example response:
     * {
     *     "id":"1152e843-e3c5-40f1-8fad-b03d445591a0",
     *     "name":"v1.0",
     *     "description":"version 1.0",
     *     "createdAt":"2025-03-01T21:31:57.042Z",
     *     "updatedAt":"2025-03-01T21:31:57.042Z",
     *     "serviceId":"550e8400-e29b-41d4-a716-446655440000"
     * }
     */
    @Get(":id")
    @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
    async getVersion(@Param() params: VersionRequestPathParamDto): Promise<VersionResponseDto> {
        try {
            const version = await this.versionDao.getVersionById(params.id);

            if (!version) {
                throw new NotFoundException(`Version with ID ${params.id} not found`);
            }

            return version;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }

            throw new InternalServerErrorException("Internal server error", error);
        }
    }

    /**
     * Partially updates an existing version.
     * @param params - The ID of the version.
     * @param updateData - The updated version details.
     * @returns The updated version.
     *
     * Request Format
     *     PATCH /api/versions/{version_id}
     * Path parameter:
     *     - id (required): The id of the version
     * Payload fields:
     *     - name (optional): The name of the version
     *     - description (optional): The version of the service
     *
     * Response Status Codes:
     *     - 200 OK - Successfully updated version
     *     - 400 Bad Request - If any request parameter is invalid
     *     - 404 Not Found - If the version does not exist
     *     - 500 Internal Server Error - If an unexpected error occurs
     *
     * Example Request:
     *     curl -X PATCH http://localhost:3000/api/versions/1152e843-e3c5-40f1-8fad-b03d445591a0 \
     *          -H "Content-Type: application/json" \
     *          -d '{"name": "v10.0.1", "description": "new version"}'
     * Example Response:
     * {
     *     "id": "1152e843-e3c5-40f1-8fad-b03d445591a0",
     *     "name": "v10.0.1",
     *     "description": "new version",
     *     "createdAt":"2025-03-02T02:16:22.240Z",
     *     "updatedAt":"2025-03-02T02:24:35.906Z",
     *     "serviceId":"550e8400-e29b-41d4-a716-446655440000"
     * }
     */
    @Patch(":id")
    @UsePipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }))
    async updateVersion(
        @Param() params: VersionRequestPathParamDto,
        @Body() updateData: UpdateVersionRequestDto
    ): Promise<VersionResponseDto> {
        try {
            const result = await this.versionDao.updateVersion(params.id, updateData);

            if (!result) {
                throw new NotFoundException(`Version with ID ${params.id} not found`);
            }

            return result;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }

            throw new InternalServerErrorException("Internal server error", error);
        }
    }

    /**
     * Deletes a version.
     *
     * @param params - The ID of the version to delete.
     *
     * Request Format
     *     DELETE /api/versions/{version_id}
     * Path parameter:
     *     - id (required): The id of the version
     *
     * Response Status Codes:
     *     - 204 No Content - Successfully deleted version
     *     - 400 Bad Request - If any request parameter is invalid
     *     - 404 Not Found - If the version does not exist
     *     - 500 Internal Server Error - If an unexpected error occurs
     *
     * Example Request:
     *      curl -X DELETE http://localhost:3000/api/versions/1152e843-e3c5-40f1-8fad-b03d445591a0
     * Example Response:
     *     204 No Content
     */
    @Delete(":id")
    @HttpCode(204)
    @UsePipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }))
    async deleteService(@Param() params: VersionRequestPathParamDto): Promise<void> {
        try {
            const result = await this.versionDao.deleteVersion(params.id);

            if (!result) {
                throw new NotFoundException(`Version with ID ${params.id} not found`);
            }
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }

            throw new InternalServerErrorException("Internal server error", error);
        }
    }
}