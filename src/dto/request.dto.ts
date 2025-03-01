import { Length, IsEnum, IsInt, IsOptional,IsString, IsUUID, Max, MaxLength, Min } from "class-validator";
import { Transform, Type } from "class-transformer";

import { Service } from "../entity/service.entity";

export class ServicesWithVersionCountRequestDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: "page must be an integer" })
    @Min(1, { message: "page must be at least 1" })
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: "limit must be an integer" })
    @Min(1, { message: "limit must be at least 1" })
    @Max(100, { message: "limit cannot exceed 100" })
    limit?: number = 10;

    @IsOptional()
    @IsString()
    @Length(3, 255, { message: "name must be between 3 and 255 characters" })
    name?: string;

    @IsOptional()
    @IsEnum(["created_at", "updated_at", "name"], { message: "invalid sortBy field" })
    sortBy?: keyof Service = "created_at";

    @IsOptional()
    @Transform(({ value }) => value?.toUpperCase())
    @IsEnum(["ASC", "DESC"], { message: "invalid order, must be ASC or DESC" })
    order?: "ASC" | "DESC" = "DESC";
}

export class ServiceWithVersionsRequestDto {
    @IsUUID("4", { message: "invalid ID format. Must be a UUID v4." })
    id: string;
}

export class CreateServiceRequestDto {
    @IsString()
    @Length(3, 255, { message: "name must be between 3 and 255 characters" })
    name: string;

    @IsString()
    @MaxLength(500, { message: "description must be at most 500 characters" })
    description: string;
}

export class ServiceRequestPathParamDto {
    @IsUUID("4", { message: "invalid UUID format" })
    id: string;
}

export class UpdateServiceRequestDto {
    @IsOptional()
    @IsString()
    @Length(3, 255, { message: "name must be between 3 and 255 characters" })
    name?: string;

    @IsOptional()
    @IsString()
    @MaxLength(500, { message: "description must be at most 500 characters" })
    description?: string;
}

