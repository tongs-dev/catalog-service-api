import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import {
    ServiceResponseDto,
    ServiceWithVersionCountResponseDto,
    ServiceWithVersionsResponseDto,
} from "../dto/response.dto";
import { ResponseDtoTransformer } from "../dto/response-dto-transformer";
import { Service } from "../entity/service.entity";

/**
 * Data Access Object (DAO) for managing Service entity interactions with the database.
 */
@Injectable()
export class ServiceDao {
    constructor(
        @InjectRepository(Service)
        private readonly serviceRepository: Repository<Service>,
    ) {}

    /**
     * Retrieves a paginated list of services with the count of associated versions.
     *
     * @param page - The page number for pagination.
     * @param limit - The number of results per page.
     * @param name - (Optional) Filter services by name (case-insensitive).
     * @param sortBy - The field to sort results by (default: created_at).
     * @param order - The sorting order (ASC or DESC, default: DESC).
     *
     * @returns A list of services with their version count.
     */
    async getServicesWithVersionCount(
        page: number,
        limit: number,
        name?: string,
        sortBy: keyof Service = "created_at",
        order: "ASC" | "DESC" = "DESC",
    ): Promise<ServiceWithVersionCountResponseDto[]> {
        const whereClause = name ? "WHERE service.name ILIKE $3" : "";
        const sql = `
            SELECT 
                service.id, 
                service.name, 
                service.description,
                COALESCE(versionStats.version_count, 0) AS version_count
            FROM service
            LEFT JOIN (
                SELECT service_id, COUNT(id) AS version_count
                FROM version
                GROUP BY service_id
            ) AS versionStats
            ON versionStats.service_id = service.id
            ${whereClause}
            ORDER BY ${sortBy} ${order}
            LIMIT $1 OFFSET $2;
        `;
        const offset = (page - 1) * limit;
        const params = name ? [limit, offset, `%${name}%`] : [limit, offset];

        const results = await this.serviceRepository.query(sql, params);

        return results.map((row: any) =>
            ResponseDtoTransformer.toServiceWithVersionCountDto(row, Number(row.version_count))
        );
    }

    /**
     * Retrieves a service along with its associated versions.
     *
     * @param id  The ID of the service.
     * @returns The service with its associated versions or null if the service does not exist.
     */
    async getServiceWithVersions(id: string): Promise<ServiceWithVersionsResponseDto> {
        const result = await this.serviceRepository.findOne({
            where: { id },
            relations: ["versions"],
        });

        return result ? ResponseDtoTransformer.toServiceDetailDto(result) : null;
    }

    /**
     * Retrieves a service by its ID.
     *
     * @param id - The ID of the service.
     * @returns The service details or null if the service does not exist.
     */
    async getServiceById(id: string): Promise<ServiceResponseDto> {
        const result = await this.serviceRepository.findOne({
            where: { id },
        });

        return result ? ResponseDtoTransformer.toServiceDto(result) : null;
    }

    /**
     * Creates a new service.
     *
     * @param newService - The service details.
     * @returns The created service.
     */
    async createService(newService: Partial<Service>): Promise<ServiceResponseDto> {
        const service = this.serviceRepository.create(newService);

        const result = await this.serviceRepository.save(service);

        return ResponseDtoTransformer.toServiceDto(result);
    }

    /**
     * Updates an existing service.
     *
     * @param id - The ID of the service to update.
     * @param updateData - The updated service details.
     * @returns The updated service or null if the service does not exist.
     */
    async updateService(id: string, updateData: Partial<Service>): Promise<ServiceResponseDto> {
        await this.serviceRepository.update(id, updateData);

        const result = await this.serviceRepository.findOne({ where: { id } });

        return result ? ResponseDtoTransformer.toServiceDto(result) : null;
    }

    /**
     * Deletes a service.
     *
     * @param id - The ID of the service to delete.
     * @returns True if deletion was successful, otherwise false.
     */
    async deleteService(id: string): Promise<boolean> {
        const result = await this.serviceRepository.delete(id);

        return result.affected > 0;
    }
}