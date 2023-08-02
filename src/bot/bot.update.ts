import {
  Command,
  Ctx,
  InjectBot,
  Message,
  Sender,
  Start,
  Update,
} from 'nestjs-telegraf';
import { Injectable, UseFilters, UseGuards } from '@nestjs/common';
import { User } from '../model/user/user.model';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SceneContext } from 'telegraf/typings/scenes';
import { BotScene } from './scenes/scenes.constants';
import { BotService } from './bot.service';
import { Telegraf } from 'telegraf';
import { User as TelegramUser } from 'typegram';
import { AvailableCommands, myCommands } from './bot.constants';
import { WithPersonGuard } from './guards/with-person.guard';
import { AnyExceptionFilter } from './filters/any-exception.filter';
import { GuardExceptionFilter } from './filters/guard-exception.filter';
import { Person } from '../model/person/person.model';

@Update()
@Injectable()
export class BotUpdate {
  constructor(
    @InjectBot() private bot: Telegraf<SceneContext>,
    private botService: BotService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Person)
    private personRepository: Repository<Person>,
  ) {
    bot.telegram.setMyCommands(myCommands);
  }

  @Start()
  @UseFilters(AnyExceptionFilter)
  async start(@Ctx() context: SceneContext) {
    await context.scene.enter(BotScene.PERSON_ID);
  }

  @Command(AvailableCommands.CHECK)
  @UseFilters(AnyExceptionFilter, GuardExceptionFilter)
  @UseGuards(WithPersonGuard)
  async check(
    @Ctx() context: SceneContext,
    @Sender() sender: TelegramUser,
    @Message('text') message: string,
  ) {
    const user = await this.userRepository.findOneBy({ id: sender.id });
    const body = message.replace(/\/[a-zA-Z]+\s*/, '');
    const about = body
      ? await this.personRepository.findOneBy([
          {
            id: body,
          },
          {
            user: {
              username: body,
            },
          },
        ])
      : user.person;

    if (!about) {
      await context.reply('No such person in the table');
      return;
    }

    await this.botService.sendCurrentInfo(user, about);
  }

  @Command(AvailableCommands.TOP)
  @UseFilters(AnyExceptionFilter, GuardExceptionFilter)
  @UseGuards(WithPersonGuard)
  async top(@Ctx() context: SceneContext, @Sender() sender: TelegramUser) {
    const user = await this.userRepository.findOneBy({ id: sender.id });
    await this.botService.sendTop(user);
  }
}
