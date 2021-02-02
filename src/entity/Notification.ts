import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';
import { Field, ID, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType()
@Entity()
class Notification extends BaseEntity {
  @Field(() => ID)
  @PrimaryColumn()
  id: string;

  @IsString({ message: 'Name harus bertipe data string' })
  @IsNotEmpty({ message: 'Name tidak boleh kosong' })
  @Field()
  @Column()
  name: string;

  @IsString({ message: 'Description harus bertipe data string' })
  @IsNotEmpty({ message: 'Description tidak boleh kosong' })
  @Field()
  @Column()
  description: string;

  @IsBoolean({ message: 'Read harus bertipe data boolean' })
  @Field()
  @Column({ default: false })
  read: boolean;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}

export default Notification;
