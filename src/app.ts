import "reflect-metadata";

import { dataSource } from "./data-source";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./module/app.module";

async function bootstrap() {
    // Initialize data source
    try {
        await dataSource.initialize();
        console.log("Data source successfully initialized.");
    } catch (err) {
        console.log("Error: ", err);
    }

    // Create and start server
    const app = await NestFactory.create(AppModule);
    await app.listen(3000);
}

bootstrap();
