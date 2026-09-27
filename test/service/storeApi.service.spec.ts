import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import axios from 'axios';

import { StoreApiService } from '../../src/service/storeApi.service.js';
import { DatabaseService } from '../../src/service/database.service.js';
import * as sampleResponseAcocks from '../data/store-api-sample-query-acocks-gc-ds.json' with { type: 'json' };
import * as sampleResponseAberdeen from '../data/store-api-sample-query-aberdeen-gc-ds.json' with { type: 'json' };
import { StoreProductLine, StoreProductLineResponseModel, StoreStoresResponseModel } from '../../src/model/store.js';
import { ServiceUnavailableException } from '@nestjs/common';
import { User } from '../../src/model/user.js';

vi.mock('axios');

describe('StoreApiService', () => {
    let service: StoreApiService;

    const user: User = {
        id: 1,
        name: '',
        email: '',
        permissions: []
    }

    const mockDatabaseService = {
        getPreferencesForUser: vi.fn()
    };

    beforeEach(async () => {
        vi.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                StoreApiService,
                {
                    provide: DatabaseService,
                    useValue: mockDatabaseService,
                },
            ],
        }).compile();

        service = module.get(StoreApiService);

        process.env.QUERY_URL = 'test-query';
        process.env.CATEGORY_URL = 'test-category';
    });

    describe('getProductLines', async () => {
        it('should return product lines', async () => {
            const spy = vi.spyOn(axios, 'get')
            spy.mockResolvedValue({
                data: {
                    response: {
                        data: {
                            productLines: [
                                {
                                    productLineId: 1,
                                    productLineName: 'PlayStation 5',
                                },
                            ],
                        },
                    },
                } as StoreProductLineResponseModel
            });

            const result = await service.getProductLines(1);

            expect(result).toEqual([
                {
                    productLineId: 1,
                    productLineName: 'PlayStation 5',
                },
            ]);

            expect(spy).toHaveBeenCalledOnce()
        });

        it('when the store api is down, throw a ServiceUnavailableError', async () => {
            const spy = vi.spyOn(axios, 'get')
            spy.mockRejectedValue({});
            await expect(service.getProductLines()).rejects.toThrow(ServiceUnavailableException)
        })
    })

    describe('getListOfGamesForUser()', async () => {
        it('When the user has selected a single store and multiple catagories, should build a response containing everything that matches', async () => {
            mockDatabaseService.getPreferencesForUser.mockReturnValue({
                categories: ['67', '59'],
                stores: ['Acocks Green']
            })

            const getProductLineSpy = vi.spyOn(service, 'getProductLines')
            const axiosPostSpy = vi.spyOn(axios, 'post')

            getProductLineSpy.mockResolvedValue([
                {
                    productLineId: 59,
                    productLineName: 'Nintendo DS',
                } as StoreProductLine,
                {
                    productLineId: 67,
                    productLineName: 'Nintendo Gamecube',
                } as StoreProductLine,
            ]);

            axiosPostSpy.mockResolvedValue({
                data: sampleResponseAcocks,
            });

            const result = await service.getListOfGamesForUser(user);

            expect(result).toMatchObject({
                stores: [
                    {
                        name: 'Acocks Green',
                        availableBoxIds: ['SGCUGAME002', 'SLEGGCS227C', '045496737313', '045496741075'],
                        categories: [
                            {
                                id: 59,
                                name: 'Nintendo DS',
                                games: [
                                    {
                                        id: '045496737313',
                                        boxName: 'New Super Mario Bros',
                                        sellPrice: 20,
                                    },
                                    {
                                        id: '045496741075',
                                        boxName: 'Professor Layton and the Lost Future',
                                        sellPrice: 5,
                                    },
                                ],
                            },
                            {
                                id: 67,
                                name: 'Nintendo Gamecube',
                                games: [
                                    {
                                        id: 'SGCUGAME002',
                                        boxName: 'GameCube Wavebird Controller w/Receiver, B',
                                        sellPrice: 75,
                                    },
                                    {
                                        id: 'SLEGGCS227C',
                                        boxName: 'Metal Gear Solid Twin Snakes, No Manual, Boxed',
                                        sellPrice: 65,
                                    },
                                ],
                            }
                        ],
                    },
                ],
            });
        });

        it('When the user has selected multiple stores and multiple catagories, should build a combined response containing everything that matches', async () => {

            mockDatabaseService.getPreferencesForUser.mockReturnValue({
                categories: ['67', '59'],
                stores: ['Acocks Green', 'Aberdeen']
            })

            const productLinesSpy = vi.spyOn(service, 'getProductLines')
            const axiosPostSpy = vi.spyOn(axios, 'post')

            productLinesSpy.mockResolvedValue([
                {
                    productLineId: 59,
                    productLineName: 'Nintendo DS',
                } as any,
                {
                    productLineId: 67,
                    productLineName: 'Nintendo Gamecube',
                } as any,
            ]);

            axiosPostSpy.mockImplementationOnce(() => {
                return {
                    data: sampleResponseAberdeen
                } as any
            }).mockImplementationOnce(() => {
                return {
                    data: sampleResponseAcocks,
                } as any
            });

            const result = await service.getListOfGamesForUser(user);

            expect(result).toMatchObject({
                stores: [
                    {
                        name: 'Aberdeen',
                        availableBoxIds: ['SLEGGCS194B', '5060004765928'],
                        categories: [
                            {
                                id: 59,
                                name: 'Nintendo DS',
                                games: [
                                    {
                                        id: '5060004765928',
                                        boxName: 'Sonic Rush',
                                        sellPrice: 12,
                                    }
                                ],
                            },
                            {
                                id: 67,
                                name: 'Nintendo Gamecube',
                                games: [
                                    {
                                        id: 'SLEGGCS194B',
                                        boxName: 'Lost Kingdoms II, + Manual, Boxed',
                                        sellPrice: 55,
                                    }
                                ],
                            }
                        ],
                    },
                    {
                        name: 'Acocks Green',
                        availableBoxIds: ['SGCUGAME002', 'SLEGGCS227C', '045496737313', '045496741075'],
                        categories: [
                            {
                                id: 59,
                                name: 'Nintendo DS',
                                games: [
                                    {
                                        id: '045496737313',
                                        boxName: 'New Super Mario Bros',
                                        sellPrice: 20,
                                    },
                                    {
                                        id: '045496741075',
                                        boxName: 'Professor Layton and the Lost Future',
                                        sellPrice: 5,
                                    },
                                ],
                            },
                            {
                                id: 67,
                                name: 'Nintendo Gamecube',
                                games: [
                                    {
                                        id: 'SGCUGAME002',
                                        boxName: 'GameCube Wavebird Controller w/Receiver, B',
                                        sellPrice: 75,
                                    },
                                    {
                                        id: 'SLEGGCS227C',
                                        boxName: 'Metal Gear Solid Twin Snakes, No Manual, Boxed',
                                        sellPrice: 65,
                                    },
                                ],
                            }
                        ],
                    },
                ],
            });
        });

        it('When the store api is down a ServiceUnavailableError should be thrown', async () => {
            mockDatabaseService.getPreferencesForUser.mockReturnValue({
                categories: ['67', '59'],
                stores: ['Acocks Green']
            })

            const productLinesSpy = vi.spyOn(service, 'getProductLines')
            const axiosPostSpy = vi.spyOn(axios, 'post')

            productLinesSpy.mockResolvedValue([
                {
                    productLineId: 59,
                    productLineName: 'Nintendo DS',
                } as StoreProductLine,
                {
                    productLineId: 67,
                    productLineName: 'Nintendo Gamecube',
                } as StoreProductLine,
            ]);

            axiosPostSpy.mockRejectedValue({});

            await expect(service.getListOfGamesForUser(user)).rejects.toThrow(ServiceUnavailableException)

        })
    })

    describe('getStores', async () => {
        it('Should return a list of stores on a successful connection to the store API ', async () => {
            const spy = vi.spyOn(axios, 'get')
            spy.mockResolvedValue({
                data: {
                    response: {
                        data: {
                            stores: [
                                {
                                    storeId: 1,
                                    storeName: 'TestName',
                                },
                                {
                                    storeId: 2,
                                    storeName: 'TestName2',
                                },
                            ],
                        },
                    },
                } as StoreStoresResponseModel
            });

            const result = await service.getStores();

            expect(result).toEqual([
                {
                    storeId: 1,
                    storeName: 'TestName',
                },
                {
                    storeId: 2,
                    storeName: 'TestName2',
                },
            ]);

            expect(spy).toHaveBeenCalledOnce()
        })

        it('Should throw a ServiceUnavailableException when the store API is unavailable ', async () => {
            const spy = vi.spyOn(axios, 'get')
            spy.mockRejectedValue({});
            await expect(service.getStores()).rejects.toThrow(ServiceUnavailableException)
        })
    })
});