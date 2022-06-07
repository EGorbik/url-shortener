import { Module } from '@nestjs/common';
import { UrlsService } from './urls.service';
import { UrlsController } from './urls.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UrlsRepository } from './urls.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UrlsRepository])],
  providers: [UrlsService],
  controllers: [UrlsController],
  exports: [UrlsService]
})
export class UrlsModule {}
