export type cexApiQueryModel = {
    attributesToRetrieve: string[],
    facetFilters: any,
    filters: string, 
    hitsPerPage: number,
    maxValuesPerFacet: number,
    page: number
}
