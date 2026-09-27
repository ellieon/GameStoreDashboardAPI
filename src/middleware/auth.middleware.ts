import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../service/auth.service.js';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const apiToken = req.headers['x-api-key'] as string;

    if (!apiToken) {
      throw new UnauthorizedException('Missing API Token');
    }

      const user = await this.authService.verifyToken(apiToken);
      (req as any).user = user;
      next();

  }
}