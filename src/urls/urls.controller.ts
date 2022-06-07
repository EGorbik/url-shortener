import {Body, Controller, Get, Param, Post, Res, Headers} from '@nestjs/common';
import { UrlsService } from './urls.service';
import { Response } from 'express';
import { CreateUrlDto } from './dto/create-url.dto';
import { Url } from './url.entity';

@Controller('urls')
export class UrlsController {
    constructor(private readonly urlsService: UrlsService) {}

    @Post()
    createLink(@Body() createUrlDto: CreateUrlDto, @Headers() headers: any): Promise<Url> {
        return this.urlsService.createUrl(createUrlDto, headers);
    }
}
