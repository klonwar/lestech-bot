import { Command, Ctx, Start, Update } from 'nestjs-telegraf';
import { Injectable } from '@nestjs/common';
import { User } from '../model/user/user.model';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { SceneContext } from 'telegraf/typings/scenes';
import { BotScene } from './scenes/scenes.constants';
import { ListService } from '../list/list.service';

@Update()
@Injectable()
export class BotUpdate {
  constructor(
    private configService: ConfigService,
    private listService: ListService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  @Start()
  async start(@Ctx() ctx: SceneContext) {
    await ctx.scene.enter(BotScene.PERSON_ID);
  }

  @Command('check')
  async check(@Ctx() ctx: SceneContext) {
    const { list, updated } = await this.listService.check();
    const url = this.configService.get<string>('URL');

    if (updated) {
      await ctx.reply(`List updated - ${list.date}\n${url}`);
    } else {
      await ctx.reply(`No changes yet. \nLast update - ${list.date}`);
    }
  }
}
