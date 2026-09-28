import { Module } from '@nestjs/common';
import { StoreController } from '../controller/store.controller.js';
import { StoreApiService } from '../service/storeApi.service.js';
import { ConfigModule } from '@nestjs/config';
import { DatabaseService } from '../service/database.service.js';
import { AuthService } from '../service/auth.service.js';
import { UserController } from '../controller/user.controller.js';
import { UserService } from '../service/user.service.js';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from '../guard/roles.guard.js';
import { DeltaController } from '../controller/delta.controller.js';
import { DeltaService } from '../service/delta.service.js';

@Module({
  imports: [
        ConfigModule.forRoot({
            isGlobal: true,   
        }),
    ],
  controllers: [StoreController, UserController, DeltaController],
  providers: [StoreApiService, DatabaseService, AuthService, UserService, DeltaService,
    { provide: APP_GUARD, useClass: RolesGuard }],
})

export class AppModule{
}
