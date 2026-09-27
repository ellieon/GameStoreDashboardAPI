import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import dotenv from 'dotenv'
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/modules/app.module.js';
import { DatabaseService } from '../../src/service/database.service.js';

let app: INestApplication;
let mockDatabaseService: Partial<DatabaseService>
let moduleFixture: TestingModule

beforeEach(async () => {
    mockDatabaseService = {
        getUserWithApiKey: vi.fn(),
        getPreferencesForUser: vi.fn().mockResolvedValue({
            stores: ['Aberdeen', 'Acocks Green'],
            categories: ['67', '70']
        })
    }

    moduleFixture = await Test.createTestingModule({
        imports: [AppModule]
    })
        .overrideProvider(DatabaseService)
        .useValue(mockDatabaseService)
        .compile();


    app = moduleFixture.createNestApplication();
    await app.init();

    dotenv.config({
        path: '.env.e2e',
        override: true,
    });
});

describe('UserController', async () => {

    describe('/preferences', async () => {
        it('should return a 401 not authorised when no api key is provided', async () => {
            const response = await request(app.getHttpServer())
                .get('/user/preferences')
            expect(response.statusCode).toBe(401)
            expect(response.body.message).toBe('Missing API Token')
        })

        it('should return a 401 not authorised when an api key that does not exist is provided', async () => {
            const response = await request(app.getHttpServer())
                .get('/user/preferences')
                .set('x-api-key', 'api key')
            expect(response.statusCode).toBe(401)
            expect(response.body.message).toBe('Invalid API key')
        })

        it('should return a 200 with an updated user object when given valid preferences and api key', async () => {
            mockDatabaseService.getUserWithApiKey = vi.fn().mockResolvedValue({
                name: 'test',
                email: 'test',
                permissions: [],
                id: 1
            })

            const response = await request(app.getHttpServer())
                .get('/user/preferences')
                .set('x-api-key', 'api key')
            expect(response.statusCode).toBe(200)
            expect(response.body.stores.length).toBe(2)
        })
    })

    describe('/create', () => {
        it('should return a 401 not authorised when no api key is provided', async () => {
            const response = await request(app.getHttpServer())
                .get('/user/create')
            expect(response.statusCode).toBe(401)
            expect(response.body.message).toBe('Missing API Token')

        })

        it('should return a 401 not authorised when an api key that does not exist is provided', async () => {
            const response = await request(app.getHttpServer())
                .get('/user/create')
                .set('x-api-key', 'api key')
            expect(response.statusCode).toBe(401)
            expect(response.body.message).toBe('Invalid API key')
        })

    })

    describe('/delete', () => {
        it('should return a 401 not authorised when no api key is provided', async () => {
            const response = await request(app.getHttpServer())
                .get('/user/delete')
            expect(response.statusCode).toBe(401)
            expect(response.body.message).toBe('Missing API Token')

        })

        it('should return a 401 not authorised when an api key that does not exist is provided', async () => {
            const response = await request(app.getHttpServer())
                .get('/user/delete')
                .set('x-api-key', 'api key')
            expect(response.statusCode).toBe(401)
            expect(response.body.message).toBe('Invalid API key')
        })

    })

});
