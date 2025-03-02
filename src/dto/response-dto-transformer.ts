import {Service} from "../entity/service.entity";
import {Version} from "../entity/version.entity";
import {
    ServiceResponseDto,
    ServiceVersionResponseDto,
    ServiceWithVersionCountResponseDto,
    ServiceWithVersionsResponseDto,
    VersionResponseDto
} from "./response.dto";

/**
 * Transforms a database entity into a response dto entity.
 */
export class ResponseDtoTransformer {
    static toServiceWithVersionCountDto(service: Service, count: number): ServiceWithVersionCountResponseDto {
        return {
            id: service.id,
            name: service.name,
            description: service.description,
            versionCount: count ?? 0, // Default to 0 if undefined
        };
    }

    static toServiceDetailDto(service: Service): ServiceWithVersionsResponseDto {
        return {
            ...ResponseDtoTransformer.toServiceDto(service),
            versions: (service.versions ?? []).map(ResponseDtoTransformer.toServiceVersionDto),
        };
    }

    static toServiceVersionDto(version: Version): ServiceVersionResponseDto {
        return {
            id: version.id,
            name: version.name,
            description: version.description,
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
            description: version.description,
            createdAt: version.created_at,
            updatedAt: version.updated_at,
            serviceId: version.service.id,
        };
    }
}