import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { ScheduleModule } from '@nestjs/schedule';
import { ListModule } from '../list/list.module';
import { BotModule } from '../bot/bot.module';

@Module({
  imports: [ScheduleModule.forRoot(), ListModule, BotModule],
  providers: [CronService],
})
export class CronModule {}
