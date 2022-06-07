import {ValidationPipe} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  const port = process.env.PORT;

  const config = new DocumentBuilder()
      .setTitle('URL shortener')
      .setDescription('Documentation Rest Api')
      .setVersion('1.0.0')
      .build()
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api/docs', app, document);

  await app.listen(port, () => console.log(`Server started on port = ${port}`));
}
bootstrap();
