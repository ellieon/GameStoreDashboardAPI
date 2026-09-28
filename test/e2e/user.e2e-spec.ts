import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import dotenv from 'dotenv'
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/modules/app.module.js';
import { DatabaseService } from '../../src/service/database.service.js';
import { MockStoreServer } from './helper/mock-store-server.js';
import { Role } from '../../src/model/user.js';

let app: INestApplication;
let mockDatabaseService: Partial<DatabaseService>
let moduleFixture: TestingModule
let mockApi: MockStoreServer

beforeAll(async () => {
    mockApi = new MockStoreServer(3002);
    await mockApi.start();
});

afterAll(async () => {
    await mockApi.stop();
});

beforeEach(async () => {
    vi.clearAllMocks();
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
    describe('PUT /preferences', async () => {
        it('should return a 401 not authorised when no api key is provided', async () => {
            const response = await request(app.getHttpServer())
                .put('/user/preferences')
            expect(response.statusCode).toBe(401)
            expect(response.body.message).toBe('Missing API Token')
        })

        it('should return a 401 not authorised when an api key that does not exist is provided', async () => {
            const response = await request(app.getHttpServer())
                .put('/user/preferences')
                .set('x-api-key', 'api key')
            expect(response.statusCode).toBe(401)
            expect(response.body.message).toBe('Invalid API key')
        })

        describe('when given a valid API key', async () => {
            beforeEach(async () => {
                mockDatabaseService.getUserWithApiKey = vi.fn().mockResolvedValue({
                    name: 'test',
                    email: 'test',
                    permissions: [Role.Admin, Role.User],
                    id: 1
                })
            })

            it('Should return a 400 bad request when the given data fails validation', async () => {
                const response = await request(app.getHttpServer())
                    .put('/user/preferences')
                    .set('x-api-key', 'api key')
                    .send()
                    .set('Content-Type', 'application/json')
                    .set('Accept', 'application/json')
                expect(response.statusCode).toBe(400)

            })

            it('Should return a 404 not found when the given api key does not match a known user', async () => {
                mockDatabaseService.updatePreferencesForUser = vi.fn().mockResolvedValue(
                    undefined
                )
                const response = await request(app.getHttpServer())
                    .put('/user/preferences')
                    .set('x-api-key', 'api key')
                    .send({ categories: ['67'], stores: ['Aberdeen'] })
                    .set('Content-Type', 'application/json')
                    .set('Accept', 'application/json')
                expect(response.statusCode).toBe(404)

            }) 

            it('should return a 200 with an updated user object when given valid preferences and api key', async () => {

                mockDatabaseService.updatePreferencesForUser = vi.fn().mockResolvedValue({
                    stores: ['Aberdeen']
                })
                const response = await request(app.getHttpServer())
                    .put('/user/preferences')
                    .set('x-api-key', 'api key')
                    .send({ categories: ["67"], stores: ['Aberdeen'] })
                    .set('Content-Type', 'application/json')
                    .set('Accept', 'application/json')
                expect(response.statusCode).toBe(200)
                expect(response.body.stores.length).toBe(1)
            })
        })

    })

    describe('GET /preferences', async () => {
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

        it('should return a 404 not found when the api key does not match a known user', async () => {
            mockDatabaseService.getUserWithApiKey = vi.fn().mockResolvedValue({
                name: 'test',
                email: 'test',
                permissions: [Role.Admin, Role.User],
                id: 1
            })
            mockDatabaseService.getPreferencesForUser = vi.fn().mockResolvedValue(undefined)

            const response = await request(app.getHttpServer())
                .get('/user/preferences')
                .set('x-api-key', 'api key')
            expect(response.statusCode).toBe(404)
        })

        it('should return a 200 with an updated user object when given valid preferences and api key', async () => {
            mockDatabaseService.getUserWithApiKey = vi.fn().mockResolvedValue({
                name: 'test',
                email: 'test',
                permissions: [Role.Admin, Role.User],
                id: 1
            })

            const response = await request(app.getHttpServer())
                .get('/user/preferences')
                .set('x-api-key', 'api key')
            expect(response.statusCode).toBe(200)
            expect(response.body.stores.length).toBe(2)
        })
    })
});
