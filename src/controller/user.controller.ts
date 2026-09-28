import { Body, Controller, Get, Header, Post, Put, UsePipes, ValidationPipe } from '@nestjs/common';
import { UserService } from '../service/user.service.js';
import { CreateUserRequestDTO, Role, UserCreatedResponse, UserPreferencesRequestDTO } from '../model/user.js';
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
  @Roles(Role.Admin, Role.User)
  @Header('Content-Type', 'application/json')
  async putPreferencesForCurrentUser(@CurrentUser() user: User): Promise<UserPreferencesRequestDTO> {
    const res = await this.userService.getPreferencesForUser(user);
    return res
  }

  @Post('/create-user')
  @Roles(Role.Admin)
  @UsePipes(new ValidationPipe())
  @Header('Content-Type', 'application/json')
  async createUser(@Body() createUserRequest: CreateUserRequestDTO): Promise<UserCreatedResponse> {
    return await this.userService.createUser(createUserRequest)
  }


}
