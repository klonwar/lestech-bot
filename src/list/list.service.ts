import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import xlsx from 'node-xlsx';
import { List } from '../model/list/list.model';
import {
  getCellInRow,
  getCellInTable,
  positions,
} from '../model/list/list.constants';
import { plainToClass } from 'class-transformer';
import { catchError, firstValueFrom, map, of } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ListService {
  private readonly logger = new Logger(ListService.name);

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

    this.logger.log(
      isExists ? `No updates` : `New list found and saved - ${list.date}`,
    );

    return {
      list,
      updated: !isExists,
    };
  }

  public async check() {
    const list = await this.request();
    const isExists = await this.listRepository.findOneBy({
      date: list.date,
    });

    this.logger.log(isExists ? `No updates` : `New list found - ${list.date}`);

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
        .pipe(
          map((blob) => this.parse(blob.data)),
          catchError((e) => {
            this.logger.error(e);
            return of(null);
          }),
        ),
    );
  }

  private parse(buffer): List {
    const table = xlsx.parse(buffer)[0].data;
    return plainToClass(List, {
      date: getCellInTable(table, 'datetime'),
      places: getCellInTable(table, 'places'),
      persons: table.slice(positions.listStart[0]).map((person) => ({
        id: getCellInRow(person, 'id'),
        document: getCellInRow(person, 'document'),
        snils: getCellInRow(person, 'snils'),
        score: getCellInRow(person, 'score'),
      })),
    });
  }
}
