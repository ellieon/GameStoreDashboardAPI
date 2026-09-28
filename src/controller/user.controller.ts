import { Body, Controller, Get, Header, Put, Req, UsePipes, ValidationPipe } from '@nestjs/common';
import { UserService } from '../service/user.service.js';
import { Role, UserPreferencesRequestDTO } from '../model/user.js';
import { Roles } from '../guard/roles.decorator.js';
import { CurrentUser } from '../guard/currentUser.decorator.js';
import { User } from '../model/user.js';

@Controller('/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Put('/preferences')
  @UsePipes(new ValidationPipe())
  @Roles(Role.Admin, Role.User)
  @Header('Content-Type', 'application/json')
  async updatePreferencesForCurrentUser(@CurrentUser() user: User, @Body() userPreferences: UserPreferencesRequestDTO): Promise<UserPreferencesRequestDTO> {
    const res = await this.userService.updatePreferencesForUser(user, userPreferences.stores, userPreferences.categories);
    return res
  }

  @Get('/preferences')
  @Header('Content-Type', 'application/json')
  async getPreferencesForCurrentUser(@Req() request: Request): Promise<UserPreferencesRequestDTO> {
    const res = await this.userService.getPreferencesForUser((request as any).user);
    return res
  }

}
