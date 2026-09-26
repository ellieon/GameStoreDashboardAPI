import { Controller, Get, Header, Query } from '@nestjs/common';
import { CexApiService } from '../service/cexApi.service.js';

@Controller('/cex-scraper')
export class CexController {
  constructor(private readonly appService: CexApiService) {}

  @Get('/games')
  @Header('Content-Type', 'application/json')
  async getGames(): Promise<any> {
    const res = await this.appService.getListOfGamesForUser();
    return res;
  }

  @Get('/product-lines')
  @Header('Content-Type', 'application/json')
  async getProductLines(@Query('superCatIds')superCatIds: number[] = []): Promise<any> {
    const res = await this.appService.getProductLines(...superCatIds);
    return res;
  }
}
