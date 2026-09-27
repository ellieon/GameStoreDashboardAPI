import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import dotenv from 'dotenv'
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/modules/app.module.js';
import { DatabaseService } from '../../src/service/database.service.js';
import { MockStoreServer } from './helper/mock-store-server.js';

let app: INestApplication;
let mockDatabaseService: Partial<DatabaseService>
let moduleFixture: TestingModule
let mockApi: MockStoreServer

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

describe('StoreController', async () => {

    beforeAll(async () => {
        mockApi = new MockStoreServer(3002);
        await mockApi.start();
    });

    afterAll(async () => {
        await mockApi.stop();
    });

    describe('/games', async () => {
        it('should return a 401 not authorised when no api key is provided', async () => {
            const response = await request(app.getHttpServer())
                .get('/store/games')
            expect(response.statusCode).toBe(401)
            expect(response.body.message).toBe('Missing API Token')
        })

        it('should return a 401 not authorised when an api key that does not exist is provided', async () => {
            const response = await request(app.getHttpServer())
                .get('/store/games')
                .set('x-api-key', 'api key')
            expect(response.statusCode).toBe(401)
            expect(response.body.message).toBe('Invalid API key')
        })

        it('should return a 200 with a list of games when a valid API key is provided', async () => {
            mockDatabaseService.getUserWithApiKey = vi.fn().mockResolvedValue({
                name: 'test',
                email: 'test',
                permissions: [],
                id: 1
            })

            mockDatabaseService.getPreferencesForUser = vi.fn().mockResolvedValue({
                stores: ['Aberdeen', 'Acocks Green'],
                categories: ['67', '70']
            })

            const response = await request(app.getHttpServer())
                .get('/store/games')
                .set('x-api-key', 'api key')
            expect(response.statusCode).toBe(200)
            expect(response.body.stores.length).toBe(2)
        })
    })

    describe('/product-lines', () => {
        it('should return a 401 not authorised when no api key is provided', async () => {
            const response = await request(app.getHttpServer())
                .get('/store/g')
            expect(response.statusCode).toBe(401)
            expect(response.body.message).toBe('Missing API Token')

        })

        it('should return a 401 not authorised when an api key that does not exist is provided', async () => {
            const response = await request(app.getHttpServer())
                .get('/store/product-lines')
                .set('x-api-key', 'api key')
            expect(response.statusCode).toBe(401)
            expect(response.body.message).toBe('Invalid API key')
        })

        it('should return a 200 with a list of product lines when a valid API key is provided', async () => {
            mockDatabaseService.getUserWithApiKey = vi.fn().mockResolvedValue({
                name: 'test',
                email: 'test',
                permissions: [],
                id: 1
            })

            mockDatabaseService.getPreferencesForUser =  vi.fn().mockResolvedValue({
                stores: ['Aberdeen', 'Acocks Green'],
                categories: ['67', '70']
            })

            const response = await request(app.getHttpServer())
                .get('/store/product-lines?superCatIds=1')
                .set('x-api-key', 'api key')
            expect(response.statusCode).toBe(200)
            expect(response.body.productLines.length).toBeGreaterThan(0)
        })
    })

});

