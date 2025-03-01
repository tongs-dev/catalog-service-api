import {Service} from "../entity/service.entity";
import {
    ServiceDetailResponseDto, ServiceResponseDto,
    ServiceVersionResponseDto,
    ServiceWithVersionCountResponseDto,
    VersionResponseDto
} from "./service-response.dto";
import {Version} from "../entity/version.entity";

export class DtoTransformer {
    static toServiceWithVersionCountDto(service: Service, count: number): ServiceWithVersionCountResponseDto {
        return {
            id: service.id,
            name: service.name,
            description: service.description,
            versionCount: count ?? 0, // Default to 0 if undefined
        };
    }

    static toServiceDetailDto(service: Service): ServiceDetailResponseDto {
        return {
            ...DtoTransformer.toServiceDto(service),
            versions: (service.versions ?? []).map(DtoTransformer.toServiceVersionDto),
        };
    }

    static toServiceVersionDto(version: Version): ServiceVersionResponseDto {
        return {
            id: version.id,
            name: version.name,
            createdAt: version.created_at,
            updatedAt: version.updated_at,
        };
    }

    static toServiceDto(service: Service): ServiceResponseDto {
        return {
            id: service.id,
            name: service.name,
            description: service.description,
            createdAt: service.created_at,
            updatedAt: service.updated_at,
        };
    }

    static toVersionDto(version: Version): VersionResponseDto {
        return {
            id: version.id,
            name: version.name,
            createdAt: version.created_at,
            updatedAt: version.updated_at,
            serviceId: version.service.id,
        };
    }
}