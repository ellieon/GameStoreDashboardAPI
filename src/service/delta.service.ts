import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { DatabaseService } from "./database.service.js";
import { StoreApiService } from "./storeApi.service.js";
import { User } from "../model/user.js";
import { CategoryDelta, StateMetadata, StateMetadataResponse, StoreDelta, StoreDeltaResponse } from "../model/delta.js";
import { GameStore, GameStoreCategory, GameStoreGame, GameStoreResponse } from "../model/gameStore.js";

@Injectable()
export class DeltaService {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly storeApiService: StoreApiService
    ) {}

    public async recordCurrentStoreStateForUserId(userId: number): Promise<StateMetadata> {
        const user = await this.databaseService.getUserWithId(userId)

        if (!user)
            throw new NotFoundException(`User with id ${userId} not found`)

        return await this.recordCurrentStoreStateForUser(user)
    }

    public async recordCurrentStoreStateForUser(user: User): Promise<StateMetadata> {
        const storeState = await this.storeApiService.getListOfGamesForUser(user)
        const metadata = await this.databaseService.storeStoreStateForUser(user, storeState)

        if(!metadata) 
            throw new InternalServerErrorException()

        return metadata
    }

    public async getStateMetadataForUserId(userId: number): Promise<StateMetadataResponse> {
        const user = await this.databaseService.getUserWithId(userId)
        if (!user)
            throw new NotFoundException(`User with id ${userId} not found`)

        return this.getStateMetadataForUser(user)
    }

    public async getStateMetadataForUser(user: User): Promise<StateMetadataResponse> {
        const metadata = await this.databaseService.getStoreStateMetadataForUser(user)

        if (metadata.stateMetadata.length === 0) {
            throw new NotFoundException(`No metadata for user id ${user.id} found`)
        }

        return metadata
    }

    public async getStoreDeltaForUserFromId(user: User, stateId: number): Promise<StoreDeltaResponse> {
        const storeState = await this.databaseService.getStoreStateFromId(stateId, user)
        if (!storeState) {
            throw new NotFoundException(`Unable to find state with id ${stateId} for user`)
        }

        return await this.getDeltaFromState(storeState, user)
    }

    public async getStoreDeltaForUserFromYesterday(user: User): Promise<StoreDeltaResponse> {
        const storeState = await this.databaseService.getStoreStateFirstYesterdayForUser(user)
        if (!storeState) {
            throw new NotFoundException(`Unable to find state for user`)
        }

        return await this.getDeltaFromState(storeState, user)
    }

    private async getDeltaFromState(prevState: GameStoreResponse, user: User): Promise<StoreDeltaResponse> {
        const currentGames = await this.storeApiService.getListOfGamesForUser(user)
        let storeDeltaResponse: StoreDeltaResponse = { comparisonDate: prevState.dateTaken, stores: [], originalStoreState: prevState.stores }

        currentGames.stores.forEach(store => {
            const prevStoreState = prevState.stores.find((prevStore) => {
                return prevStore.name === store.name
            })

            storeDeltaResponse.stores.push(this.getStoreDelta(prevStoreState, store))

        });

        return storeDeltaResponse
    }

    private getStoreDelta(prevState: GameStore | undefined, currentState: GameStore): StoreDelta {
        const storeDelta: StoreDelta = {
            name: currentState.name,
            categories: []
        }

        currentState.categories.forEach(category => {
            if(prevState){
                storeDelta.categories.push(this.getCategoryDelta(prevState.categories.find(prevCat => prevCat.name === category.name), category))
            } else {
                storeDelta.categories.push(this.getCategoryDelta(undefined, category))
            }
        });

        return storeDelta
    }

    private getCategoryDelta(prevState: GameStoreCategory | undefined, currentState: GameStoreCategory): CategoryDelta {
        const categoryDelta: CategoryDelta = {
            id: currentState.id,
            removedGames: [],
            newGames: [],
            name: currentState.name ? currentState.name : ""
        }

        if (prevState) {
            categoryDelta.newGames = this.getGameDiffs(prevState.games, currentState.games)
            categoryDelta.removedGames = this.getGameDiffs(currentState.games, prevState?.games)
        } else
            categoryDelta.newGames = currentState.games


        return categoryDelta
    }

    private getGameDiffs(a: GameStoreGame[], b: GameStoreGame[]): GameStoreGame[] {
        return b.filter(x => !a.find(e => e.boxName == x.boxName))
    }
}