import request from "supertest";
import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";

import { VersionController } from "../../../src/controller/version.controller";
import { VersionDao } from "../../../src/dao/version.dao";
import { CreateVersionRequestDto, UpdateVersionRequestDto } from "../../../src/dto/request.dto";
import { TestUtil } from "../../util/util";

describe("VersionController (Unit Test)", () => {
    const BASE_URL = "/versions";
    const URL_WITH_ID = (id: string): string => `/versions/${id}`;

    let app: INestApplication;
    let versionDao: VersionDao;

    const mockVersionDao = {
        createVersion: jest.fn(),
        getVersionById: jest.fn(),
        updateVersion: jest.fn(),
        deleteVersion: jest.fn(),
    };

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [VersionController],
            providers: [
                {
                    provide: VersionDao,
                    useValue: mockVersionDao,
                },
            ],
        }).compile();

        app = module.createNestApplication();
        await app.init();

        versionDao = module.get<VersionDao>(VersionDao);
    });

    afterAll(async () => {
        await app.close();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("POST /versions", () => {
        it("should create a version and return 201", async () => {
            // Given
            const serviceId = TestUtil.generateUUIDString();
            const name = "Version 1.0";
            const description = "description";
            const expectedResponse = TestUtil.createMockVersionResponse(serviceId, name);
            mockVersionDao.createVersion.mockResolvedValue(expectedResponse);

            // When
            const response = await request(app.getHttpServer())
                .post(BASE_URL)
                .send({ serviceId, name, description })
                .expect(201);

            // Then
            expect(response.body).toEqual(expectedResponse);
            expect(versionDao.createVersion).toHaveBeenCalledWith({ name, description, service: {id: serviceId} });
        });

        it("given payload with missing field -> should return 400", async () => {
            // Given
            const serviceId = TestUtil.generateUUIDString();
            const name = "Version 1.0";
            const expectedResponse = TestUtil.createMockVersionResponse(serviceId, name);
            mockVersionDao.createVersion.mockResolvedValue(expectedResponse);

            // When
            const response = await request(app.getHttpServer())
                .post(BASE_URL)
                .send({ serviceId, name })
                .expect(400);

            // Then
            expect(response.body).toEqual({
                statusCode: 400,
                message: ["description must be between 1 and 500 characters", "description must be a string"],
                error: "Bad Request",
            });
            expect(versionDao.createVersion).not.toHaveBeenCalled();
        });

        it("given duplicate version name -> should return 409", async () => {
            // Given
            const createVersionDto: CreateVersionRequestDto = {
                serviceId: TestUtil.generateUUIDString(),
                name: "Version 1.0",
                description: "description",
            };
            mockVersionDao.createVersion.mockResolvedValue(null);

            // When
            const response = await request(app.getHttpServer())
                .post(BASE_URL)
                .send(createVersionDto)
                .expect(409);

            // Then
            expect(response.body.message).toBe("Duplicate version name for this service");
        });

        it("given internal server error -> should return 500", async () => {
            // Given
            const createVersionDto: CreateVersionRequestDto = {
                serviceId: TestUtil.generateUUIDString(),
                name: "Version 1.0",
                description: "description",
            };
            mockVersionDao.createVersion.mockRejectedValue(new Error("Unexpected error"));

            // When
            const response = await request(app.getHttpServer())
                .post(BASE_URL)
                .send(createVersionDto)
                .expect(500);

            // Then
            expect(response.body).toEqual({
                statusCode: 500,
                message: "Internal server error",
            });
        });
    });

    describe("GET /versions/:id", () => {
        it("should retrieve a version and return 200", async () => {
            // Given
            const versionId = TestUtil.generateUUIDString();
            const expectedResponse = TestUtil.createMockVersionResponse(
                TestUtil.generateUUIDString(),
                "V1.0",
            );
            mockVersionDao.getVersionById.mockResolvedValue(expectedResponse);

            // When
            const response = await request(app.getHttpServer())
                .get(URL_WITH_ID(versionId))
                .expect(200);

            // Then
            expect(response.body).toEqual(expectedResponse);
            expect(versionDao.getVersionById).toHaveBeenCalledWith(versionId);
        });

        it("given unknown version id -> should return 404", async () => {
            // Given
            const unknownId = "f016e69f-e76d-4968-8100-77e4a0bff2c9";
            mockVersionDao.getVersionById.mockResolvedValue(null);

            // When
            const response = await request(app.getHttpServer())
                .get(URL_WITH_ID(unknownId))
                .expect(404);

            // Then
            expect(response.body).toEqual({
                statusCode: 404,
                message: `Version with ID ${unknownId} not found`,
                error: "Not Found",
            });
        });

        it("given invalid version id -> should return 400", async () => {
            // Given
            const invalidId = "12345";

            // When
            const response = await request(app.getHttpServer())
                .get(URL_WITH_ID(invalidId))
                .expect(400);

            // Then
            expect(response.body).toEqual({
                statusCode: 400,
                message: ["invalid ID format, must be a UUID v4"],
                error: "Bad Request",
            });
            expect(versionDao.getVersionById).not.toHaveBeenCalled();
        });

        it("given internal server error -> should return 500", async () => {
            // Given
            mockVersionDao.getVersionById.mockRejectedValue(new Error("Database error"));

            // When
            const response = await request(app.getHttpServer())
                .get(URL_WITH_ID(TestUtil.generateUUIDString()))
                .expect(500);

            // Then
            expect(response.body.message).toBe("Internal server error");
        });
    });

    describe("PATCH /versions/:id", () => {
        it("should update a version and return 200", async () => {
            // Given
            const versionId = TestUtil.generateUUIDString();
            const newVersionName = "Version 2.0";
            const updateVersionDto: UpdateVersionRequestDto = { name: newVersionName };
            const expectedResponse = TestUtil.createMockVersionResponse(
                TestUtil.generateUUIDString(),
                newVersionName,
            );
            mockVersionDao.updateVersion.mockResolvedValue(expectedResponse);

            // When
            const response = await request(app.getHttpServer())
                .patch(URL_WITH_ID(versionId))
                .send(updateVersionDto)
                .expect(200);

            // Then
            expect(response.body).toEqual(expectedResponse);
            expect(versionDao.updateVersion).toHaveBeenCalledWith(versionId, { name: newVersionName });
        });

        it("given unknown path param -> should return 404", async () => {
            // Given
            const unknownId = TestUtil.generateUUIDString();
            mockVersionDao.updateVersion.mockResolvedValue(null);

            // When
            const response = await request(app.getHttpServer())
                .patch(URL_WITH_ID(unknownId))
                .send({ name: "Version 2.0" })
                .expect(404);

            // Then
            expect(response.body).toEqual({
                statusCode: 404,
                message: `Version with ID ${unknownId} not found`,
                error: "Not Found",
            });
            expect(versionDao.updateVersion).toHaveBeenCalledTimes(1);
        });

        it("given invalid path param -> should return 400", async () => {
            // Given
            const invalidId = "invalid-uuid";
            const updateData = {
                name: "Valid Name",
            };

            // When
            const response = await request(app.getHttpServer())
                .patch(URL_WITH_ID(invalidId))
                .send(updateData)
                .expect(400);

            // Then
            expect(response.body).toEqual({
                statusCode: 400,
                message: ["invalid ID format, must be a UUID v4"],
                error: "Bad Request",
            });
            expect(versionDao.updateVersion).not.toHaveBeenCalled();
        });

        it("given invalid payload -> should return 400", async () => {
            // Given
            const invalidPayload = {
                name: "a".repeat(501),
            };

            // When
            const response = await request(app.getHttpServer())
                .patch(URL_WITH_ID(TestUtil.generateUUIDString()))
                .send(invalidPayload)
                .expect(400);

            // Then
            expect(response.body).toEqual({
                statusCode: 400,
                message: ["version name must be between 1 and 255 characters"],
                error: "Bad Request",
            });
            expect(versionDao.updateVersion).not.toHaveBeenCalled();
        });

        it("given payload containing extra field -> should return 400", async () => {
            // Given
            const invalidPayload = {
                extra_col: "123",
                name: "new name",
            };

            // When
            const response = await request(app.getHttpServer())
                .patch(URL_WITH_ID(TestUtil.generateUUIDString()))
                .send(invalidPayload)
                .expect(400);

            // Then
            expect(response.body).toEqual({
                statusCode: 400,
                message: ["property extra_col should not exist"],
                error: "Bad Request",
            });
            expect(versionDao.updateVersion).not.toHaveBeenCalled();
        });

        it("given internal server error -> should return 500", async () => {
            // Given
            const versionData: UpdateVersionRequestDto = {
                name: "Test Service",
            };
            mockVersionDao.updateVersion.mockRejectedValue(new Error("Unexpected error"));

            // When
            const response = await request(app.getHttpServer())
                .patch(URL_WITH_ID(TestUtil.generateUUIDString()))
                .send(versionData)
                .expect(500);

            // Then
            expect(response.body).toEqual({
                statusCode: 500,
                message: "Internal server error",
            });
            expect(versionDao.updateVersion).toHaveBeenCalledTimes(1);
        });
    });

    describe("DELETE /versions/:id", () => {
        it("should delete a service and return 204", async () => {
            // Given
            const id = TestUtil.generateUUIDString();
            mockVersionDao.deleteVersion.mockResolvedValue(true);

            // When
            const response = await request(app.getHttpServer())
                .delete(URL_WITH_ID(id))
                .expect(204);

            // Then
            expect(versionDao.deleteVersion).toHaveBeenCalledWith(id);
        });

        it("given unknown path param -> should return 404", async () => {
            // Given
            const unknownId = TestUtil.generateUUIDString();
            mockVersionDao.deleteVersion.mockResolvedValue(false);

            // When
            const response = await request(app.getHttpServer())
                .delete(URL_WITH_ID(unknownId))
                .expect(404);

            // Then
            expect(response.body).toEqual({
                statusCode: 404,
                message: `Version with ID ${unknownId} not found`,
                error: "Not Found",
            });
            expect(versionDao.deleteVersion).toHaveBeenCalledTimes(1);
        });

        it("given invalid path param -> should return 400", async () => {
            // Given
            const invalidId = "invalid-uuid";

            // When
            const response = await request(app.getHttpServer())
                .delete(URL_WITH_ID(invalidId))
                .expect(400);

            // Then
            expect(response.body).toEqual({
                statusCode: 400,
                message: ["invalid ID format, must be a UUID v4"],
                error: "Bad Request",
            });
            expect(versionDao.deleteVersion).not.toHaveBeenCalled();
        });

        it("given internal server error -> should return 500", async () => {
            // Given
            mockVersionDao.deleteVersion.mockRejectedValue(new Error("Unexpected error"));

            // When
            const response = await request(app.getHttpServer())
                .delete(URL_WITH_ID(TestUtil.generateUUIDString()))
                .expect(500);

            // Then
            expect(response.body).toEqual({
                statusCode: 500,
                message: "Internal server error",
            });
            expect(versionDao.deleteVersion).toHaveBeenCalledTimes(1);
        });
    });
});