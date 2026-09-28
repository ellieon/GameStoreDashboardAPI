import { Controller, Get, Header, ParseArrayPipe, Query } from '@nestjs/common';
import { GameStoreProductLineResponse, GameStoreResponse } from '../model/gameStore.js';
import { StoreApiService } from '../service/storeApi.service.js';
import { Roles } from '../guard/roles.decorator.js';
import { Role, User } from '../model/user.js';
import { CurrentUser } from '../guard/currentUser.decorator.js';

@Controller('/store')
export class StoreController {
  constructor(private readonly appService: StoreApiService) {}

  @Get('/games')
  @Roles(Role.Admin, Role.User)
  @Header('Content-Type', 'application/json')
  async getGames(@CurrentUser() user: User): Promise<GameStoreResponse> {
    const res = await this.appService.getListOfGamesForUser(user);
    return res;
  }

  @Get('/product-lines')
  @Roles(Role.Admin, Role.User)
  @Header('Content-Type', 'application/json')
  async getProductLines(@Query('superCatIds',new ParseArrayPipe({items: Number, separator: ','})) superCatIds: number[]): Promise<GameStoreProductLineResponse> {
    const productLines = await this.appService.getProductLines(...superCatIds) ;
    return { productLines: productLines };
  }
}
