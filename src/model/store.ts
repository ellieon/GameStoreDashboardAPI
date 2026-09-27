export type StoreApiQueryModel = {
    attributesToRetrieve: string[],
    facetFilters: string[],
    filters: string, 
    hitsPerPage: number,
    maxValuesPerFacet: number,
    page: number
}

export type StoreQueryResponseModel = {
    hits: StoreGameHit[],
}

export type StoreProductLine = {
    superCatId: number,
    productLineId: number,
    productLineName: string,
    totalCategories: number,
    imageName: string
}

export type StoreGameHit = {
    boxName: string,
    sellPrice: number,
    productLineId: number[],
    outOfStock: string[],
    boxId: string
}

export type StoreProductLineResponseModel = {
    response: StoreProductLineResponse
}

export type StoreStoresResponseModel = {
    response: StoreStoresResponse
}

export type StoreStoresResponse = {
    ack: string,
    data: StoreStoresObject
    error: StoreProductLineError

}
export type StoreStoresObject = {
    stores: StoreStore[]
}


export type StoreStore = {
    storeId: number,
    storeName: string
}

export type StoreProductLineResponse = {
    ack: string,
    data: StoreProductLineObject
    error: StoreProductLineError

}

export type StoreProductLineObject = {
    productLines: StoreProductLine[]
}

export type StoreProductLineError = {
    code: string,
    internalMessage: string,
    moreInfo: string[],

}