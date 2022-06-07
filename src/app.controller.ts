import {Controller, Get, Param, Post, Res, Headers} from '@nestjs/common';
import { Response } from 'express';
import {UrlsService} from "./urls/urls.service";

@Controller()
export class AppController {
    constructor(private readonly urlsService: UrlsService) {}

    @Get('/:short')
    async handleRedirect(
        @Param('short') short: string,
        @Res() res: Response,
    ): Promise<void> {
        const item = await this.urlsService.getItem({ short });
        return res.redirect(301, item.full);
    }
}
