export type cexApiQueryModel = {
    attributesToRetrieve: string[],
    facetFilters: any,
    filters: string, 
    hitsPerPage: number,
    maxValuesPerFacet: number,
    page: number
}

export type CexProductLine = {
    superCatId: number,
    productLineId: number,
    productLineName: string,
    totalCategories: number,
    imageName: string
}