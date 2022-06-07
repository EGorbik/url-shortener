import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Connection } from 'typeorm';
import { faker } from '@faker-js/faker';
import { clearRepositories, createNestApplication } from '../test-helpers';
import {UrlsRepository} from "./urls.repository";

describe('Urls', () => {
  let app: INestApplication;
  let dbConnection: Connection;
  let urlsRepository: UrlsRepository;
  const createUrlBody = () => {
    return {
      short: faker.word.noun(),
      full: faker.internet.url(),
    };
  };
  const createInvalidUrlBodies = () => {
    const validUrl = createUrlBody();

    return [
      // invalid payload
      undefined,
      {},

      // invalid name
      { name: undefined, url: validUrl.full },
      { name: null, url: validUrl.full },
      { name: faker.datatype.boolean(), url: validUrl.full },
      { name: faker.datatype.number(), url: validUrl.full },
      { name: JSON.parse(faker.datatype.json()), url: validUrl.full },
      { name: '', url: validUrl.full },

      // invalid url
      { name: validUrl.short, url: undefined },
      { name: validUrl.short, url: null },
      { name: validUrl.short, url: faker.datatype.boolean() },
      { name: validUrl.short, url: faker.datatype.number() },
      { name: validUrl.short, url: JSON.parse(faker.datatype.json()) },
      { name: validUrl.short, url: '' },
      { name: validUrl.short, url: faker.word.noun() },
    ];
  };
  const createUrlItem = async () => {
    const urlBody = createUrlBody();

    return urlsRepository.createUrl(urlBody);
  };
  const createInvalidUrlIds = () => {
    return [faker.datatype.number(), faker.word.noun()];
  };

  beforeAll(async () => {
    app = await createNestApplication({
      onBeforeInit: (moduleRef) => {
        dbConnection = moduleRef.get(Connection);
        urlsRepository = moduleRef.get(UrlsRepository);
      },
    });
  });

  beforeEach(async () => {
    await clearRepositories(dbConnection);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/Urls (POST)', () => {
    it('should NOT accept invalid data', async () => {
      const invalidData = createInvalidUrlBodies();
      const promises: Array<Promise<void>> = [];

      invalidData.forEach((payload) => {
        promises.push(
          (async () => {
            const res = await request(app.getHttpServer())
              .post('/urls')
              .send(payload);
            const resBody = res.body;

            expect(res.status).toBe(400);
            expect(resBody.error).toBe('Bad Request');
            expect(resBody.message).toEqual(
              expect.arrayContaining([expect.any(String)]),
            );
          })(),
        );
      });

      await Promise.all(promises);
    });

    it('should accept valid data', async () => {
      const urlBody = createUrlBody();

      const res = await request(app.getHttpServer())
        .post('/urls')
        .send(urlBody);
      const resBody = res.body;

      expect(res.status).toBe(201);
      expect(resBody).toEqual({
        ...urlBody,
        id: expect.any(String),
      });

      const urlId = resBody.id;
      const url = await urlsRepository.findOne({ id: urlId });

      expect(url).toEqual(resBody);
    });

    it('should handle already exists', async () => {
      const existingUrl = await createUrlItem();
      const urlBody = createUrlBody();

      const res = await request(app.getHttpServer()).post('/urls').send({
        name: existingUrl.short,
        url: urlBody.full,
      });
      const resBody = res.body;

      expect(res.status).toBe(409);
      expect(resBody.error).toBe('Conflict');
      expect(resBody.message).toBe('Short name already exists');
    });

    it('should handle unexpected error', async () => {
      const urlsRepositorySaveMock = jest
        .spyOn(urlsRepository, 'save')
        .mockRejectedValue({});

      const urlBody = createUrlBody();

      const res = await request(app.getHttpServer())
        .post('/urls')
        .send(urlBody);
      const resBody = res.body;

      expect(res.status).toBe(500);
      expect(resBody.message).toBe('Internal Server Error');

      urlsRepositorySaveMock.mockRestore();
    });
  });

  /*describe('/links/:id (DELETE)', () => {
    it('should NOT accept invalid id', async () => {
      const invalidData = createInvalidLinkIds();
      const promises: Array<Promise<void>> = [];

      invalidData.forEach((linkId) => {
        promises.push(
          (async () => {
            const res = await request(app.getHttpServer()).delete(
              `/links/${linkId}`,
            );
            const resBody = res.body;

            expect(res.status).toBe(400);
            expect(resBody.error).toBe('Bad Request');
            expect(resBody.message).toEqual(
              expect.arrayContaining([expect.any(String)]),
            );
          })(),
        );
      });

      await Promise.all(promises);
    });

    it('should handle not found', async () => {
      const linkId = faker.datatype.uuid();
      const res = await request(app.getHttpServer()).delete(`/links/${linkId}`);
      const resBody = res.body;

      expect(res.status).toBe(404);
      expect(resBody.error).toBe('Not Found');
      expect(resBody.message).toBe(`Link with ID: "${linkId}" not found`);
    });

    it('should handle delete', async () => {
      const link = await createLinkItem();
      const linkId = link.id;

      const res = await request(app.getHttpServer()).delete(`/links/${linkId}`);

      expect(res.status).toBe(200);

      const deletedLink = await linksRepository.findOne({ id: linkId });

      expect(deletedLink).toBeUndefined();
    });
  });

  describe('/links/:id (PUT)', () => {
    it('should NOT accept invalid id', async () => {
      const invalidData = createInvalidLinkIds();
      const promises: Array<Promise<void>> = [];

      invalidData.forEach((linkId) => {
        promises.push(
          (async () => {
            const res = await request(app.getHttpServer()).put(
              `/links/${linkId}`,
            );
            const resBody = res.body;

            expect(res.status).toBe(400);
            expect(resBody.error).toBe('Bad Request');
            expect(resBody.message).toEqual(
              expect.arrayContaining([expect.any(String)]),
            );
          })(),
        );
      });

      await Promise.all(promises);
    });

    it('should NOT accept invalid data', async () => {
      const linkId = faker.datatype.uuid();
      const invalidData = createInvalidLinkBodies();
      const promises: Array<Promise<void>> = [];

      invalidData.forEach((payload) => {
        promises.push(
          (async () => {
            const res = await request(app.getHttpServer())
              .put(`/links/${linkId}`)
              .send(payload);
            const resBody = res.body;

            expect(res.status).toBe(400);
            expect(resBody.error).toBe('Bad Request');
            expect(resBody.message).toEqual(
              expect.arrayContaining([expect.any(String)]),
            );
          })(),
        );
      });

      await Promise.all(promises);
    });

    it('should handle not found', async () => {
      const linkId = faker.datatype.uuid();
      const linkBody = createLinkBody();
      const res = await request(app.getHttpServer())
        .put(`/links/${linkId}`)
        .send(linkBody);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Not Found');
    });

    it('should handle update', async () => {
      const link = await createLinkItem();
      const linkId = link.id;
      const newLinkBody = createLinkBody();

      const res = await request(app.getHttpServer())
        .put(`/links/${linkId}`)
        .send(newLinkBody);
      const resBody = res.body;

      expect(res.status).toBe(200);
      expect(resBody).toEqual({
        ...newLinkBody,
        id: linkId,
      });

      const updatedLink = await linksRepository.findOne({ id: linkId });

      expect(updatedLink).toEqual(resBody);
    });*/
  /*});*/
});