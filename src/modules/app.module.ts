import { DynamicModule, ForwardReference, Module, Type } from '@nestjs/common';
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
import { ScheduleModule } from '@nestjs/schedule';
import { FetchService } from '../service/fetch.service.js';

const imports: (DynamicModule | Promise<DynamicModule> | Type<any> | ForwardReference<any>)[]  = [
  ConfigModule.forRoot({
    isGlobal: true,
  })
];

if (process.env.ENABLE_SCHEDULER === 'true') {
  console.log('Scheduler is enabled')
  imports.push(ScheduleModule.forRoot());
} else {
  console.log('Scheduler is disabled')
}

@Module({
  imports: imports,
  controllers: [StoreController, UserController, DeltaController],
  providers: [
    StoreApiService,
    DatabaseService,
    AuthService,
    UserService,
    DeltaService,
    FetchService,
    { provide: APP_GUARD, useClass: RolesGuard }],
})

export class AppModule {
}
