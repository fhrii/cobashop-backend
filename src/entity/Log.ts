import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Field, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
} from 'typeorm';
import { LogType } from '../enum';

@ObjectType()
@Entity()
class Log extends BaseEntity {
  @Field()
  @PrimaryColumn()
  id: string;

  @IsEnum(LogType, { message: 'Type Log tidak ada' })
  @IsNotEmpty({ message: 'Log Type tidak boleh kosong' })
  @Field(() => LogType)
  @Column('enum', { enum: LogType })
  type: LogType;

  @IsString({ message: 'Message harus bertipe data string' })
  @IsNotEmpty({ message: 'Log Type tidak boleh kosong' })
  @Field()
  @Column()
  message: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;
}

export default Log;
