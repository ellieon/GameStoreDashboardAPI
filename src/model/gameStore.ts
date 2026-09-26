export type GameStoreGame = {
    boxName: string,
    sellPrice: number,
    id: string
}
export type GameStoreCategory = {
    id: number,
    name?: string,
    games: GameStoreGame[]
}

export type GameStore = {
    name: string,
    availableBoxIds: string[]
    categories: GameStoreCategory[]
}

export type GameStoreResponse = {
    stores: GameStore[]
}  