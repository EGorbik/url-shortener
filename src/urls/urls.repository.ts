import { ConflictException, InternalServerErrorException } from '@nestjs/common';
import { Url } from './url.entity';
import { CreateUrlDto } from './dto/create-url.dto';
import { EntityRepository, Repository } from 'typeorm';
import {generateRandomString} from "../helpers";

@EntityRepository(Url)
export class UrlsRepository extends Repository<Url> {
  async createUrl(createUrlDto: CreateUrlDto): Promise<Url> {
    const { short = generateRandomString(), full } = createUrlDto;
    const createdUrl = this.create({
      short,
      full,
    });

    try {
      await this.save(createdUrl);
    } catch (err) {
      if (err.code === '23505') {
        throw new ConflictException('Short name already exists');
      } else {
        throw new InternalServerErrorException();
      }
    }

    return createdUrl;
  }
}