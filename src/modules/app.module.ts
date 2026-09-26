import { Module } from '@nestjs/common';
import { CexController } from '../controller/cex.controller.js';
import { CexApiService } from '../service/cexApi.service.js';
import { ConfigModule } from '@nestjs/config';
import { DatabaseService } from '../service/database.service.js';

@Module({
  imports: [
        ConfigModule.forRoot({
            isGlobal: true,   
        }),
    ],
  controllers: [CexController],
  providers: [CexApiService, DatabaseService],
})
export class AppModule {}
