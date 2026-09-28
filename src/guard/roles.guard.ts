
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../model/user.js';
import { ROLES_KEY } from './roles.decorator.js';
import { AuthService } from '../service/auth.service.js';


@Injectable()
export class RolesGuard implements CanActivate {

  constructor(private reflector: Reflector, private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(), 
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const req = context.switchToHttp().getRequest()
    const apiToken = context.switchToHttp().getRequest().headers['x-api-key'] as string;

    if (!apiToken) {
      throw new UnauthorizedException('Missing API Token');
    }
    
    const user = await this.authService.verifyToken(apiToken);

    req.user = user

    return requiredRoles.some((role) => user?.permissions.includes(role));
  }
}