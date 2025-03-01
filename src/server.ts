import "reflect-metadata";

import { dataSource } from "./data-source";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  try {
    await dataSource.initialize();
    console.log("Data source successfully initialized.");
  } catch (err) {
    console.log("Error: ", err);
  }

  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}

bootstrap();