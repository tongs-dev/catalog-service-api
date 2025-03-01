import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import {
    ServiceDetailResponseDto,
    ServiceResponseDto,
    ServiceWithVersionCountResponseDto
} from "../dto/service-response.dto";
import { DtoTransformer } from "../dto/dto-transformer";
import { Service } from "../entity/service.entity";

@Injectable()
export class ServiceDao {

    constructor(
        @InjectRepository(Service)
        private readonly serviceRepository: Repository<Service>,
    ) {}

    async getAllServicesWithVersionCount(
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
            DtoTransformer.toServiceWithVersionCountDto(row, Number(row.version_count))
        );
    }

    async getServiceDetail(id: string): Promise<ServiceDetailResponseDto> {
        const result = await this.serviceRepository.findOne({
            where: { id },
            relations: ["versions"],
        });

        return result ? DtoTransformer.toServiceDetailDto(result) : null;
    }

    async getServiceById(id: string): Promise<ServiceResponseDto> {
        const result = await this.serviceRepository.findOne({
            where: { id },
        });

        return result ? DtoTransformer.toServiceDto(result) : null;
    }

    async createService(newService: Partial<Service>): Promise<ServiceResponseDto> {
        const service = this.serviceRepository.create(newService);

        const result = await this.serviceRepository.save(service);

        return DtoTransformer.toServiceDto(result);
    }

    async updateService(id: string, updateData: Partial<Service>): Promise<ServiceResponseDto> {
        await this.serviceRepository.update(id, updateData);

        const result = await  this.serviceRepository.findOne({ where: { id } });

        return result ? DtoTransformer.toServiceDto(result) : null;
    }

    async deleteService(id: string): Promise<boolean> {
        const result = await this.serviceRepository.delete(id);

        return result.affected > 0;
    }
}