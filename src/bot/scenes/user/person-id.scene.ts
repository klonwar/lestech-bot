import {
  Ctx,
  Hears,
  Message,
  Scene,
  SceneEnter,
  SceneLeave,
  Sender,
} from 'nestjs-telegraf';
import { SceneContext } from 'telegraf/typings/scenes';
import { BotScene } from '../scenes.constants';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../../model/user/user.model';
import { Repository } from 'typeorm';
import { Person } from '../../../model/person/person.model';
import { User as TelegramUser } from 'typegram/manage';

@Scene(BotScene.PERSON_ID)
export class PersonIdScene {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Person)
    private personRepository: Repository<Person>,
  ) {}

  @SceneEnter()
  async enter(@Ctx() context: SceneContext) {
    await this.registerUser(context);
    await context.reply('Enter your ID ("Номер личного дела")');
  }

  @Hears(/[\d]+\/[\d]+[a-zA-ZА-я]+\/[\d]+/)
  async id(
    @Ctx() context: SceneContext,
    @Message('text') personId: string,
    @Sender() sender: TelegramUser,
  ) {
    const user = await this.userRepository.findOneBy({ id: sender.id });
    const person = await this.personRepository.findOne({
      where: { id: personId },
      relations: {
        user: true,
      },
    });

    if (!person) {
      await context.reply('No such person in the table');
      return;
    }
    if (person.user && user.id !== person.user.id) {
      await context.reply(
        'Such ID already registered in the system, please contact @klownar if you think this is a mistake',
      );
      return;
    }
    user.person = person;
    await user.save();
    await context.scene.leave();
  }

  @Hears(/.*/)
  async wrong(@Ctx() context: SceneContext) {
    await context.reply('ID must be in format "00/00Моб/23"');
  }

  @SceneLeave()
  async leave(@Ctx() context: SceneContext) {
    await context.reply(
      'Saved.\nIn order to change your ID please run /start again',
    );
  }

  private async registerUser(context: SceneContext) {
    const userId = context.from.id;
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      const user = this.userRepository.create({
        ...context.from,
      });
      await this.userRepository.save(user);
      await context.reply(`User @${user.username ?? user.id} registered`);
    }
  }
}
