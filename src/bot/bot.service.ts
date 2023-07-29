import { Injectable, Logger } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { SceneContext } from 'telegraf/typings/scenes';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../model/user/user.model';
import { IsNull, Not, Repository } from 'typeorm';
import { Telegraf } from 'telegraf';
import { List } from '../model/list/list.model';
import { DocumentType, Person } from '../model/person/person.model';

@Injectable()
export class BotService {
  private readonly logger = new Logger(BotService.name);

  constructor(
    @InjectBot() private bot: Telegraf<SceneContext>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Person) private personRepository: Repository<Person>,
  ) {}

  async notify(list: List, user?: User) {
    if (user && !user.person) {
      await this.bot.telegram.sendMessage(
        user.id,
        `You need to specify your ID, please run /start command`,
      );
      return;
    }
    const users = user
      ? [user]
      : await this.userRepository.find({
          where: {
            person: Not(IsNull()),
          },
        });
    const persons = await this.personRepository.find();
    const personsOriginal = await this.personRepository.findBy({
      document: DocumentType.ORIGINAL,
    });

    for (const user of users) {
      await this.bot.telegram.sendMessage(
        user.id,
        await this.generateMessage(user, list, persons, personsOriginal),
        {
          parse_mode: 'Markdown',
        },
      );
      this.logger.log(`@${user.username ?? user.id} notified`);
      await this.sleep(1000);
    }
  }

  private async generateMessage(
    user: User,
    list: List,
    persons: Person[],
    personsOriginal: Person[],
  ) {
    let m = `📅 Date: ${list.date}\n`;

    const places = list.places;
    m += `#️⃣ Places: ${places}\n\n`;

    const position =
      persons.findIndex((person) => person.id === user.person.id) + 1;
    m += `📍 Position: *${position}* / ${persons.length}\n`;

    let positionOriginal =
      personsOriginal.findIndex((person) => person.id === user.person.id) + 1;
    if (!positionOriginal) {
      const originalsAndYou = await this.personRepository.find({
        where: [
          {
            document: DocumentType.ORIGINAL,
          },
          {
            id: user.person.id,
          },
        ],
        order: {
          document: 'DESC',
        },
      });
      positionOriginal =
        originalsAndYou.findIndex((person) => person.id === user.person.id) + 1;
    }
    m += `📍 Position (originals): *${positionOriginal}* / ${personsOriginal.length}\n`;

    const score = user.person.score;
    m += `🎯 Score: *${score}* / 100\n`;
    m += `\n`;
    m += `👤 ID: ${user.person.id}\n`;
    m += `📄 Document: ${user.person.document}\n\n`;

    if (user.person.document === DocumentType.COPY) {
      m += `⚠ _It is necessary to provide the original document of education!_\n`;
    }
    if (score !== 0) {
      if (position <= places) {
        m += `🎉 _Looks like you did it! Congratulations_`;
      } else if (positionOriginal <= places) {
        m += `🍀 _You better hope no one brings the original_`;
      } else {
        m += `😥 _Not sure you gonna make it..._`;
      }
    } else {
      m += `⏳ _Your score is 0, waiting..._`;
    }
    return m;
  }

  private async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
