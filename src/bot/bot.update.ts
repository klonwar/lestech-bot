import {
  Command,
  Ctx,
  InjectBot,
  Sender,
  Start,
  Update,
} from 'nestjs-telegraf';
import { Injectable } from '@nestjs/common';
import { User } from '../model/user/user.model';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { SceneContext } from 'telegraf/typings/scenes';
import { BotScene } from './scenes/scenes.constants';
import { ListService } from '../list/list.service';
import { BotService } from './bot.service';
import { Telegraf } from 'telegraf';
import { User as TelegramUser } from 'typegram';
import { AvailableCommands, myCommands } from './bot.constants';

@Update()
@Injectable()
export class BotUpdate {
  constructor(
    @InjectBot() private bot: Telegraf<SceneContext>,
    private configService: ConfigService,
    private listService: ListService,
    private botService: BotService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    bot.telegram.setMyCommands(myCommands);
  }

  @Start()
  async start(@Ctx() context: SceneContext) {
    await context.scene.enter(BotScene.PERSON_ID);
  }

  @Command(AvailableCommands.CHECK)
  async check(@Ctx() context: SceneContext, @Sender() sender: TelegramUser) {
    const { list, updated } = await this.listService.check();
    const user = await this.userRepository.findOneBy({ id: sender.id });
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

  @Command(AvailableCommands.TOP)
  async top(@Ctx() context: SceneContext) {
    const message = await this.botService.top();
    await context.reply(message);
  }
}
