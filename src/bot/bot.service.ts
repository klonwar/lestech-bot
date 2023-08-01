import { Injectable, Logger } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { SceneContext } from 'telegraf/typings/scenes';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../model/user/user.model';
import { IsNull, Not, Repository } from 'typeorm';
import { Telegraf } from 'telegraf';
import { List } from '../model/list/list.model';
import { DocumentType, Person } from '../model/person/person.model';
import { ListService } from '../list/list.service';
import { MessageService } from './message.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BotService {
  private readonly logger = new Logger(BotService.name);

  constructor(
    private listService: ListService,
    private messageService: MessageService,
    private configService: ConfigService,
    @InjectBot() private bot: Telegraf<SceneContext>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Person) private personRepository: Repository<Person>,
  ) {}

  async sendCurrentInfo(user: User, about = user.person) {
    const { list, updated } = await this.listService.check();
    const url = this.configService.get<string>('URL');

    await this.bot.telegram.sendMessage(
      user.id,
      updated
        ? `List updated - ${url}.\nSoon you'll receive notification`
        : `No changes yet`,
    );

    await this.notify(list, user, about);
  }

  async sendTop(user?: User) {
    if (user && (await this.isInvalidUser(user))) {
      return;
    }
    await this.bot.telegram.sendMessage(
      user.id,
      await this.messageService.topTemplate(user),
    );
  }

  async notify(list: List, user?: User, about?: Person) {
    if (user && (await this.isInvalidUser(user))) {
      return;
    }
    const targets = user
      ? [user]
      : await this.userRepository.find({
          where: {
            person: Not(IsNull()),
          },
        });
    const persons = await this.personRepository.find({
      order: {
        score: 'DESC',
      },
    });
    const personsOriginal = await this.personRepository.find({
      where: {
        document: DocumentType.ORIGINAL,
      },
      order: {
        score: 'DESC',
      },
    });

    for (const user of targets) {
      await this.bot.telegram.sendMessage(
        user.id,
        await this.messageService.notifyTemplate(
          about || user.person,
          list,
          persons,
          personsOriginal,
        ),
        {
          parse_mode: 'Markdown',
        },
      );
      this.logger.log(`@${user.username ?? user.id} notified`);
      await this.sleep(1000);
    }
  }

  private async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async isInvalidUser(user: User) {
    if (user && !user.person) {
      await this.bot.telegram.sendMessage(
        user.id,
        `You need to specify your ID, please run /start command`,
      );
      return true;
    }

    return false;
  }
}
