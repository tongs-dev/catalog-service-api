import {IsInt, IsOptional, IsEnum, Min, Max, IsString, Length, IsUUID} from "class-validator";
import {Transform, Type} from "class-transformer";

import { Service } from "../entity/service.entity";

export class GetAllServicesDto {
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

export class GetServiceDetailDto {
    @IsUUID("4", { message: "invalid ID format. Must be a UUID v4." })
    id: string;
}
