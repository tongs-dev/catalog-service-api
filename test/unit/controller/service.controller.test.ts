import request from "supertest";
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";

import { ServiceController } from "../../../src/controller/service.controller";
import { ServiceDao } from "../../../src/dao/service.dao";
import { ServiceWithVersionCountResponseDto } from "../../../src/dto/response.dto";
import {
    CreateServiceRequestDto,
    ServiceRequestPathParamDto,
    UpdateServiceRequestDto
} from "../../../src/dto/request.dto";
import {TestUtil} from "../../util/util";

describe("ServiceController (Unit Test)", () => {
    const BASE_API_URL = "/services";

    let app: INestApplication;
    let serviceDao: ServiceDao;

    const mockServiceDao = {
        getServicesWithVersionCount: jest.fn(),
        getServiceWithVersions: jest.fn(),
        createService: jest.fn(),
        updateService: jest.fn(),
        deleteService: jest.fn(),
    };

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ServiceController],
            providers: [
                {
                    provide: ServiceDao,
                    useValue: mockServiceDao,
                },
            ],
        }).compile();

        app = module.createNestApplication();
        await app.init();

        serviceDao = module.get<ServiceDao>(ServiceDao);
    });

    afterAll(async () => {
        await app.close();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("GET /services", () => {
        it("should return an array of services with version count", async () => {
            // Given
            const query = {
                page: 1,
                limit: 10,
                name: "test",
                sortBy: "name",
                order: "asc",
            };
            const expectedResponse: ServiceWithVersionCountResponseDto[] = [
                TestUtil.createMockServiceWithVersionCountResponse(),
                TestUtil.createMockServiceWithVersionCountResponse(),
            ];
            mockServiceDao.getServicesWithVersionCount.mockResolvedValue(expectedResponse);

            // When
            const response = await request(app.getHttpServer())
                .get(BASE_API_URL)
                .query(query)
                .expect(200);

            // Then
            expect(response.body).toEqual(expectedResponse);
            expect(serviceDao.getServicesWithVersionCount).toHaveBeenCalledWith(
                query.page,
                query.limit,
                query.name,
                query.sortBy,
                query.order.toUpperCase(),
            );
        });

        it("given invalid query param -> should return 400", async () => {
            // Given
            const query = {
                sortBy: "unknown_field",
                limit: 10000,
            };
            const expectedResponse = {
                "error": "Bad Request",
                "message": ["limit cannot exceed 100", "invalid sortBy field"],
                "statusCode": 400
            };

            // When
            const response = await request(app.getHttpServer())
                .get(BASE_API_URL)
                .query(query)
                .expect(400);

            // Then
            expect(response.body).toEqual(expectedResponse);
            expect(serviceDao.getServicesWithVersionCount).not.toHaveBeenCalled();
        });

        it("given internal server error -> should return 500", async () => {
            // Given
            mockServiceDao.getServicesWithVersionCount.mockRejectedValue(new Error("Unexpected error"));

            // When
            const response = await request(app.getHttpServer()).get(BASE_API_URL).expect(500);

            // Then
            expect(response.body).toEqual({
                statusCode: 500,
                message: "Internal server error",
            });
            expect(serviceDao.getServicesWithVersionCount).toHaveBeenCalledTimes(1);
        });
    });

    describe("GET /services/:id/versions", () => {
        const API_URL = (id: string): string => `/services/${id}/versions`;

        it("should return service with versions in detail", async () => {
            // Given
            const expectedResponse = TestUtil.createMockServiceWithVersionsResponse();
            mockServiceDao.getServiceWithVersions.mockResolvedValue(expectedResponse);

            // When
            const response = await request(app.getHttpServer())
                .get(API_URL(expectedResponse.id))
                .expect(200);

            // Then
            expect(response.body).toEqual(expectedResponse);
            expect(serviceDao.getServiceWithVersions).toHaveBeenCalledWith(expectedResponse.id);
        });

        it("given unknown service id -> should return 404", async () => {
            // Given
            const unknownId = "f016e69f-e76d-4968-8100-77e4a0bff2c9";
            mockServiceDao.getServiceWithVersions.mockResolvedValue(null);

            // When
            const response = await request(app.getHttpServer())
                .get(API_URL(unknownId))
                .expect(404);

            // Then
            expect(response.body).toEqual({
                statusCode: 404,
                message: `Service with ID ${unknownId} not found`,
                error: "Not Found",
            });
            expect(serviceDao.getServiceWithVersions).toHaveBeenCalledWith(unknownId);
        });

        it("given invalid service id -> should return 400", async () => {
            // Given
            const invalidId = "12345";

            // When
            const response = await request(app.getHttpServer())
                .get(API_URL(invalidId))
                .expect(400);

            // Then
            expect(response.body).toEqual({
                statusCode: 400,
                message: ["invalid ID format, must be a UUID v4"],
                error: "Bad Request",
            });
            expect(serviceDao.getServiceWithVersions).not.toHaveBeenCalled();
        });

        it("given internal server error -> should return 500", async () => {
            // Given
            mockServiceDao.getServiceWithVersions.mockRejectedValue(new Error("Unexpected error"));

            // When
            const response = await request(app.getHttpServer())
                .get(API_URL(TestUtil.generateUUIDString()))
                .expect(500);

            // Then
            expect(response.body).toEqual({
                statusCode: 500,
                message: "Internal server error",
            });
            expect(serviceDao.getServiceWithVersions).toHaveBeenCalledTimes(1);
        });
    });

    describe("POST /services", () => {
        it("should create a service and return 201", async () => {
            // Given
            const serviceData: CreateServiceRequestDto = {
                name: "Test Service",
                description: "This is a test service description",
            };
            const expectedResponse = {
                id: TestUtil.generateUUIDString(),
                ...serviceData
            };
            mockServiceDao.createService.mockResolvedValue(expectedResponse);

            // When
            const response = await request(app.getHttpServer())
                .post(BASE_API_URL)
                .send(serviceData)
                .expect(201);

            // Then
            expect(response.body).toEqual(expectedResponse);
            expect(serviceDao.createService).toHaveBeenCalledWith(serviceData);
        });

        it("given payload containing extra field -> should return 400", async () => {
            // Given
            const invalidPayload = {
                id: "123",
                name: "Test Service",
                description: "This is a test service description",
            };

            // When
            const response = await request(app.getHttpServer())
                .post(BASE_API_URL)
                .send(invalidPayload)
                .expect(400);

            // Then
            expect(response.body).toEqual({
                statusCode: 400,
                message: ["property id should not exist"],
                error: "Bad Request",
            });
            expect(serviceDao.createService).not.toHaveBeenCalled();
        });

        it("given payload containing invalid field -> should return 400", async () => {
            // Given
            const invalidPayload = {
                name: "a",
                description: "This is a test service description",
            };

            // When
            const response = await request(app.getHttpServer())
                .post(BASE_API_URL)
                .send(invalidPayload)
                .expect(400);

            // Then
            expect(response.body).toEqual({
                statusCode: 400,
                message: ["name must be between 3 and 255 characters"],
                error: "Bad Request",
            });
            expect(serviceDao.createService).not.toHaveBeenCalled();
        });

        it("given payload with missing field -> should return 400", async () => {
            // Given
            const invalidPayload = {
                name: "service to create",
            };

            // When
            const response = await request(app.getHttpServer())
                .post(BASE_API_URL)
                .send(invalidPayload)
                .expect(400);

            // Then
            expect(response.body).toEqual({
                statusCode: 400,
                message: ["description must be between 1 and 500 characters", "description must be a string"],
                error: "Bad Request",
            });
            expect(serviceDao.createService).not.toHaveBeenCalled();
        });

        it("given internal server error -> should return 500", async () => {
            // Given
            const serviceData: CreateServiceRequestDto = {
                name: "Test Service",
                description: "This is a test service description",
            };
            mockServiceDao.createService.mockRejectedValue(new Error("Unexpected error"));

            // When
            const response = await request(app.getHttpServer())
                .post(BASE_API_URL)
                .send(serviceData)
                .expect(500);

            // Then
            expect(response.body).toEqual({
                statusCode: 500,
                message: "Internal server error",
            });
            expect(serviceDao.createService).toHaveBeenCalledTimes(1);
        });
    });

    describe("PATCH /services/:id", () => {
        const API_URL = (id: string): string => `/services/${id}`;

        it("should partially update a service and return 200", async () => {
            // Given
            const pathParam: ServiceRequestPathParamDto = { id: TestUtil.generateUUIDString() };
            const updateData: Partial<UpdateServiceRequestDto> = { name: "new Service Name" };
            const expectedResponse = { id: pathParam.id, ...updateData };
            mockServiceDao.updateService.mockResolvedValue(expectedResponse);

            // When
            const response = await request(app.getHttpServer())
                .patch(API_URL(pathParam.id))
                .send(updateData)
                .expect(200);

            // Then
            expect(response.body).toEqual(expectedResponse);
            expect(serviceDao.updateService).toHaveBeenCalledWith(pathParam.id, updateData);
        });

        it("given unknown path param -> should return 404", async () => {
            // Given
            const unknownId = TestUtil.generateUUIDString();
            const updateData = {
                name: "Valid Name",
            };
            mockServiceDao.updateService.mockResolvedValue(null);

            // When
            const response = await request(app.getHttpServer())
                .patch(API_URL(unknownId))
                .send(updateData)
                .expect(404);

            // Then
            expect(response.body).toEqual({
                statusCode: 404,
                message: `Service with ID ${unknownId} not found`,
                error: "Not Found",
            });
            expect(serviceDao.updateService).toHaveBeenCalledTimes(1);
        });

        it("given invalid path param -> should return 400", async () => {
            // Given
            const invalidId = "invalid-uuid";
            const updateData = {
                name: "Valid Name",
            };

            // When
            const response = await request(app.getHttpServer())
                .patch(API_URL(invalidId))
                .send(updateData)
                .expect(400);

            // Then
            expect(response.body).toEqual({
                statusCode: 400,
                message: ["invalid ID format, must be a UUID v4"],
                error: "Bad Request",
            });
            expect(serviceDao.updateService).not.toHaveBeenCalled();
        });

        it("given invalid payload -> should return 400", async () => {
            // Given
            const invalidPayload = {
                name: "a".repeat(501),
            };

            // When
            const response = await request(app.getHttpServer())
                .patch(API_URL(TestUtil.generateUUIDString()))
                .send(invalidPayload)
                .expect(400);

            // Then
            expect(response.body).toEqual({
                statusCode: 400,
                message: ["name must be between 3 and 255 characters"],
                error: "Bad Request",
            });
            expect(serviceDao.updateService).not.toHaveBeenCalled();
        });

        it("given payload containing extra field -> should return 400", async () => {
            // Given
            const invalidPayload = {
                extra_col: "123",
                name: "new name",
            };

            // When
            const response = await request(app.getHttpServer())
                .patch(API_URL(TestUtil.generateUUIDString()))
                .send(invalidPayload)
                .expect(400);

            // Then
            expect(response.body).toEqual({
                statusCode: 400,
                message: ["property extra_col should not exist"],
                error: "Bad Request",
            });
            expect(serviceDao.updateService).not.toHaveBeenCalled();
        });

        it("given internal server error -> should return 500", async () => {
            // Given
            const serviceData: CreateServiceRequestDto = {
                name: "Test Service",
                description: "This is a test service description",
            };
            mockServiceDao.updateService.mockRejectedValue(new Error("Unexpected error"));

            // When
            const response = await request(app.getHttpServer())
                .patch(API_URL(TestUtil.generateUUIDString()))
                .send(serviceData)
                .expect(500);

            // Then
            expect(response.body).toEqual({
                statusCode: 500,
                message: "Internal server error",
            });
            expect(serviceDao.updateService).toHaveBeenCalledTimes(1);
        });
    });

    describe("DELETE /services/:id", () => {
        const API_URL = (id: string): string => `/services/${id}`;

        it("should delete a service and return 204", async () => {
            // Given
            const id = TestUtil.generateUUIDString();
            mockServiceDao.deleteService.mockResolvedValue(true);

            // When
            const response = await request(app.getHttpServer())
                .delete(API_URL(id))
                .expect(204);

            // Then
            expect(serviceDao.deleteService).toHaveBeenCalledWith(id);
        });

        it("given unknown path param -> should return 404", async () => {
            // Given
            const unknownId = TestUtil.generateUUIDString();
            mockServiceDao.deleteService.mockResolvedValue(false);

            // When
            const response = await request(app.getHttpServer())
                .delete(API_URL(unknownId))
                .expect(404);

            // Then
            expect(response.body).toEqual({
                statusCode: 404,
                message: `Service with ID ${unknownId} not found`,
                error: "Not Found",
            });
            expect(serviceDao.deleteService).toHaveBeenCalledTimes(1);
        });

        it("given invalid path param -> should return 400", async () => {
            // Given
            const invalidId = "invalid-uuid";

            // When
            const response = await request(app.getHttpServer())
                .delete(API_URL(invalidId))
                .expect(400);

            // Then
            expect(response.body).toEqual({
                statusCode: 400,
                message: ["invalid ID format, must be a UUID v4"],
                error: "Bad Request",
            });
            expect(serviceDao.deleteService).not.toHaveBeenCalled();
        });

        it("given internal server error -> should return 500", async () => {
            // Given
            mockServiceDao.deleteService.mockRejectedValue(new Error("Unexpected error"));

            // When
            const response = await request(app.getHttpServer())
                .delete(API_URL(TestUtil.generateUUIDString()))
                .expect(500);

            // Then
            expect(response.body).toEqual({
                statusCode: 500,
                message: "Internal server error",
            });
            expect(serviceDao.deleteService).toHaveBeenCalledTimes(1);
        });
    });
});
