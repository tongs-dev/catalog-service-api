import "reflect-metadata";
import { NotFoundException, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

import { AppModule } from "./module/app.module";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Allow cross-origin requests
    app.enableCors();
    // All routes will be prefixed with `/api`
    app.setGlobalPrefix("api");
    // Enable validation globally
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

    await app.listen(3000);
    console.log("🚀 Server running on http://localhost:3000");

    // Make unknown routes return 404
    // Ensure this middleware is added **after** all routes are registered
    app.use((req: { method: any; originalUrl: any; }, res: any, next: (arg0: NotFoundException) => void) => {
        next(new NotFoundException(`Cannot ${req.method} ${req.originalUrl}`));
    });
}

bootstrap();
