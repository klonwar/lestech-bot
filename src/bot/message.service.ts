import { Injectable } from '@nestjs/common';
import { User } from '../model/user/user.model';
import { List } from '../model/list/list.model';
import { DocumentType, Person } from '../model/person/person.model';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Person) private personRepository: Repository<Person>,
  ) {}

  public async notifyTemplate(
    about: Person,
    list: List,
    persons: Person[],
    personsOriginal: Person[],
  ) {
    const places = list.places;
    const position = persons.findIndex((person) => person.id === about.id) + 1;
    let positionOriginal =
      personsOriginal.findIndex((person) => person.id === about.id) + 1;
    if (!positionOriginal) {
      const originalsAndYou = await this.personRepository.find({
        where: [
          {
            document: DocumentType.ORIGINAL,
          },
          {
            id: about.id,
          },
        ],
        order: {
          score: 'DESC',
          document: 'DESC',
        },
      });
      positionOriginal =
        originalsAndYou.findIndex((person) => person.id === about.id) + 1;
    }
    const score = about.score;

    const lines = [
      `📅 Date: ${list.date}`,
      `#️⃣ Places: ${places}`,
      ``,
      `📍 Position: *${position}* / ${persons.length}`,
      `📍 Position (originals): *${positionOriginal}* / ${personsOriginal.length}`,
      `🎯 Score: *${score}* / 100`,
      ``,
      `👤 ID: ${about.id}`,
      `📄 Document: ${about.document}`,
      ``,
      about.document === DocumentType.COPY
        ? `⚠ _It is necessary to provide the original document of education!_`
        : null,
    ];

    if (score !== 0) {
      if (position <= places) {
        lines.push(`🎉 _Looks like you did it! Congratulations_`);
      } else if (positionOriginal <= places) {
        lines.push(`🍀 _You better hope no one brings the original_`);
      } else {
        lines.push(`😥 _Not sure you gonna make it..._`);
      }
    } else {
      lines.push(`⏳ _Your score is 0, waiting..._`);
    }

    return this.fromLines(lines);
  }

  public async topTemplate(target?: User) {
    const users = await this.userRepository.find({
      where: {
        person: Not(IsNull()),
      },
      order: {
        person: {
          score: 'DESC',
        },
      },
    });

    const lines = [
      `📊 Top bot users:`,
      ``,
      ...users.map((user, index) => {
        const parts = [
          this.choosePrefix(
            index,
            users.length,
            [`🏆`, `🥈`, `🥉`],
            [`🍆`],
            `🌲`,
          ),
          user.username || `anon`,
          `- ${user.person.score}`,
          target?.id && user.id === target.id ? `<` : null,
        ];

        return this.fromParts(parts);
      }),
    ];

    return this.fromLines(lines);
  }

  private choosePrefix(
    index: number,
    length: number,
    rewards: string[] = [],
    penalties: string[] = [],
    other = '',
  ) {
    if (index < rewards.length) {
      return rewards[index];
    }

    const reverseIndex = length - index - 1;
    if (reverseIndex < penalties.length) {
      return penalties[reverseIndex];
    }

    return other;
  }

  private fromParts(parts: string[]) {
    return parts.filter((item) => item !== null).join(` `);
  }

  private fromLines(lines: string[]) {
    return lines.filter((item) => item !== null).join(`\n`);
  }
}
