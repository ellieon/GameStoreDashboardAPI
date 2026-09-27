import { Controller, Get, Header, ParseArrayPipe, Query } from '@nestjs/common';
import { CexApiService } from '../service/cexApi.service.js';
import { GameStoreProductLineResponse, GameStoreResponse } from '../model/gameStore.js';

@Controller('/cex')
export class CexController {
  constructor(private readonly appService: CexApiService) {}

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
