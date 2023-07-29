import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ListService } from '../list/list.service';

@Injectable()
export class CronService {
  private static readonly PERIOD = 1;
  private readonly logger = new Logger(CronService.name);

  constructor(private listService: ListService) {}

  @Cron(`*/${CronService.PERIOD} * * * *`)
  public async update() {
    await this.listService.update();
    this.logger.log(`Next request in ${CronService.PERIOD} minutes`);
  }
}
