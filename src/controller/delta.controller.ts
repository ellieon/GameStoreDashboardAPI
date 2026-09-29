import { Controller, Get, Header, Query } from '@nestjs/common';
import { Roles } from '../guard/roles.decorator.js';
import { Role, User } from '../model/user.js';
import { CurrentUser } from '../guard/currentUser.decorator.js';
import { DeltaService } from '../service/delta.service.js';
import { StateMetadata, StateMetadataResponse } from '../model/delta.js';

@Controller('/delta')
export class DeltaController {
  constructor(private readonly deltaService: DeltaService) {}

  @Get('/record-store-state')
  @Roles(Role.Admin)
  @Header('Content-Type', 'application/json')
  async recordCurrentStoreStateForUser(@CurrentUser() user: User, @Query('userId') userId?: number): Promise<StateMetadata> {
    if(!userId)
       return await this.deltaService.recordCurrentStoreStateForUser(user)
    else 
       return await this.deltaService.recordCurrentStoreStateForUserId(userId);
  }

  @Get('/get-store-delta')
  @Roles(Role.Admin, Role.User)
  @Header('Content-Type', 'application/json')
  async getStoreDeltaForCurrentUser(@CurrentUser() user: User, @Query('stateId') stateId?: number){
    if(!stateId)
        return await this.deltaService.getStoreDeltaForUserFromYesterday(user)
    else 
        return await this.deltaService.getStoreDeltaForUserFromId(user, stateId)
  }

  @Get('/get-store-record-metadata')
  @Roles(Role.Admin, Role.User)
  @Header('Content-Type', 'application/json')
  async getStoreRecordMetadataForUser(@CurrentUser() user: User, @Query('userId') userId?: number): Promise<StateMetadataResponse>{
    if(!userId)
       return await this.deltaService.getStateMetadataForUser(user)
    else 
       return await this.deltaService.getStateMetadataForUserId(userId);
  }
}
