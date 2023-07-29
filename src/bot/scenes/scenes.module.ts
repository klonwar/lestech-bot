import { Module } from '@nestjs/common';
import { PersonIdScene } from './user/person-id.scene';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../model/user/user.model';
import { Person } from '../../model/person/person.model';

@Module({
  imports: [TypeOrmModule.forFeature([User, Person])],
  providers: [PersonIdScene],
})
export class ScenesModule {}
