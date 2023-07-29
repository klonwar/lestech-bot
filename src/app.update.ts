import { Command, Ctx, Start, Update } from 'nestjs-telegraf';
import { Injectable } from '@nestjs/common';
import { AppService } from './app.service';
import { User } from './model/user/user.model';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { SceneContext } from 'telegraf/typings/scenes';
import { BotScene } from './scenes/scenes.constants';

@Update()
@Injectable()
export class AppUpdate {
  constructor(
    private configService: ConfigService,
    private appService: AppService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  @Start()
  async start(@Ctx() ctx: SceneContext) {
    await ctx.scene.enter(BotScene.PERSON_ID);
  }

  @Command('check')
  async check(@Ctx() ctx: SceneContext) {
    const { list, updated } = await this.appService.update();
    const url = this.configService.get<string>('URL');

    if (updated) {
      await ctx.reply(`New update - ${list.date}\n${url}`);
    } else {
      await ctx.reply(`No changes yet. \nLast update - ${list.date}`);
    }
  }
}
