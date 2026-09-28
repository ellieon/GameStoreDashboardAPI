import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import { StoreApiService } from '../../../src/service/storeApi.service.js';
import { DatabaseService } from '../../../src/service/database.service.js';
import { StoreProductLine, StoreStore } from '../../../src/model/store.js';
import { BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { User } from '../../../src/model/user.js';
import { UserService } from '../../../src/service/user.service.js';
import { AuthService } from '../../../src/service/auth.service.js';

vi.mock('axios');

describe('UserService', () => {
    let service: UserService;
    const exampleUser: User = {
        id: 0,
        name: '',
        email: '',
        permissions: []
    }

    const exampleStores = ['Store 1', 'Store 2']
    const exampleCats = ['1', '2']
    const exampleStoreStores: StoreStore[] = [{
        storeId: 0,
        storeName: 'Store 1'
    }, {
        storeId: 0,
        storeName: 'Store 2'
    }]

    const exampleProductLines: StoreProductLine[] = [{
        superCatId: 0,
        productLineId: 1,
        productLineName: '',
        totalCategories: 0,
        imageName: ''
    }, 
    {
        superCatId: 0,
        productLineId: 2,
        productLineName: '',
        totalCategories: 0,
        imageName: ''
    }]
    
    const mockDatabaseService = {
        getPreferencesForUser: vi.fn(),
        updatePreferencesForUser: vi.fn()
    };

    const mockStoreApiService = {
        getProductLines: vi.fn(),
        getStores: vi.fn(),
    }

    const mockAuthService = {
        generateKey: vi.fn()
    }

    beforeEach(async () => {
        vi.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: DatabaseService,
                    useValue: mockDatabaseService,
                },
                {
                    provide: StoreApiService,
                    useValue: mockStoreApiService
                },
                {
                    provide: AuthService,
                    useValue: mockAuthService
                }

            ],
        }).compile();

        service = module.get(UserService);

        process.env.QUERY_URL = 'test-query';
        process.env.CATEGORY_URL = 'test-category';
    });

    describe('updatePreferencesForCurrentUser', async () => {
        describe('When given valid preferences', async () => {
            beforeEach(async () => {
                mockStoreApiService.getStores.mockResolvedValue(exampleStoreStores)
                mockStoreApiService.getProductLines.mockResolvedValue(exampleProductLines)
            })
            it('Should update and return the preferences for the given user if found in the database', async () => {
                mockDatabaseService.updatePreferencesForUser.mockResolvedValue({stores: exampleStores, categories: exampleCats})
                const response = await service.updatePreferencesForUser(exampleUser, exampleStores, exampleCats)

                expect(mockDatabaseService.updatePreferencesForUser).toHaveBeenCalledWith(exampleUser, exampleStores, exampleCats)
                expect(response.stores).toEqual(exampleStores)
                expect(response.categories).toEqual(exampleCats)

            })

            it('Should raise a InternalServerError if unable to update the database', async () => {
                mockDatabaseService.updatePreferencesForUser.mockResolvedValue(undefined)
                await expect(service.updatePreferencesForUser(exampleUser, exampleStores, exampleCats)).rejects.toThrow(InternalServerErrorException)
                expect(mockDatabaseService.updatePreferencesForUser).toHaveBeenCalledWith(exampleUser, exampleStores, exampleCats)
            })
        })

        describe('when given invalid preferences' , async() => {
            it('Should raise a BadRequestException if any of the stores provided are invalid', async () => {
                mockStoreApiService.getStores.mockResolvedValue([])
                mockStoreApiService.getProductLines.mockResolvedValue(exampleProductLines)
                await expect(service.updatePreferencesForUser(exampleUser, exampleStores, exampleCats)).rejects.toThrow(BadRequestException)
                expect(mockDatabaseService.updatePreferencesForUser).toHaveBeenCalledTimes(0);

            })

            it('Should raise a BadRequestException if any of the categories provided are invalid', async () => {
                mockStoreApiService.getStores.mockResolvedValue(exampleStoreStores)
                mockStoreApiService.getProductLines.mockResolvedValue([])
                await expect(service.updatePreferencesForUser(exampleUser, exampleStores, exampleCats)).rejects.toThrow(BadRequestException)
                expect(mockDatabaseService.updatePreferencesForUser).toHaveBeenCalledTimes(0);
            })
        })
    })

    describe('getPreferencesForCurrentUser', async () => {
        it('Should return the preferences for the given user if found in the database', async () => {
            mockDatabaseService.getPreferencesForUser.mockResolvedValue({
                stores: exampleStores,
                categories: exampleCats
            })
            const response = await service.getPreferencesForUser(exampleUser);
            expect(mockDatabaseService.getPreferencesForUser).toHaveBeenCalledWith(exampleUser)
            expect(response.categories).toBe(exampleCats)
            expect(response.stores).toBe(exampleStores)
        })

        it('Should raise a NotFoundException if the given user is not found in the database', async () => {
            mockDatabaseService.getPreferencesForUser.mockResolvedValue(undefined)
            await expect(service.getPreferencesForUser(exampleUser)).rejects.toThrow(NotFoundException)
            expect(mockDatabaseService.getPreferencesForUser).toHaveBeenCalledWith(exampleUser)
        })
    })
});