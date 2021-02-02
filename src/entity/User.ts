import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsString,
  Length,
} from 'class-validator';
import { Field, ID, Int, ObjectType } from 'type-graphql';
import {
  Entity,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
  BaseEntity,
  VersionColumn,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { Transaction } from '.';
import { UserRole } from '../enum';

@ObjectType()
@Entity()
class User extends BaseEntity {
  @Field(() => ID)
  @PrimaryColumn()
  id: string;

  @Length(8, 20, { message: 'Username harus 8 sampai 20 karakter' })
  @IsNotEmpty({ message: 'Username tidak boleh kosong' })
  @Field()
  @Column({ unique: true })
  username: string;

  @IsNotEmpty({ message: 'Password tidak boleh kosong' })
  @Column()
  password: string;

  @IsEnum(UserRole, { message: 'Role tidak ada' })
  @Field(() => UserRole)
  @Column('enum', { enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @IsString({ message: 'Image harus bertipe data string' })
  @Field()
  @Column({ default: '/user-no-img.jpg' })
  image: string;

  @IsBoolean({ message: 'Blocked harus bertipe data boolean' })
  @Field()
  @Column({ default: false })
  blocked: boolean;

  @Field(() => [Transaction])
  @OneToMany(() => Transaction, (transaction) => transaction.user, {
    cascade: true,
  })
  transactions: Transaction[];

  @Field(() => Int)
  @VersionColumn()
  version: number;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}

export default User;
