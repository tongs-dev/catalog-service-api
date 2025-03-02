import {CreateVersionRequestDto} from "./request.dto";
import {Version} from "../entity/version.entity";

/**
 * Transforms a request dto entity into a database entity.
 */
export class ResponseDtoTransformer {
    static toVersion(newVersion: CreateVersionRequestDto): Version {
        return {
            name: newVersion.name,
            description: newVersion.description,
            service: { id: newVersion.serviceId },
        } as Version;
    }
}