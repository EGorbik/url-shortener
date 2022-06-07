import {Injectable, NotFoundException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UrlsRepository } from './urls.repository';
import { Url } from './url.entity';
import { CreateUrlDto } from './dto/create-url.dto';
import {FindConditions} from "typeorm";

@Injectable()
export class UrlsService {
    constructor(
        @InjectRepository(UrlsRepository)
        private readonly urlsRepository: UrlsRepository,
    ) {}

    async createUrl(createUrlDto: CreateUrlDto, header: any): Promise<any> {
        let { short } = await this.urlsRepository.createUrl(createUrlDto);
        return { url: `http://${header.host}/${short}`};
    }

    async getItem(conditions: FindConditions<Url>): Promise<Url> {
        const link = await this.urlsRepository.findOne(conditions);
        if (!link) {
            throw new NotFoundException();
        }

        return link;
    }
}
