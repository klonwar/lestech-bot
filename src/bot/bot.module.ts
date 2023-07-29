import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { BotUpdate } from './bot.update';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { session } from 'telegraf';
import { ScenesModule } from './scenes/scenes.module';
import { BotService } from './bot.service';
import { User } from '../model/user/user.model';
import { Person } from '../model/person/person.model';
import { List } from '../model/list/list.model';
import { ListModule } from '../list/list.module';

@Module({
  imports: [
    HttpModule,
    TelegrafModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        token: configService.get<string>('TELEGRAM_TOKEN'),
        middlewares: [session()],
      }),
    }),
    TypeOrmModule.forFeature([User, Person, List]),
    ScenesModule,
    ListModule,
  ],
  controllers: [],
  providers: [BotService, BotUpdate],
  exports: [ScenesModule],
})
export class BotModule {}
