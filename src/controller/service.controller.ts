import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Query,
    Body,
    UsePipes,
    ValidationPipe,
    InternalServerErrorException, NotFoundException, HttpException
} from "@nestjs/common";


import { ServiceDao } from "../dao/service.dao";
import {ServicesWithVersionCountRequestDto, ServiceWithVersionsRequestDto} from "../dto/request.dto";
import { ServiceWithVersionCountResponseDto, ServiceWithVersionsResponseDto } from "../dto/response.dto";

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

    // @Post()
    // async createService(@Body() newService: Partial<Service>): Promise<ResponseDto> {
    //     return this.serviceDao.createService(newService);
    // }
    //
    // @Put(":id")
    // async updateService(
    //     @Param("id") id: string,
    //     @Body() updateData: Partial<Service>
    // ): Promise<ResponseDto> {
    //     return this.serviceDao.updateService(id, updateData);
    // }
    //
    // @Delete(":id")
    // async deleteService(@Param("id") id: string): Promise<boolean> {
    //     return this.serviceDao.deleteService(id);
    // }
}