import request from "supertest";
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";

import { ServiceDao } from "../../../src/dao/service.dao";
import {
    ServiceWithVersionCountResponseDto
} from "../../../src/dto/response.dto";
import { ServiceController } from "../../../src/controller/service.controller";
import {TestUtil} from "../../util/util";

describe("ServiceController (Unit Test)", () => {
    let app: INestApplication;
    let serviceDao: ServiceDao;

    const mockServiceDao = {
        getServicesWithVersionCount: jest.fn(),
        getServiceWithVersions: jest.fn(),
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
        const API_URL = "/services";

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
                .get(API_URL)
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
                .get(API_URL)
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
            const response = await request(app.getHttpServer()).get(API_URL).expect(500);

            // Then
            expect(response.body).toEqual({
                statusCode: 500,
                message: "Internal server error",
            });
            expect(serviceDao.getServicesWithVersionCount).toHaveBeenCalled();
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
                message: ["invalid ID format. Must be a UUID v4."],
                error: "Bad Request",
            });
        });
    });
});
