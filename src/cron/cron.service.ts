import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ListService } from '../list/list.service';
import { BotService } from '../bot/bot.service';

@Injectable()
export class CronService {
  private static readonly PERIOD = 5;
  private readonly logger = new Logger(CronService.name);

  constructor(
    private listService: ListService,
    private botService: BotService,
  ) {
    this.update();
  }

  @Cron(`*/${CronService.PERIOD} * * * *`)
  public async update() {
    const { list, updated } = await this.listService.update();
    if (updated) {
      await this.botService.notify(list);
    }
    this.info();
  }

  private info() {
    this.logger.verbose(`Next request in ${CronService.PERIOD} minutes`);
  }
}
