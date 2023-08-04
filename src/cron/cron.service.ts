import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { ListService } from '../list/list.service';
import { BotService } from '../bot/bot.service';
import { ConfigService } from '@nestjs/config';
import { CronJob } from 'cron';
import { CronJobNames } from './cron.constants';

@Injectable()
export class CronService implements OnModuleInit {
  private readonly logger = new Logger(CronService.name);
  private jobs: Record<CronJobNames, CronJob> = {
    [CronJobNames.UPDATE]: new CronJob(
      this.configService.get<string>('CRON'),
      () => this.update(),
    ),
  };

  constructor(
    private configService: ConfigService,
    private schedulerRegistry: SchedulerRegistry,
    private listService: ListService,
    private botService: BotService,
  ) {
    this.update();
  }

  onModuleInit() {
    Object.entries(this.jobs).forEach(([name, job]) => {
      this.schedulerRegistry.addCronJob(name, job);
      job.start();
    });
  }

  public async update() {
    const { list, updated } = await this.listService.update();
    if (updated) {
      await this.botService.notify(list);
    }
    this.logger.verbose(
      `Updated. Cron configuration: ${this.configService.get<string>('CRON')}`,
    );
  }
}
