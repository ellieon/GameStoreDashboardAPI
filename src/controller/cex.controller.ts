import { Controller, Get, Header } from '@nestjs/common';
import { CexApiService } from '../service/cexApi.service.js';

@Controller('/cex')
export class CexController {
  constructor(private readonly appService: CexApiService) {}

  @Get('/getGames')
  @Header('Content-Type', 'application/json')
  async getGames(): Promise<any> {
    const res = await this.appService.queryGameApi();
    console.log(res.length)
    return res;
  }
}
