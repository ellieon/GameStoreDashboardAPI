import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import { DatabaseService } from '../../../src/service/database.service.js';
import { User } from '../../../src/model/user.js';
import { DeltaService } from '../../../src/service/delta.service.js';
import { StoreApiService } from '../../../src/service/storeApi.service.js';
import { NotFoundException } from '@nestjs/common';
import { GameStoreResponse } from '../../../src/model/gameStore.js';
import { StateMetadata, StateMetadataResponse } from '../../../src/model/delta.js';

describe('DeltaService', () => {
    let service: DeltaService;
    const exampleUser: User = {
        id: 0,
        name: '',
        email: '',
        permissions: []
    }

    const exampleGameStoreResponse: GameStoreResponse = {
        dateTaken: new Date(),
        stores: []
    }

    const examplePreviousState: GameStoreResponse = {
            dateTaken: new Date(),
            stores: [{
                name: 'StoreA',
                categories: [{
                    id: 0,
                    games: [{
                        boxName: 'A-A',
                        sellPrice: 0,
                        id: ''
                    },
                    {
                        boxName: 'A-B',
                        sellPrice: 0,
                        id: ''
                    }]
                }],
            }, {
                name: 'StoreB',
                categories: [{
                    id: 0,
                    games: [{
                        boxName: 'B-A',
                        sellPrice: 0,
                        id: ''
                    },
                    {
                        boxName: 'B-B',
                        sellPrice: 0,
                        id: ''
                    }]
                }],
            }],
        }
        const exampleCurrentState: GameStoreResponse = {
            dateTaken: new Date(),
            stores: [{
                name: 'StoreA',
                categories: [{
                    id: 0,
                    games: [{
                        boxName: 'A-B',
                        sellPrice: 0,
                        id: ''
                    },
                    {
                        boxName: 'A-C',
                        sellPrice: 0,
                        id: ''
                    }]
                }],
            }, {
                name: 'StoreB',
                categories: [{
                    id: 0,
                    games: [{
                        boxName: 'B-B',
                        sellPrice: 0,
                        id: ''
                    },
                    {
                        boxName: 'B-C',
                        sellPrice: 0,
                        id: ''
                    }]
                }],
            }]
        }

        const expectedDelta = [
            {
                name: "StoreA",
                categories: [
                    {
                        id: 0,
                        removedGames: [
                            {
                                boxName: "A-A",
                                sellPrice: 0,
                                id: "",
                            },
                        ],
                        newGames: [
                            {
                                boxName: "A-C",
                                sellPrice: 0,
                                id: "",
                            },
                        ],
                        name: "",
                    },
                ],
            },
            {
                name: "StoreB",
                categories: [
                    {
                        id: 0,
                        removedGames: [
                            {
                                boxName: "B-A",
                                sellPrice: 0,
                                id: "",
                            },
                        ],
                        newGames: [
                            {
                                boxName: "B-C",
                                sellPrice: 0,
                                id: "",
                            },
                        ],
                        name: "",
                    },
                ],
            },
        ]

    const mockDatabaseService = {
        getUserWithId: vi.fn(),
        storeStoreStateForUser: vi.fn(),
        getStoreStateMetadataForUser: vi.fn(),
        getStoreStateFromId: vi.fn(),
        getStoreStateFirstYesterdayForUser: vi.fn(),

    };

    const mockStoreApiService = {
        getListOfGamesForUser: vi.fn()
    }

    beforeEach(async () => {
        vi.clearAllMocks();
        process.env.API_SECRET = 'SECRET';

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DeltaService,
                {
                    provide: DatabaseService,
                    useValue: mockDatabaseService,
                },
                DeltaService,
                {
                    provide: StoreApiService,
                    useValue: mockStoreApiService
                }

            ],
        }).compile();

        service = module.get(DeltaService);
    });

    describe('recordCurrentStoreStateForUserId', async () => {
        it('When given an unknown user throw a NotFoundException', async () => {
            mockDatabaseService.getUserWithId.mockResolvedValue(undefined)
            await expect(service.recordCurrentStoreStateForUserId(1)).rejects.toThrow(NotFoundException)
        })

        it('When given a known user returns the metadata for the saved state', async () => {
            const metadata: StateMetadata = { userId: 1, stateId: 1, date: new Date() }

            mockDatabaseService.getUserWithId.mockResolvedValue(exampleUser)
            mockDatabaseService.storeStoreStateForUser.mockResolvedValue(metadata)
            mockStoreApiService.getListOfGamesForUser.mockResolvedValue(exampleGameStoreResponse)
            const res = await service.recordCurrentStoreStateForUserId(1)
            expect(mockDatabaseService.getUserWithId).toHaveBeenCalledOnce()
            expect(mockDatabaseService.storeStoreStateForUser).toHaveBeenCalledOnce()
            expect(res).toBe(metadata)
        })
    })

    describe('recordCurrentStoreStateForUser', async () => {
        it('When sucessful, returns the metadata for the saved state', async () => {
            const metadata: StateMetadata = { userId: 1, stateId: 1, date: new Date() }
            mockDatabaseService.storeStoreStateForUser.mockResolvedValue(metadata)
            mockStoreApiService.getListOfGamesForUser.mockResolvedValue(exampleGameStoreResponse)
            const res = await service.recordCurrentStoreStateForUser(exampleUser)
            expect(mockDatabaseService.storeStoreStateForUser).toHaveBeenCalledOnce()
            expect(res).toBe(metadata)
        })
    })

    describe('getStateMetadataForUserId', async () => {
        it('When given an unknown user throw a NotFoundException', async () => {
            mockDatabaseService.getUserWithId.mockResolvedValue(undefined)
            await expect(service.getStateMetadataForUserId(1)).rejects.toThrow(NotFoundException)
        })

        it('When given a known user, return the metadata of all saved states for the user', async () => {
            const metadata: StateMetadataResponse = { stateMetadata: [{ userId: 1, stateId: 1, date: new Date() }] }
            mockDatabaseService.getUserWithId.mockResolvedValue(exampleUser)
            mockDatabaseService.getStoreStateMetadataForUser.mockResolvedValue(metadata)
            const res = await service.getStateMetadataForUserId(1)
            expect(mockDatabaseService.getUserWithId).toHaveBeenCalledWith(1)
            expect(mockDatabaseService.getStoreStateMetadataForUser).toHaveBeenCalledWith(exampleUser)
            expect(res).toBe(metadata)
        })
    })

    describe('getStateMetadataForUser', async () => {
        it('When no state data is found for user, throws a NotFoundException', async () => {
            const metadata: StateMetadataResponse = { stateMetadata: [] }
            mockDatabaseService.getStoreStateMetadataForUser.mockResolvedValue(metadata)
            await expect(service.getStateMetadataForUser(exampleUser)).rejects.toThrow(NotFoundException)
        })

        it('When a state data exists for the user, returns a list of all state metadata', async () => {
            const metadata: StateMetadataResponse = { stateMetadata: [{ userId: 1, stateId: 1, date: new Date() }] }
            mockDatabaseService.getStoreStateMetadataForUser.mockResolvedValue(metadata)
            const res = await service.getStateMetadataForUser(exampleUser)
            expect(mockDatabaseService.getStoreStateMetadataForUser).toHaveBeenCalledWith(exampleUser)
            expect(res).toBe(metadata)
        })
    })

    describe('getStoreDeltaForUserFromId', async () => {

        it('When given a stateId that does not exist for the user, throws a NotFoundException', async () => {
            mockDatabaseService.getStoreStateFromId.mockResolvedValue(undefined)
            await expect(service.getStoreDeltaForUserFromId(exampleUser, 1)).rejects.toThrow(NotFoundException)
        })

        it('When given a stateId that exists for the user, returns a delta', async () => {
            mockDatabaseService.getStoreStateFromId.mockResolvedValue(examplePreviousState)
            mockStoreApiService.getListOfGamesForUser.mockResolvedValue(exampleCurrentState)
            const res = await service.getStoreDeltaForUserFromId(exampleUser, 1)
            expect(res.originalStoreState).toEqual(examplePreviousState.stores)
            expect(res.stores).toEqual(expectedDelta)
        })
    })

    describe('getStoreDeltaForUserFromLatest', async () => {
        it('If a state does not exist for the user, throws a NotFoundException', async () => {
            mockDatabaseService.getStoreStateFirstYesterdayForUser.mockResolvedValue(undefined)
            await expect(service.getStoreDeltaForUserFromYesterday(exampleUser)).rejects.toThrow(NotFoundException)
        })

        it('If a state exists for the user, returns a delta', async () => {
            mockDatabaseService.getStoreStateFirstYesterdayForUser.mockResolvedValue(examplePreviousState)
            mockStoreApiService.getListOfGamesForUser.mockResolvedValue(exampleCurrentState)
            const res = await service.getStoreDeltaForUserFromYesterday(exampleUser)
            expect(res.originalStoreState).toEqual(examplePreviousState.stores)
            expect(res.stores).toEqual(expectedDelta)
        })
    })
});