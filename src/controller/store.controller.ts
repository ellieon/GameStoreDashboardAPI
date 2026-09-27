import { Controller, Get, Header, ParseArrayPipe, Query } from '@nestjs/common';
import { GameStoreProductLineResponse, GameStoreResponse } from '../model/gameStore.js';
import { StoreApiService } from '../service/storeApi.service.js';

@Controller('/store')
export class StoreController {
  constructor(private readonly appService: StoreApiService) {}

  @Get('/games')
  @Header('Content-Type', 'application/json')
  async getGames(): Promise<GameStoreResponse> {
    const res = await this.appService.getListOfGamesForUser();
    return res;
  }

  @Get('/product-lines')
  @Header('Content-Type', 'application/json')
  async getProductLines(@Query('superCatIds',new ParseArrayPipe({items: Number, separator: ','})) superCatIds: number[]): Promise<GameStoreProductLineResponse> {
    const productLines = await this.appService.getProductLines(...superCatIds) ;
    return { productLines: productLines };
  }
}
