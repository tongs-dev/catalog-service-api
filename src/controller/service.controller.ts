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
import {GetAllServicesDto, GetServiceDetailDto} from "../dto/request.dto";
import {
    ServiceDetailResponseDto,
    ServiceWithVersionCountResponseDto,
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
    async getAllServices(@Query() query: GetAllServicesDto): Promise<ServiceWithVersionCountResponseDto[]> {
        try {
            return this.serviceDao.getAllServicesWithVersionCount(
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

    @Get(":id")
    @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
    async getServiceDetail(@Param() params: GetServiceDetailDto): Promise<ServiceDetailResponseDto> {
        try {
            const service = await this.serviceDao.getServiceDetail(params.id);

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