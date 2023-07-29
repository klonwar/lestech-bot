import { Command, Ctx, Start, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { Injectable } from '@nestjs/common';
import { AppService } from './app.service';
import { User } from './model/user/user.model';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

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
  async start(@Ctx() ctx: Context) {
    const user = this.userRepository.create({
      ...ctx.from,
    });
    await this.userRepository.save(user);

    await ctx.reply('Welcome');
    // @TODO: Ask to write person id from the table
  }

  @Command('check')
  async check(@Ctx() ctx: Context) {
    const { list, updated } = await this.appService.update();
    const url = this.configService.get<string>('URL');

    if (updated) {
      await ctx.reply(`New update - ${list.date}\n${url}`);
    } else {
      await ctx.reply(`No changes yet. \nLast update - ${list.date}`);
    }
  }
}
