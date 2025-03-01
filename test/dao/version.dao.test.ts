import { DataSource } from "typeorm";

import { ServiceDao } from "../../src/dao/service.dao";
import { VersionDao } from "../../src/dao/version.dao";
import { setupTestDB, teardownTestDB } from "../util/setupTestDB";
import { TestUtil } from "../util/util";

describe("VersionDAO (Integration Test)", () => {
    const mockService = TestUtil.createMockService(TestUtil.generateUUIDString(), new Date());

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
        await serviceDao.createService(mockService);
    });

    afterEach(async () => {
        await db.query("DELETE FROM version;");
        await db.query("DELETE FROM service;");
    });

    describe("createVersion", () => {
        it("given new version -> should create version", async () => {
            const result = await versionDao.createVersion(mockService.id, "V1.1.10");

            const expected = {
                id: expect.any(String),
                name: "V1.1.10",
                serviceId: mockService.id,
                createdAt: expect.any(Date),
                updatedAt: expect.any(Date),
            };
            expect(result).not.toBeNull();
            expect(result).toEqual(expected);
        });

        it("given new version violate idx_version_name_service constraint -> should do nothing", async () => {
            await versionDao.createVersion(mockService.id, "V1.1.10");
            const result = await versionDao.createVersion(mockService.id, "V1.1.10");

            expect(result).toBeNull();
        });
    });

    describe("getVersionById", () => {
        it("given valid version id -> should return version", async () => {
            const versionName = "new version";
            const version = await versionDao.createVersion(mockService.id, "new version");
            expect(version).not.toBeNull();

            const result = await versionDao.getVersionById(version.id);

            const expected = {
                id: version.id,
                name: versionName,
                serviceId: mockService.id,
                createdAt: version.createdAt,
                updatedAt: version.updatedAt,
            };
            expect(result).not.toBeNull();
            expect(result).toEqual(expected);
        });

        it("given unknown version id -> should return version", async () => {
            const result = await versionDao.getVersionById(TestUtil.generateUUIDString());

            expect(result).toBeNull();
        });
    });

    describe("updateVersion", () => {
        it("given valid version id -> should update version", async () => {
            const oldVersion = await versionDao.createVersion(mockService.id, "version name");
            const newVersionName = "new name";

            const result = await versionDao.updateVersion(oldVersion.id, newVersionName);

            const expected = {
                id: oldVersion.id,
                name: newVersionName,
                serviceId: mockService.id,
                createdAt: oldVersion.createdAt,
                updatedAt: expect.any(Date),
            };
            expect(result).not.toBeNull();
            expect(result).toEqual(expected);
            expect(result.updatedAt.getTime()).toBeGreaterThan(oldVersion.updatedAt.getTime());
        });

        it("given unknown version id -> should do nothing version", async () => {
            const result = await versionDao.updateVersion(TestUtil.generateUUIDString(), "new name");

            expect(result).toBeNull();
        });
    });

    describe("deleteVersion", () => {
        it("given valid version id -> should delete version", async () => {
            // Given
            const service = TestUtil.createMockService("new service");
            await serviceDao.createService(service);
            const version = await versionDao.createVersion(service.id, "V1.0");

            // When
            const result = await versionDao.deleteVersion(version.id);

            // Then
            expect(result).toBeTruthy();
            const versionResult = await versionDao.getVersionById(version.id);
            expect(versionResult).toBeNull();
        });

        it("given unknown version id -> should return false", async () => {
            // Given
            const service = TestUtil.createMockService("new service");
            await serviceDao.createService(service);
            await versionDao.createVersion(service.id, "V1.0");

            // When
            const result = await versionDao.deleteVersion(TestUtil.generateUUIDString());

            // Then
            expect(result).toBeFalsy();
        });
    });
});
