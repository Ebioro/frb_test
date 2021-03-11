import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule,ConfigService } from '@nestjs/config';
import frb from './config/frb';


@Module({
  imports: [ConfigModule.forRoot({
    envFilePath: [process.cwd() + '/' + (process.env.NODE_ENV || '') + '.env'],
    load: [frb],
    isGlobal: true,
  }),],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
