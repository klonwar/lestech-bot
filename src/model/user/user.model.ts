import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { Person } from '../person/person.model';

@Entity()
export class User extends BaseEntity {
  @PrimaryColumn()
  id: number;

  @Column({
    nullable: true,
  })
  username?: string;

  @OneToOne(() => Person, {
    eager: true,
  })
  @JoinColumn()
  person: Person;
}
