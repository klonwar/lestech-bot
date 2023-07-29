import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import xlsx from 'node-xlsx';
import { List } from './model/list/list.model';
import {
  getCellInRow,
  getCellInTable,
  positions,
} from './model/list/list.constants';
import { plainToClass } from 'class-transformer';
import { firstValueFrom, map } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    @InjectRepository(List)
    private listRepository: Repository<List>,
  ) {}

  public async update() {
    const list = await this.request();
    const isExists = await this.listRepository.findOneBy({
      date: list.date,
    });
    await list.save();

    return {
      list,
      updated: !isExists,
    };
  }

  private async request() {
    const url = this.configService.get<string>('URL');
    return firstValueFrom(
      this.httpService
        .get(url, {
          responseType: 'arraybuffer',
        })
        .pipe(map((blob) => this.parse(blob.data))),
    );
  }

  private parse(buffer): List {
    const table = xlsx.parse(buffer)[0].data;
    return plainToClass(List, {
      date: getCellInTable(table, 'datetime'),
      persons: table.slice(positions.listStart[0]).map((person) => ({
        id: getCellInRow(person, 'id'),
        document: getCellInRow(person, 'document'),
        snils: getCellInRow(person, 'snils'),
        score: getCellInRow(person, 'score'),
      })),
    });
  }
}
