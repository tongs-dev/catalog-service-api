import {Transform} from "class-transformer";

export class ServiceWithVersionCountResponseDto {
    id: string;
    name: string;
    description: string;
    versionCount: number;
}

export class ServiceVersionResponseDto {
    id: string;
    name:string;
    createdAt: Date;
    updatedAt: Date;
}

export class VersionResponseDto extends ServiceVersionResponseDto {
    serviceId: string;
}

export class ServiceResponseDto {
    id: string;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
}

export class ServiceWithVersionsResponseDto extends ServiceResponseDto {
    versions: ServiceVersionResponseDto[];
}
