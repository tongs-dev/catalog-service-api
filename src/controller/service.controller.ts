import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpException,
    InternalServerErrorException,
    Param,
    Patch,
    Post,
    Query,
    UsePipes,
    ValidationPipe,
    NotFoundException,
} from "@nestjs/common";

import { ServiceDao } from "../dao/service.dao";
import {
    CreateServiceRequestDto,
    ServiceRequestPathParamDto,
    ServicesWithVersionCountRequestDto,
    ServiceWithVersionsRequestDto,
    UpdateServiceRequestDto
} from "../dto/request.dto";
import {
    ServiceResponseDto,
    ServiceWithVersionCountResponseDto,
    ServiceWithVersionsResponseDto
} from "../dto/response.dto";

@Controller("services")
export class ServiceController {
    constructor(private readonly serviceDao: ServiceDao) {}

    /**
     * TODO: document endpoint
     * @param query
     */
    @Get()
    @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
    async getServices(@Query() query: ServicesWithVersionCountRequestDto): Promise<ServiceWithVersionCountResponseDto[]> {
        try {
            return this.serviceDao.getServicesWithVersionCount(
                query.page,
                query.limit,
                query.name,
                query.sortBy,
                query.order
            );
        } catch (error) {
            throw new InternalServerErrorException("Internal server error", error);
        }

    }

    @Get(":id/versions")
    @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
    async getServiceWithVersions(@Param() params: ServiceWithVersionsRequestDto): Promise<ServiceWithVersionsResponseDto> {
        try {
            const service = await this.serviceDao.getServiceWithVersions(params.id);

            if (!service) {
                throw new NotFoundException(`Service with ID ${params.id} not found`);
            }

            return service;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }

            throw new InternalServerErrorException("Internal server error", error);
        }
    }

    @Post()
    @UsePipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }))
    async createService(@Body() newService: CreateServiceRequestDto): Promise<ServiceResponseDto> {
        try {
            return this.serviceDao.createService(newService);
        } catch (error) {
            throw new InternalServerErrorException("Internal server error", error);
        }
    }

    @Patch(":id")
    @UsePipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }))
    async updateService(
        @Param() params: ServiceRequestPathParamDto,
        @Body() updateData: UpdateServiceRequestDto
    ): Promise<ServiceResponseDto> {
        try {
            const service = await this.serviceDao.updateService(params.id, updateData);

            if (!service) {
                throw new NotFoundException(`Service with ID ${params.id} not found`);
            }

            return service;
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
    async deleteService(@Param() params: ServiceRequestPathParamDto): Promise<void> {
        try {
            const result = await this.serviceDao.deleteService(params.id);

            if (!result) {
                throw new NotFoundException(`Service with ID ${params.id} not found`);
            }
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }

            throw new InternalServerErrorException("Internal server error", error);
        }
    }
}