import { GameStore, GameStoreGame } from "./gameStore.js"

export type StateMetadataResponse = {
    stateMetadata: StateMetadata[]
}

export type StateMetadata = {
    userId: number,
    stateId: number,
    date: Date
}

export type StoreDeltaResponse = {
    comparisonDate: Date,
    stores: StoreDelta[],
    originalStoreState: GameStore[]
}

export type StoreDelta = {
    name: string,
    categories: CategoryDelta[]
}

export type CategoryDelta = {
    id: number,
    name: string,
    removedGames: GameStoreGame[]
    newGames: GameStoreGame[]
}