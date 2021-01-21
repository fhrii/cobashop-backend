import { IsBoolean, IsInt, IsNotEmpty, IsString } from 'class-validator';
import { Field, ID, Int, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product, Transaction } from '.';

@ObjectType()
@Entity()
class Item extends BaseEntity {
  @Field(() => ID)
  @PrimaryColumn()
  id: string;

  @ManyToOne(() => Product, (product) => product.items)
  product: Product;

  @IsString({ message: 'Value harus bertipe data string' })
  @IsNotEmpty({ message: 'Value tidak boleh kosong' })
  @Field()
  @Column()
  value: string;

  @IsInt({ message: 'Price harus bertipe data integer' })
  @IsNotEmpty({ message: 'Price tidak boleh kosong' })
  @Field(() => Int)
  @Column()
  price: number;

  @OneToMany(() => Transaction, (transaction) => transaction.item, {
    cascade: true,
  })
  transactions: Transaction[];

  @IsBoolean({ message: 'Deleted harus bertipe data boolean' })
  @Field()
  @Column({ default: false })
  deleted: boolean;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}

export default Item;
