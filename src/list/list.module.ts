import { Module } from '@nestjs/common';
import { ListService } from './list.service';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { List } from '../model/list/list.model';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([List])],
  providers: [ListService],
  exports: [ListService],
})
export class ListModule {}
