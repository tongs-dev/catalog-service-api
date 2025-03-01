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

@Controller("versions")
export class VersionController {
    constructor(private readonly versionDao: VersionDao) {}

    @Post()
    @UsePipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }))
    async createVersion(@Body() newVersion: CreateVersionRequestDto): Promise<VersionResponseDto> {
        try {
            const result = await this.versionDao.createVersion(newVersion);

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