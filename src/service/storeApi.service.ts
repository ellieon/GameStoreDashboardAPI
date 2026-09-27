import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { StoreApiQueryModel, StoreGameHit, StoreProductLine, StoreProductLineResponseModel, StoreQueryResponseModel } from '../model/store.js';
import axios from 'axios';
import { DatabaseService } from './database.service.js';
import { GameStore, GameStoreGame, GameStoreResponse } from '../model/gameStore.js';
import { getRequiredEnvVar } from '../common/getRequiredEnvVar.js';
import { User } from '../model/user.js';

@Injectable()
export class StoreApiService {

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

  public async getListOfGamesForUser(user: User): Promise<GameStoreResponse> {

    const preferences = await this.databaseService.getPreferencesForUser(user)

    if(!preferences) {
        throw new BadRequestException('Preferences for user not set')
    }

    const stores = preferences.stores.sort((a, b) =>
      a.localeCompare(b)
    );

    const categories =  preferences.categories.sort((a, b) =>
      a.localeCompare(b)
    );

    const url = getRequiredEnvVar('QUERY_URL')
    const productLines = await this.getProductLines()
    let storeData = []

    try {
      const results = await Promise.all(
        stores.map(store =>
          axios.post<StoreQueryResponseModel>(url, this.buildQueryParameters(store, categories))
        )
      )

      storeData = results.map((result, index) =>
        this.buildStoreObjFromGames(
          result.data.hits,
          stores[index],
          categories,
          productLines
        )
      )

      return { stores: storeData }
    } catch (error) {
      throw new ServiceUnavailableException(error, 'Unable to connect to store endpoint')
    }
  }

  public async getProductLines(...superCatIds: number[]): Promise<StoreProductLine[]> {
    if (superCatIds.length === 0)
      superCatIds = [1]

    const url = getRequiredEnvVar('CATEGORY_URL')

    try {
      const response = await axios.get<StoreProductLineResponseModel>(`${url}/productlines`, {
        params: {
          superCatIds: JSON.stringify(superCatIds)
        }
      })
      return response.data.response.data.productLines
    } catch (error) {
      throw new ServiceUnavailableException(error, 'Unable to connect to store endpoint')
    }

  }

  private buildStoreObjFromGames(inputData: StoreGameHit[], store: string, categories: string[], productLines: StoreProductLine[]): GameStore {
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
      if (!game.outOfStock.includes(store)) {
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

  private buildQueryParameters(store: string, categories: string[]): StoreApiQueryModel {
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
