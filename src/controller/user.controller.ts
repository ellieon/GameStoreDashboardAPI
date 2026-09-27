import { Body, Controller, Get, Header, Post, Req, UsePipes, ValidationPipe } from '@nestjs/common';
import { UserService } from '../service/user.service.js';
import { UserPreferencesRequestDTO } from '../model/user.js';

@Controller('/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/preferences')
  @UsePipes(new ValidationPipe())
  @Header('Content-Type', 'application/json')
  async updatePreferencesForCurrentUser(@Req() request: Request, @Body() userPreferences: UserPreferencesRequestDTO): Promise<UserPreferencesRequestDTO> {
    const res = await this.userService.updatePreferencesForUser((request as any).user, userPreferences.stores, userPreferences.categories);
    return res
  }

  @Get('/preferences')
  @Header('Content-Type', 'application/json')
  async getPreferencesForCurrentUser(@Req() request: Request): Promise<UserPreferencesRequestDTO> {
    const res = await this.userService.getPreferencesForUser((request as any).user);
    return res
  }

}
