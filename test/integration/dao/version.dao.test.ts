import { DataSource } from "typeorm";

import { ServiceDao } from "../../../src/dao/service.dao";
import { VersionDao } from "../../../src/dao/version.dao";
import {cleanTables, setupTestDB, teardownTestDB} from "../../util/setupTestDB";
import { TestUtil } from "../../util/util";

describe("VersionDAO (Integration Test)", () => {
    const mockService = TestUtil.createMockService(TestUtil.generateUUIDString(), new Date());
    const mockVersion = TestUtil.createMockVersion(mockService.id, "V1.0");

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
        await versionDao.createVersion(mockVersion);
    });

    afterEach(async () => {
        await cleanTables(db);
    });

    describe("createVersion", () => {
        it("given new version -> should create version", async () => {
            // Given, When
            const result = await versionDao.createVersion(
                TestUtil.createMockVersion(mockService.id, "V1.1.10")
            );

            // Then
            const expected = {
                id: expect.any(String),
                name: "V1.1.10",
                description: expect.any(String),
                serviceId: mockService.id,
                createdAt: expect.any(Date),
                updatedAt: expect.any(Date),
            };
            expect(result).not.toBeNull();
            expect(result).toEqual(expected);
        });

        it("given new version violate idx_version_name_service constraint -> should do nothing", async () => {
            // Given, When
            const result = await versionDao.createVersion(TestUtil.createMockVersion(mockService.id, "V1.0"));

            // Then
            expect(result).toBeNull();
        });
    });

    describe("getVersionById", () => {
        it("given valid version id -> should return version", async () => {
            // Given
            const versionName = "new version";
            const version = await versionDao.createVersion(
                TestUtil.createMockVersion(mockService.id, "new version")
            );
            expect(version).not.toBeNull();

            // When
            const result = await versionDao.getVersionById(version.id);

            // Then
            const expected = {
                id: version.id,
                name: versionName,
                description: version.description,
                serviceId: mockService.id,
                createdAt: version.createdAt,
                updatedAt: version.updatedAt,
            };
            expect(result).not.toBeNull();
            expect(result).toEqual(expected);
        });

        it("given unknown version id -> should return version", async () => {
            // Given, When
            const result = await versionDao.getVersionById(TestUtil.generateUUIDString());

            // Then
            expect(result).toBeNull();
        });
    });

    describe("updateVersion", () => {
        it("given valid version id -> should update version", async () => {
            // Given
            const oldVersion = await versionDao.createVersion(
                TestUtil.createMockVersion(mockService.id, "version name")
            );
            const newVersionName = "new name";

            // When
            const result = await versionDao.updateVersion(
                oldVersion.id,
                { name: newVersionName },
            );

            // Then
            const expected = {
                id: oldVersion.id,
                name: newVersionName,
                description: oldVersion.description,
                serviceId: mockService.id,
                createdAt: oldVersion.createdAt,
                updatedAt: expect.any(Date),
            };
            expect(result).not.toBeNull();
            expect(result).toEqual(expected);
            expect(result.updatedAt.getTime()).toBeGreaterThan(oldVersion.updatedAt.getTime());
        });

        it("given unknown version id -> should do nothing version", async () => {
            // Given, When
            const result = await versionDao.updateVersion(
                TestUtil.generateUUIDString(),
                { name: "new name" },
            );

            // Then
            expect(result).toBeNull();
        });
    });

    describe("deleteVersion", () => {
        it("given valid version id -> should delete version", async () => {
            // Given, When
            const result = await versionDao.deleteVersion(mockVersion.id);

            // Then
            expect(result).toBeTruthy();
            const versionResult = await versionDao.getVersionById(mockVersion.id);
            expect(versionResult).toBeNull();
        });

        it("given unknown version id -> should return false", async () => {
            // Given, When
            const result = await versionDao.deleteVersion(TestUtil.generateUUIDString());

            // Then
            expect(result).toBeFalsy();
        });
    });
});
