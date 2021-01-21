import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { Field, ID, Int, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Item, User } from '.';
import { ProductType } from '../enum';

@ObjectType()
@Entity()
class Transaction extends BaseEntity {
  @Field(() => ID)
  @PrimaryColumn()
  id: string;

  @ManyToOne(() => User, (user) => user.transactions)
  user: User;

  @ManyToOne(() => Item, (item) => item.transactions)
  item: Item;

  @IsString({ message: 'ProductName harus bertipe data string' })
  @IsNotEmpty({ message: 'ProductName tidak boleh kosong' })
  @Field()
  @Column()
  productName: string;

  @IsEnum(ProductType, { message: 'ProductType tidak ada' })
  @Field(() => ProductType)
  @Column('enum', { enum: ProductType })
  productType: ProductType;

  @IsString({ message: 'ItemValue harus bertipe data string' })
  @IsNotEmpty({ message: 'ItemValue tidak boleh kosong' })
  @Field()
  @Column()
  itemValue: string;

  @IsInt({ message: 'ItemPrice harus bertipe data integer' })
  @IsNotEmpty({ message: 'ItemPrice tidak boleh kosong' })
  @Field(() => Int)
  @Column()
  itemPrice: number;

  @IsString({ message: 'PrimaryFormName harus bertipe data string' })
  @IsNotEmpty({ message: 'PrimaryFormName tidak boleh kosong' })
  @Field({ nullable: true })
  @Column({ nullable: true })
  primaryFormName?: string;

  @IsString({ message: 'SecondaryFormName harus bertipe data string' })
  @IsNotEmpty({ message: 'SecondaryFormName tidak boleh kosong' })
  @Field({ nullable: true })
  @Column({ nullable: true })
  secondaryFormName?: string;

  @IsString({ message: 'PrimaryFormValue harus bertipe data string' })
  @IsNotEmpty({ message: 'PrimaryFormValue tidak boleh kosong' })
  @Field({ nullable: true })
  @Column({ nullable: true })
  primaryFormValue?: string;

  @IsString({ message: 'SecondaryFormValue harus bertipe data string' })
  @IsNotEmpty({ message: 'SecondaryFormValue tidak boleh kosong' })
  @Field({ nullable: true })
  @Column({ nullable: true })
  secondaryFormValue?: string;

  @IsString({ message: 'ProofOfPayment harus bertipe data string' })
  @Field({ nullable: true })
  @Column({ nullable: true })
  proofOfPayment?: string;

  @IsString({ message: 'Voucher harus bertipe data string' })
  @Field({ nullable: true })
  @Column({ nullable: true })
  voucher?: string;

  @IsString({ message: 'Message harus bertipe data string' })
  @Field({ nullable: true })
  @Column({ nullable: true })
  message?: string;

  @IsBoolean({ message: 'Pending harus bertipe data boolean' })
  @Field()
  @Column({ default: true })
  pending: boolean;

  @IsBoolean({ message: 'Pending harus bertipe data boolean' })
  @Field()
  @Column({ default: false })
  success: boolean;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}

export default Transaction;
