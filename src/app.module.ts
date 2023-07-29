import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { TelegrafModule } from 'nestjs-telegraf';
import { AppUpdate } from './app.update';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Person } from './model/person/person.model';
import { List } from './model/list/list.model';
import { User } from './model/user/user.model';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { session } from 'telegraf';
import { ScenesModule } from './scenes/scenes.module';
import { CronService } from './cron/cron.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule,
    TelegrafModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        token: configService.get<string>('TELEGRAM_TOKEN'),
        middlewares: [session()],
      }),
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: './db.sqlite',
      synchronize: true,
      autoLoadEntities: true,
    }),
    TypeOrmModule.forFeature([User, Person, List]),
    ScenesModule,
  ],
  controllers: [],
  providers: [AppService, AppUpdate, CronService],
})
export class AppModule {}
