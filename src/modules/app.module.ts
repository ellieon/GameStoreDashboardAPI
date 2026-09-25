import { Module } from '@nestjs/common';
import { AppController } from '../controller/app.controller.js';
import { AppService } from '../service/app.service.js';
import { CexController } from '../controller/cex.controller.js';
import { CexApiService } from '../service/cexApi.service.js';

@Module({
  imports: [],
  controllers: [AppController, CexController],
  providers: [AppService, CexApiService],
})
export class AppModule {}
