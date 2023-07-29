import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ListModule } from './list/list.module';
import { CronModule } from './cron/cron.module';
import { BotModule } from './bot/bot.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: './db.sqlite',
      synchronize: true,
      autoLoadEntities: true,
    }),
    BotModule,
    ListModule,
    CronModule,
  ],
})
export class AppModule {}
