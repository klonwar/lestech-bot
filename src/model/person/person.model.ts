import { Transform } from 'class-transformer';
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { List } from '../list/list.model';
import { User } from '../user/user.model';

export enum DocumentType {
  ORIGINAL = 'original',
  COPY = 'copy',
}

@Entity()
export class Person extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  @Transform(({ value }) =>
    value === 'Оригинал' ? DocumentType.ORIGINAL : DocumentType.COPY,
  )
  document: DocumentType;

  @Column({
    nullable: true,
  })
  snils: string;

  @Column()
  @Transform(({ value }) => parseInt(value, 10))
  score: number;

  @ManyToOne(() => List, (list) => list.persons)
  list: List;

  @OneToOne(() => User, (user) => user.person)
  user: User;
}
