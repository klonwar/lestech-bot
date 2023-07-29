import { Command, Ctx, Start, Update } from 'nestjs-telegraf';
import { Injectable } from '@nestjs/common';
import { User } from '../model/user/user.model';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { SceneContext } from 'telegraf/typings/scenes';
import { BotScene } from './scenes/scenes.constants';
import { ListService } from '../list/list.service';
import { BotService } from './bot.service';

@Update()
@Injectable()
export class BotUpdate {
  constructor(
    private configService: ConfigService,
    private listService: ListService,
    private botService: BotService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  @Start()
  async start(@Ctx() context: SceneContext) {
    await context.scene.enter(BotScene.PERSON_ID);
  }

  @Command('check')
  async check(@Ctx() context: SceneContext) {
    const { list, updated } = await this.listService.check();
    const userId = context.from.id;
    const user = await this.userRepository.findOneBy({ id: userId });
    const url = this.configService.get<string>('URL');

    if (updated) {
      await context.reply(
        `List updated - ${url}.\nSoon you'll receive notification`,
      );
    } else {
      await context.reply(`No changes yet`);
    }
    await this.botService.notify(list, user);
  }
}
