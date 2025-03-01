import { DataSource } from "typeorm";

import { ServiceDao } from "../../../src/dao/service.dao";
import { VersionDao } from "../../../src/dao/version.dao";
import { ResponseDtoTransformer } from "../../../src/dto/response-dto-transformer";
import { setupTestDB, teardownTestDB } from "../../util/setupTestDB";
import { TestUtil } from "../../util/util";

describe("serviceDao (Integration Test)", () => {
    const mockServiceA = TestUtil.createMockService("Service A", new Date());
    const mockServiceB = TestUtil.createMockService("Service B",
        new Date(mockServiceA.created_at.getTime() + 1000)
    );

    let db: DataSource;
    let serviceDao: ServiceDao;
    let versionDao: VersionDao;

    beforeAll(async () => {
        ({ db, serviceDao, versionDao } = await setupTestDB());
    });

    afterAll(async () => {
        await teardownTestDB();
    });

    beforeEach(async () => {
        await serviceDao.createService(mockServiceA);
        await versionDao.createVersion(mockServiceA.id, "V1.0");
        await versionDao.createVersion(mockServiceA.id, "V2.0");

        await serviceDao.createService(mockServiceB);
        await versionDao.createVersion(mockServiceB.id, "V1.0");
    });

    afterEach(async () => {
        await db.query("DELETE FROM version;");
        await db.query("DELETE FROM service;");
    });

    describe("getAllServicesWithVersionCount", () => {
        it("should return all services", async () => {
            const result = await serviceDao.getAllServicesWithVersionCount(1, 10);

            expect(result).toHaveLength(2);

            // order matters
            const expected = [
                ResponseDtoTransformer.toServiceWithVersionCountDto(mockServiceB, 1),
                ResponseDtoTransformer.toServiceWithVersionCountDto(mockServiceA, 2),
            ];
            expect(result).toEqual(expected);
        });

        it("given large offset -> should return nothing", async () => {
            const result = await serviceDao.getAllServicesWithVersionCount(10, 10);

            expect(result).toHaveLength(0);
        });

        it("given limit -> should return subset", async () => {
            const result = await serviceDao.getAllServicesWithVersionCount(1, 1);

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual(ResponseDtoTransformer.toServiceWithVersionCountDto(mockServiceB, 1));
        });

        it("given sort by and order by -> should return services in sorted order", async () => {
            const result = await serviceDao.getAllServicesWithVersionCount(1, 10, null, "name", "ASC");

            expect(result).toHaveLength(2);

            // order matters
            const expected = [
                ResponseDtoTransformer.toServiceWithVersionCountDto(mockServiceA, 2),
                ResponseDtoTransformer.toServiceWithVersionCountDto(mockServiceB, 1),
            ];
            expect(result).toEqual(expected);
        });

        it("given unknown service name -> should return nothing", async () => {
            const result = await serviceDao.getAllServicesWithVersionCount(1, 10, "unknown name");

            expect(result).toHaveLength(0);
        });

        it("given service name -> should return all matched services", async () => {
            const mockSameNameService = TestUtil.createMockService("Service AA");

            await serviceDao.createService(mockSameNameService);

            const result = await serviceDao.getAllServicesWithVersionCount(1, 10, "A");
            expect(result).toHaveLength(2);
            expect(result[0]).toEqual(ResponseDtoTransformer.toServiceWithVersionCountDto(mockSameNameService, 0));
            expect(result[1]).toEqual(ResponseDtoTransformer.toServiceWithVersionCountDto(mockServiceA, 2));
        });
    });

    describe("getServiceDetail", () => {
        it("given service id -> should return service detail", async () => {
            const result = await serviceDao.getServiceDetail(mockServiceA.id);

            const expected = {
                id: mockServiceA.id,
                name: mockServiceA.name,
                description: mockServiceA.description,
                createdAt: expect.any(Date),
                updatedAt: expect.any(Date),
                versions: [
                    {
                        id: expect.any(String),
                        name: "V1.0",
                        createdAt: expect.any(Date),
                        updatedAt: expect.any(Date),
                    },
                    {
                        id: expect.any(String),
                        name: "V2.0",
                        createdAt: expect.any(Date),
                        updatedAt: expect.any(Date),
                    },
                ],
            };
            expect(result).not.toBeNull();
            expect(result).toEqual(expected);
        });

        it("given unknown service id -> should return nothing", async () => {
            const result = await serviceDao.getServiceDetail(TestUtil.generateUUIDString());

            expect(result).toBeNull();
        });
    });

    describe("getServiceById", () => {
        it("given service id -> should return service", async () => {
            const result = await serviceDao.getServiceById(mockServiceA.id);

            const expected = {
                id: mockServiceA.id,
                name: mockServiceA.name,
                description: mockServiceA.description,
                createdAt: expect.any(Date),
                updatedAt: expect.any(Date),
            };
            expect(result).not.toBeNull();
            expect(result).toEqual(expected);
        });

        it("given unknown service id -> should return nothing", async () => {
            const result = await serviceDao.getServiceDetail(TestUtil.generateUUIDString());

            expect(result).toBeNull();
        });
    });

    describe("createService", () => {
        it("given new service -> should create service", async () => {
            const name = "service name";
            const description = "service desp";
            const result = await serviceDao.createService({name, description});

            const expected = {
                id: expect.any(String),
                name,
                description,
                createdAt: expect.any(Date),
                updatedAt: expect.any(Date),
            };
            expect(result).not.toBeNull();
            expect(result).toEqual(expected);
        });
    });

    describe("updateService", () => {
        it("given updated service -> should update service", async () => {
            const newName = "new name";
            const oldService = await serviceDao.getServiceDetail(mockServiceB.id);
            const result = await serviceDao.updateService(oldService.id, {name: newName});

            const expected = {
                id: mockServiceB.id,
                name: newName,
                description: mockServiceB.description,
                createdAt: oldService.createdAt,
                updatedAt: expect.any(Date),
            };
            expect(result).not.toBeNull();
            expect(result).toEqual(expected);
            expect(result.updatedAt.getTime()).toBeGreaterThan(oldService.updatedAt.getTime());
        });

        it("given unknown service id -> should return nothing", async () => {
            const result = await serviceDao.updateService(TestUtil.generateUUIDString(), {name: "new name"});

            expect(result).toBeNull();
        });
    });

    describe("deleteService", () => {
        it("given valid service id -> should cascade delete service and versions", async () => {
            // Given
            const service = TestUtil.createMockService("new service");
            await serviceDao.createService(service);
            const version = await versionDao.createVersion(service.id, "V1.0");

            // When
            const result = await serviceDao.deleteService(service.id);

            // Then
            expect(result).toBeTruthy();
            const serviceResult = await serviceDao.getServiceDetail(service.id);
            expect(serviceResult).toBeNull();
            const versionResult = await versionDao.getVersionById(version.id);
            expect(versionResult).toBeNull();
        });

        it("given unknown service id -> should return false", async () => {
            // Given
            const service = TestUtil.createMockService("new service");
            await serviceDao.createService(service);

            // When
            const result = await serviceDao.deleteService(TestUtil.generateUUIDString());

            // Then
            expect(result).toBeFalsy();
        });
    });
});
