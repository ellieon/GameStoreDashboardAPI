export type CexApiQueryModel = {
    attributesToRetrieve: string[],
    facetFilters: string[],
    filters: string, 
    hitsPerPage: number,
    maxValuesPerFacet: number,
    page: number
}

export type CexQueryResponseModel = {
    hits: CexGameHit[],
}

export type CexProductLine = {
    superCatId: number,
    productLineId: number,
    productLineName: string,
    totalCategories: number,
    imageName: string
}

export type CexGameHit = {
    boxName: string,
    sellPrice: number,
    productLineId: number[],
    outOfStock: string[],
    boxId: string
}

export type CexProductLineResponseModel = {
    response: CexProductLineResponse
}

export type CexProductLineResponse = {
    ack: string,
    data: CexProductLineObject
    error: CexProductLineError

}

export type CexProductLineObject = {
    productLines: CexProductLine[]
}

export type CexProductLineError = {
    code: string,
    internalMessage: string,
    moreInfo: string[],

}