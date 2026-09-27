import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { User } from '../model/user.js';

@Injectable()
export class AdminMiddleware implements NestMiddleware {
  constructor() { }

  async use(req: Request, res: Response, next: NextFunction) {

    const user = (req as any).user as User

    if (!user) throw new UnauthorizedException('User not found')

    if (!user.permissions.includes('admin')) throw new UnauthorizedException('Insufficient permission')

    next()
  }
}