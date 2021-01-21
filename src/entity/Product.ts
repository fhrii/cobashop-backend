import { IsBoolean, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Field, ID, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Item } from '.';
import { ProductType } from '../enum';

@ObjectType()
@Entity()
class Product extends BaseEntity {
  @Field(() => ID)
  @PrimaryColumn()
  id: string;

  @IsString({ message: 'Nama produk harus bertipe data string' })
  @IsNotEmpty({ message: 'Nama produk tidak boleh kosong' })
  @Field()
  @Column()
  name: string;

  @IsEnum(ProductType, { message: 'Type produk tidak ada' })
  @Field(() => ProductType)
  @Column('enum', { enum: ProductType, default: ProductType.CASH })
  type: ProductType;

  @IsString({ message: 'PrimaryFormName harus bertipe data string' })
  @IsNotEmpty({ message: 'PrimaryForName tidak boleh kosong' })
  @Field({ nullable: true })
  @Column({ nullable: true })
  primaryFormName?: string;

  @IsString({ message: 'SecondaryFormName harus bertipe data string' })
  @Field({ nullable: true })
  @Column({ nullable: true })
  secondaryFormName?: string;

  @IsString({ message: 'Image harus bertipe data string' })
  @IsNotEmpty({ message: 'Image tidak boleh kosong' })
  @Field()
  @Column()
  image: string;

  @IsString({ message: 'Banner harus bertipe data string' })
  @IsNotEmpty({ message: 'Banner tidak boleh kosong' })
  @Field()
  @Column()
  banner: string;

  @IsString({ message: 'Description harus bertipe data string' })
  @IsNotEmpty({ message: 'Description tidak boleh kosong' })
  @Field()
  @Column()
  description: string;

  @IsString({ message: 'HelperImage harus bertipe data string' })
  @Field({ nullable: true })
  @Column({ nullable: true })
  helperImage?: string;

  @IsString({ message: 'HelperText harus bertipe data string' })
  @Field({ nullable: true })
  @Column({ nullable: true })
  helperText?: string;

  @Field(() => [Item])
  @OneToMany(() => Item, (item) => item.product, { cascade: true })
  items: Item[];

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

export default Product;
