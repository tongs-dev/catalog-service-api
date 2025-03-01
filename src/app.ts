import "reflect-metadata";
import {ValidationPipe} from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.enableCors(); // Allow cross-origin requests
    app.setGlobalPrefix("api"); // All routes will be prefixed with `/api`
    // Enable validation globally
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

    await app.listen(3000);
    console.log("🚀 Server running on http://localhost:3000");
}

bootstrap();
