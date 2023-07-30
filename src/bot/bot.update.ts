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
import { SceneContext } from 'telegraf/typings/scenes';
import { BotScene } from './scenes/scenes.constants';
import { BotService } from './bot.service';
import { Telegraf } from 'telegraf';
import { User as TelegramUser } from 'typegram';
import { AvailableCommands, myCommands } from './bot.constants';

@Update()
@Injectable()
export class BotUpdate {
  constructor(
    @InjectBot() private bot: Telegraf<SceneContext>,
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
    // @TODO: specify target user id after check command
    const user = await this.userRepository.findOneBy({ id: sender.id });
    await this.botService.sendCurrentInfo(user);
  }

  @Command(AvailableCommands.TOP)
  async top(@Ctx() context: SceneContext, @Sender() sender: TelegramUser) {
    const user = await this.userRepository.findOneBy({ id: sender.id });
    await this.botService.sendTop(user);
  }
}
