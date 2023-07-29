import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { ScheduleModule } from '@nestjs/schedule';
import { ListModule } from '../list/list.module';

@Module({
  imports: [ScheduleModule.forRoot(), ListModule],
  providers: [CronService],
  exports: [CronService],
})
export class CronModule {}
