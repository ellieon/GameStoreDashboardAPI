import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { StoreController } from '../controller/store.controller.js';
import { StoreApiService } from '../service/storeApi.service.js';
import { ConfigModule } from '@nestjs/config';
import { DatabaseService } from '../service/database.service.js';
import { AuthService } from '../service/auth.service.js';
import { AuthMiddleware } from '../middleware/auth.middleware.js';

@Module({
  imports: [
        ConfigModule.forRoot({
            isGlobal: true,   
        }),
    ],
  controllers: [StoreController],
  providers: [StoreApiService, DatabaseService, AuthService],
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes('{*splat}');
  }
}
