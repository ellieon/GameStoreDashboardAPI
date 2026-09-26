import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import axios from 'axios';

import { CexApiService } from '../../src/service/cexApi.service.js';
import { DatabaseService } from '../../src/service/database.service.js';
import * as sampleResponseAcocks from '../data/cex-api-sample-query-acocks-gc-ds.json' with { type: 'json' };
import * as sampleResponseAberdeen from '../data/cex-api-sample-query-aberdeen-gc-ds.json' with { type: 'json' };
import { CexProductLine, CexProductLineResponseModel } from '../../src/model/cexApiModel.js';
import { ServiceUnavailableException } from '@nestjs/common';
import { NotFoundError } from 'rxjs';

vi.mock('axios');

describe('CexApiService', () => {
    let service: CexApiService;

    const mockDatabaseService = {
        getStoresForUser: vi.fn(),
        getCategoriesForUser: vi.fn(),
    };

    beforeEach(async () => {
        vi.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CexApiService,
                {
                    provide: DatabaseService,
                    useValue: mockDatabaseService,
                },
            ],
        }).compile();

        service = module.get(CexApiService);

        process.env.CEX_QUERY_URL = 'test-query';
        process.env.CEX_CATEGORY_URL = 'test-category';
    });

    describe('getProductLines', async () => {
        it('should return product lines', async () => {
            vi.mocked(axios.get).mockResolvedValue({
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
                } as CexProductLineResponseModel
            });

            const result = await service.getProductLines(1);

            expect(result).toEqual([
                {
                    productLineId: 1,
                    productLineName: 'PlayStation 5',
                },
            ]);

            expect(axios.get).toHaveBeenCalledOnce()
        });

        it('when the cex api is down, throw a ServiceUnavailableError', async () => {
            vi.mocked(axios.get).mockRejectedValue({});

            expect(service.getProductLines()).rejects.toThrow(ServiceUnavailableException)
        })
    })


    describe('getListOfGamesForUser()', async () => {
        it('When the user has selected a single store and multiple catagories, should build a response containing everything that matches', async () => {
            mockDatabaseService.getStoresForUser.mockReturnValue(['Acocks Green']);
            mockDatabaseService.getCategoriesForUser.mockReturnValue(['67', '59']);

            vi.spyOn(service, 'getProductLines').mockResolvedValue([
                {
                    productLineId: 59,
                    productLineName: 'Nintendo DS',
                } as CexProductLine,
                {
                    productLineId: 67,
                    productLineName: 'Nintendo Gamecube',
                } as CexProductLine,
            ]);

            vi.mocked(axios.post).mockResolvedValue({
                data: sampleResponseAcocks,
            });

            const result = await service.getListOfGamesForUser();

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
            mockDatabaseService.getStoresForUser.mockReturnValue(['Acocks Green', 'Aberdeen']);
            mockDatabaseService.getCategoriesForUser.mockReturnValue(['67', '59']);

            vi.spyOn(service, 'getProductLines').mockResolvedValue([
                {
                    productLineId: 59,
                    productLineName: 'Nintendo DS',
                } as any,
                {
                    productLineId: 67,
                    productLineName: 'Nintendo Gamecube',
                } as any,
            ]);

            vi.mocked(axios.post).mockImplementationOnce(() => {
                return {
                    data: sampleResponseAberdeen
                } as any
            }).mockImplementationOnce(() => {
                return {
                    data: sampleResponseAcocks,
                } as any
            });

            const result = await service.getListOfGamesForUser();

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

        it('When the cex api is down a ServiceUnavailableError should be thrown', async () => {
            mockDatabaseService.getStoresForUser.mockReturnValue(['Acocks Green']);
            mockDatabaseService.getCategoriesForUser.mockReturnValue(['67', '59']);

            vi.spyOn(service, 'getProductLines').mockResolvedValue([
                {
                    productLineId: 59,
                    productLineName: 'Nintendo DS',
                } as CexProductLine,
                {
                    productLineId: 67,
                    productLineName: 'Nintendo Gamecube',
                } as CexProductLine,
            ]);

            vi.mocked(axios.post).mockRejectedValue({});

            expect(service.getListOfGamesForUser()).rejects.toThrow(ServiceUnavailableException)

        })
    })

});