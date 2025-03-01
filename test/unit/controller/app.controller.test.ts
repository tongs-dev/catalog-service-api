import request from "supertest";
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";

import { UpdateServiceRequestDto } from "../../../src/dto/request.dto";
import {TestUtil} from "../../util/util";

describe("ServiceController (Unit Test)", () => {
    let app: INestApplication;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [],
            providers: [],
        }).compile();

        app = module.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("Unknown route and method", () => {
        it("given unknown method -> should return 404", async () => {
            // Given
            const updateData: Partial<UpdateServiceRequestDto> = { name: "new Service Name" };
            const url = `/services/${TestUtil.generateUUIDString()}`;

            // When
            const response = await request(app.getHttpServer())
                .put(url)
                .send(updateData)
                .expect(404);

            // Then
            expect(response.body).toEqual({
                statusCode: 404,
                message: `Cannot PUT ${url}`,
                error: "Not Found",
            });
        });

        it("given unknown route -> should return 404", async () => {
            // Given
            const unknownRoute = `/unknown_route`;

            // When
            const response = await request(app.getHttpServer())
                .get(unknownRoute)
                .expect(404);

            // Then
            expect(response.body).toEqual({
                statusCode: 404,
                message: `Cannot GET ${unknownRoute}`,
                error: "Not Found",
            });
        });
    });
});
