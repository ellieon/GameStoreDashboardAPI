import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { cexApiQueryModel, CexGameHit, CexProductLine, CexProductLineResponseModel, CexQueryResponseModel } from '../model/cexApiModel.js';
import axios from 'axios';
import { DatabaseService } from './database.service.js';
import { getRequiredEnvVar } from '../common/getRequiredEnvVar.js';
import { GameStore, GameStoreGame, GameStoreResponse } from '../model/gameStore.js';

@Injectable()
export class CexApiService {

  private static readonly DEFAULT_PRODUCT_LINES: number[] = [
    1, //Gaming
    4, //Phones
    3, //Computing
    5, //Electronics
    2, // Film
    9, // New Accessories
    10 // Apparel
  ]
  constructor(
    private databaseService: DatabaseService
  ) { }

  public async getListOfGamesForUser(): Promise<GameStoreResponse> {
    const stores = this.databaseService.getStoresForUser().sort((a, b) =>
      a.localeCompare(b)
    );

    const categories = this.databaseService.getCategoriesForUser().sort((a, b) =>
      a.localeCompare(b)
    );

    const url = getRequiredEnvVar('CEX_QUERY_URL')

    const productLines = await this.getProductLines()

    let storeData = []

    const results = await Promise.all(
      stores.map(store => 
        axios.post<CexQueryResponseModel>(url, this.buildQueryParameters(store, categories))
      )
    ).catch(() => { throw new ServiceUnavailableException('Unable to connect to CeX endpoint')})

    storeData = results.map( result => 
      this.buildStoreObjFromGames(result.data.hits, stores[results.indexOf(result)], categories, productLines)
    )
    
    return { stores: storeData }
  }

  public async getProductLines(...superCatIds: number[]): Promise<CexProductLine[]> {
    if (superCatIds.length === 0)
      superCatIds = [1, 55]

    const url = getRequiredEnvVar('CEX_CATEGORY_URL')

    try {
      const response = await axios.get<CexProductLineResponseModel>(`${url}/productlines`, {
        params: {
          superCatIds: JSON.stringify(superCatIds)
        }
      })

      return response.data.response.data.productLines
    } catch (error) {
      throw new ServiceUnavailableException('Unable to connect to CeX endpoint')
    }

  }

  private buildStoreObjFromGames(inputData: CexGameHit[], store: string, categories: string[], productLines: CexProductLine[]): GameStore {
    let ids: string[] = []

    const storeObj: GameStore = {
      name: store,
      availableBoxIds: ids,
      categories: categories.map(category => {
        const productLine = productLines.find(productLine => {
          return String(productLine.productLineId) === category
        })
        return {
          id: Number(category),
          name: productLine?.productLineName,
          games: []
        }
      })
    }

    const sortedData = inputData.sort((a, b) =>
      a.boxName.localeCompare(b.boxName)
    );

    sortedData.forEach(game => {
      if (game.outOfStock.indexOf(store) == -1) {
        storeObj.availableBoxIds.push(game.boxId)
        storeObj.categories.forEach((category: {
          games: GameStoreGame[]; id: number;
        }) => {
          if (game.productLineId.indexOf(Number(category.id)) > -1) {
            const gameStoreGame: GameStoreGame = {
              boxName: game.boxName,
              sellPrice: game.sellPrice,
              id: game.boxId
            }
            category.games.push(gameStoreGame);
          }
        });
      }
    });

    return storeObj;
  }

  private buildQueryParameters(store: string, categories: string[]): cexApiQueryModel {
    return {
      attributesToRetrieve: ['boxName', 'sellPrice', 'productLineId', 'outOfStock', 'boxId'],
      facetFilters: [`stores: ${store}`],
      filters: `boxVisibilityOnWeb=1 AND boxSaleAllowed=1 AND (${this.getCategoryFilterString(categories)}) AND sellPrice > 0 AND (inStockStore=1 OR inStockOnline=1) AND (collectionQuantity>0 OR ecomQuantity>0)`,
      hitsPerPage: 1000,
      maxValuesPerFacet: 1000,
      page: 0
    }
  }

  private getCategoryFilterString(categories: string[]): string {
    let filterString = ''
    for (let i = 0; i < categories.length; i++) {
      filterString += `productLineId=${categories[i]}`
      if (i != categories.length - 1) {
        filterString += ' OR '
      }
    }
    return filterString
  }
}
