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
        getAllServicesWithVersionCount: jest.fn(),
        getServiceDetail: jest.fn(),
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
            mockServiceDao.getAllServicesWithVersionCount.mockResolvedValue(expectedResponse);

            const response = await request(app.getHttpServer())
                .get("/services")
                .query(query)
                .expect(200);

            expect(response.body).toEqual(expectedResponse);
            expect(serviceDao.getAllServicesWithVersionCount).toHaveBeenCalledWith(
                query.page,
                query.limit,
                query.name,
                query.sortBy,
                query.order.toUpperCase(),
            );
        });

        it("given invalid query param -> should return 400", async () => {
            const query = {
                sortBy: "unknown_field",
                limit: 10000,
            };
            const expectedResponse = {
                "error": "Bad Request",
                "message": ["limit cannot exceed 100", "invalid sortBy field"],
                "statusCode": 400
            };

            const response = await request(app.getHttpServer())
                .get("/services")
                .query(query)
                .expect(400);

            expect(response.body).toEqual(expectedResponse);
            expect(serviceDao.getAllServicesWithVersionCount).not.toHaveBeenCalled();
        });

        it("given internal server error -> should return 500", async () => {
            mockServiceDao.getAllServicesWithVersionCount.mockRejectedValue(new Error("Unexpected error"));

            const response = await request(app.getHttpServer()).get("/services").expect(500);

            expect(response.body).toEqual({
                statusCode: 500,
                message: "Internal server error",
            });
            expect(serviceDao.getAllServicesWithVersionCount).toHaveBeenCalled();
        });
    });

    describe("GET /services/:id", () => {
        it("should return service with versions in detail", async () => {
            const expectedResponse = TestUtil.createMockServiceDetailResponse();
            mockServiceDao.getServiceDetail.mockResolvedValue(expectedResponse);

            const response = await request(app.getHttpServer())
                .get(`/services/${expectedResponse.id}`)
                .expect(200);

            expect(response.body).toEqual(expectedResponse);
            expect(serviceDao.getServiceDetail).toHaveBeenCalledWith(expectedResponse.id);
        });

        it("given unknown service id -> should return 404", async () => {
            const unknownId = "f016e69f-e76d-4968-8100-77e4a0bff2c9";
            mockServiceDao.getServiceDetail.mockResolvedValue(null);

            const response = await request(app.getHttpServer())
                .get(`/services/${unknownId}`)
                .expect(404);

            expect(response.body).toEqual({
                statusCode: 404,
                message: `Service with ID ${unknownId} not found`,
                error: "Not Found",
            });
            expect(serviceDao.getServiceDetail).toHaveBeenCalledWith(unknownId);
        });

        it("given invalid service id -> should return 400", async () => {
            const invalidId = "12345";

            const response = await request(app.getHttpServer())
                .get(`/services/${invalidId}`)
                .expect(400);

            expect(response.body).toEqual({
                statusCode: 400,
                message: ["invalid ID format. Must be a UUID v4."],
                error: "Bad Request",
            });
        });
    });
});
