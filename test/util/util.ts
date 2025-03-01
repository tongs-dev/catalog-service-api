import {Service} from "../../src/entity/service.entity";
import {
    ServiceDetailResponseDto,
    ServiceResponseDto, ServiceVersionResponseDto,
    ServiceWithVersionCountResponseDto, VersionResponseDto
} from "../../src/dto/response.dto";

export class TestUtil {
    static createMockService(name: string, createAt: Date = new Date()): Service {
        return {
            id: TestUtil.generateUUIDString(),
            name,
            description:  TestUtil.generateUUIDString(),
            created_at: createAt,
        } as Service;
    }

    static generateUUIDString = () => {
        return crypto.randomUUID();
    }

    static createMockServiceWithVersionCountResponse(): ServiceWithVersionCountResponseDto {
        return {
            id: TestUtil.generateUUIDString(),
            name: TestUtil.generateUUIDString(),
            description: "Description",
            versionCount: Math.random(),
        } as ServiceWithVersionCountResponseDto;
    }

    static createMockServiceDetailResponse() {
        return {
            id: TestUtil.generateUUIDString(),
            name: TestUtil.generateUUIDString(),
            description: "Description",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            versions: [
                TestUtil.createMockVersionResponse(),
                TestUtil.createMockVersionResponse(),
            ],
        };
    }

    static createMockVersionResponse() {
        return {
            id: TestUtil.generateUUIDString(),
            name:TestUtil.generateUUIDString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }
    }
}
