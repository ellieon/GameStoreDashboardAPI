import { Injectable } from '@nestjs/common';
import { cexApiQueryModel } from '../model/cexApiModel.js';
import axios from 'axios';

@Injectable()
export class CexApiService {
  public async queryGameApi(): Promise<string[]> {
    const stores = this.getStoresForUser()
    const categories = this.getCategoriesForUser()  
    const response = await axios.post('https://search.webuy.io/1/indexes/prod_cex_uk/query', this.buildQuery(stores, categories));

    return this.formatData(this.getGamesFromResponse(response.data), stores, categories);
  }

  private formatData(inputData: any[], stores: string[], categories: string[]): any{
    const data: any[] = []
    const storeMap: Map<String, any> = new Map()
    stores.forEach(store => {
        const storeObj = {
            storeName: store,
            categories : categories.map(category => {
                return {
                    id: category,
                    games: []
                }
                
            })
        }
        storeMap.set(store, storeObj)
    })

    inputData.forEach(game => {
        stores.forEach(store => {
            if(game.outOfStock.indexOf(store) == -1){
                const storeObj = storeMap.get(store)
                storeObj.categories.forEach((category: {
                    games: any; id: any; }) => {
                        console.log(category.id)
                        console.log(game.productLineId)
                    if(game.productLineId.indexOf(Number(category.id)) > -1){
                        console.log('match')
                        category.games.push({boxName: game.boxName, sellPrice: game.sellPrice});
                    }
                });
            }
        });
    })
    
    storeMap.forEach(element => {
        data.push(element);
    });
    return data;
  }

  private buildQuery(stores: string[], categories: string[]): cexApiQueryModel
  {
    return {
        attributesToRetrieve: ['boxName', 'sellPrice', 'productLineId', 'outOfStock'],
        facetFilters: [ this.getStoresFilterString(stores) ],
        filters: `boxVisibilityOnWeb=1 AND boxSaleAllowed=1 AND (${this.getCategoryFilterString(categories)}) AND sellPrice > 0 AND (inStockStore=1 OR inStockOnline=1) AND (collectionQuantity>0 OR ecomQuantity>0)`,
        hitsPerPage: 1000,
        maxValuesPerFacet: 1000,
        page: 0
    }
  }

  private getStoresForUser(): string[]{
    return ['Solihull', 'Birmingham', 'Acocks Green'] 
  }

  private getStoresFilterString(stores: string[]): string[]{
    const storeStrings = stores.map((store: string) => {
        return `stores:${store}`
    })

    return storeStrings
  }

  private getCategoriesForUser(): string[] {
    return ['67', '70']
  }
  private getCategoryFilterString(categories: string[]): string{
    return 'productLineId=67 OR productLineId=70'
  }

  private getGamesFromResponse(data: any): string[] { 
    const hits = data.hits.map((hit: any) => {
      const { boxName, sellPrice, productLineId, outOfStock } = hit;
      return { boxName, sellPrice, productLineId, outOfStock };
    });
    return hits;
  }
}
