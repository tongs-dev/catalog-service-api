import { Service } from "../../src/entity/service.entity";
import { Version } from "../../src/entity/version.entity";
import { ServiceWithVersionCountResponseDto } from "../../src/dto/response.dto";

/**
 * Helper methods used to mock request / response objects.
 */
export class TestUtil {
    static generateUUIDString = () => {
        return crypto.randomUUID();
    };

    static createMockService(name: string, createAt: Date = new Date()): Service {
        return {
            id: TestUtil.generateUUIDString(),
            name,
            description:  TestUtil.generateUUIDString(),
            created_at: createAt,
        } as Service;
    }

    static createMockVersion(serviceId: string, name: string, createAt: Date = new Date()): Version {
        return {
            id: TestUtil.generateUUIDString(),
            service: {id: serviceId},
            name,
            description:  TestUtil.generateUUIDString(),
            created_at: createAt,
        } as Version;
    }

    static createMockServiceWithVersionCountResponse(): ServiceWithVersionCountResponseDto {
        return {
            id: TestUtil.generateUUIDString(),
            name: TestUtil.generateUUIDString(),
            description: "Description",
            versionCount: Math.random(),
        } as ServiceWithVersionCountResponseDto;
    }

    static createMockServiceWithVersionsResponse() {
        return {
            id: TestUtil.generateUUIDString(),
            name: TestUtil.generateUUIDString(),
            description: "Description",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            versions: [
                TestUtil.createMockServiceVersionResponse(),
                TestUtil.createMockServiceVersionResponse(),
            ],
        };
    }

    static createMockVersionResponse(serviceId: string, name: string) {
        return {
            ...TestUtil.createMockServiceVersionResponse(name),
            serviceId,
        };
    }

    private static createMockServiceVersionResponse(name ?: string) {
        return {
            id: TestUtil.generateUUIDString(),
            name:name ?? TestUtil.generateUUIDString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
    }
}
