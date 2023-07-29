import { Transform, Type } from 'class-transformer';
import { Person } from '../person/person.model';
import { BaseEntity, Entity, OneToMany, PrimaryColumn } from 'typeorm';

@Entity()
export class List extends BaseEntity {
  @PrimaryColumn({ type: 'varchar' })
  @Transform(
    ({ value }) => value.match(/\d{2}[.:]\d{2}[.:]\d{2,4}/g).join(' '),
    {
      toClassOnly: true,
    },
  )
  date: string;

  @OneToMany(() => Person, (person) => person.list, {
    cascade: true,
  })
  @Type(() => Person)
  persons: Person[];
}
