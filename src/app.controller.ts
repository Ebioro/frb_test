import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getHello() {
    return await this.appService.getTransaction();
    return await this.appService.sendPayment();
    //return await this.appService.txBuilder();
  }
}
