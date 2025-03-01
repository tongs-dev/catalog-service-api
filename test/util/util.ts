import {Service} from "../../src/entity/service.entity";

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
}
