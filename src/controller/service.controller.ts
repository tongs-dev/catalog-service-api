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

/**
 * Controller for managing services.
 */
@Controller("services")
export class ServiceController {
    constructor(private readonly serviceDao: ServiceDao) {}

    /**
     * Retrieves a list of services with version count.
     * @param query - Pagination, filtering and sorting parameters.
     * @returns A list of services with their version count.
     *
     * Request Format
     *     GET /api/services?{queryParamPairs}
     * Query parameters:
     *     - page (optional, default: 1) - The page number for pagination
     *     - limit (optional, default: 10) - The number of results per page
     *     - sortBy (optional, default: createdAt) - The field to sort results by (name, createdAt, etc.)
     *     - order (optional, default: desc) - The sorting order (asc for ascending, desc for descending)
     *     - name (optional) - Filter services by name (partial match supported)
     *
     * Response Status Codes:
     * - 200 OK - Successfully retrieved services
     * - 400 Bad Request - If any request parameter is invalid
     * - 500 Internal Server Error - If an unexpected error occurs
     *
     * Example request:
     *     GET /api/services?page=1&limit=10&sortBy=name&order=asc
     * Example response:
     * [
     *   {
     *     "id": "550e8400-e29b-41d4-a716-446655440000",
     *     "name": "Test Service 1",
     *     "description": "Server 1",
     *     "versionCount": 2
     *   },
     *   {
     *     "id": "97a60546-8205-40f2-b392-8c46cdce9cb9",
     *     "name": "Test Service 2",
     *     "description": "Server 2",
     *     "versionCount": 1
     *   }
     * ]
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

    /**
     * Retrieves a specific service along with its versions by id.
     * @param params - The ID of the service.
     * @returns The service with its associated versions.
     *
     * Request Format
     *     GET /api/services/{service_id}
     * Path parameter:
     *     - id (required): The id of the service
     *
     * Response Status Codes:
     *     - 200 OK - Successfully retrieved the service
     *     - 400 Bad Request - If any request parameter is invalid
     *     - 404 Not Found - If the service does not exist
     *     - 500 Internal Server Error - If an unexpected error occurs
     *
     * Example request:
     *     GET /api/services/550e8400-e29b-41d4-a716-446655440000/versions
     * Example response:
     * {
     *    "id": "550e8400-e29b-41d4-a716-446655440000",
     *    "name": "Test Service 1",
     *    "description": "Server 1",
     *    "createdAt":"2025-03-01T21:31:57.042Z",
     *    "updatedAt":"2025-03-01T21:31:57.042Z",
     *    "versions": [
     *       {
     *          "id":"1152e843-e3c5-40f1-8fad-b03d445591a0",
     *          "name":"v1.0",
     *          "description":"version 1.0",
     *          "createdAt":"2025-03-01T21:31:57.042Z",
     *          "updatedAt":"2025-03-01T21:31:57.042Z"
     *       }
     *    ]
     * }
     */
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

    /**
     * Creates a new service.
     * @param newService - The service details.
     * @returns The created service.
     *
     * Request Format
     *     POST /api/services
     * Payload fields:
     *     - name (required): The name of the service
     *     - description (required): The description of the service
     *
     * Response Status Codes:
     * - 201 Created - Successfully created service
     * - 400 Bad Request - If any request parameter is invalid
     * - 500 Internal Server Error - If an unexpected error occurs
     *
     * Example Request:
     *     POST /api/services
     *     payload:
     *     {
     *         "name": "New Service",
     *         "description": "Service description"
     *     }
     * Example Response:
     * {
     *     "id": "550e8400-e29b-41d4-a716-446655440000",
     *     "name": "New Service",
     *     "description": "Service description",
     *     "createdAt": "2024-03-01T12:00:00Z",
     *     "updatedAt": "2024-03-01T12:00:00Z"
     * }
     */
    @Post()
    @UsePipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }))
    async createService(@Body() newService: CreateServiceRequestDto): Promise<ServiceResponseDto> {
        try {
            return this.serviceDao.createService(newService);
        } catch (error) {
            throw new InternalServerErrorException("Internal server error", error);
        }
    }

    /**
     * Partially updates an existing service.
     * @param params - The ID of the service.
     * @param updateData - The updated service details.
     * @returns The updated service.
     *
     * Request Format
     *     PATCH /api/services/{service_id}
     * Path parameter:
     *     - id (required): The id of the service
     * Payload fields:
     *     - name (optional): The name of the service
     *     - description (optional): The description of the service
     *
     * Response Status Codes:
     *     - 200 OK - Successfully updated service
     *     - 400 Bad Request - If any request parameter is invalid
     *     - 404 Not Found - If the service does not exist
     *     - 500 Internal Server Error - If an unexpected error occurs
     *
     * Example Request:
     *     PATCH /api/services/550e8400-e29b-41d4-a716-446655440000
     *     payload:
     *     {
     *       "name": "New Service Name",
     *       "description": "Updated Service description"
     *     }
     * Example Response:
     * {
     *     "id": "550e8400-e29b-41d4-a716-446655440000",
     *     "name": "New Service Name",
     *     "description": "Updated Service description",
     *     "createdAt": "2024-03-01T12:00:00Z",
     *     "updatedAt": "2024-03-01T15:00:00Z"
     * }
     */
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

    /**
     * Deletes a service.
     *
     * @param params - The ID of the service to delete.
     *
     * Request Format
     *     DELETE /api/services/{service_id}
     * Path parameter:
     *     - id (required): The id of the service
     *
     * Response Status Codes:
     *     - 204 No Content - Successfully deleted service
     *     - 400 Bad Request - If any request parameter is invalid
     *     - 404 Not Found - If the service does not exist
     *     - 500 Internal Server Error - If an unexpected error occurs
     *
     * Example Request:
     *     DELETE /api/services/550e8400-e29b-41d4-a716-446655440000
     * Example Response:
     *     204 No Content
     */
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