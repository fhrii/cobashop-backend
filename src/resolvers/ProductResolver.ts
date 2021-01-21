import { ApolloError, ForbiddenError } from 'apollo-server-express';
import {
  Args,
  ArgsType,
  Authorized,
  Ctx,
  Field,
  FieldResolver,
  ID,
  InputType,
  Int,
  Mutation,
  Query,
  Resolver,
  Root,
} from 'type-graphql';
import { Item, Product } from '../entity';
import { LogType, ProductType, UserRole } from '../enum';
import { IContext } from '../interfaces/context';
import { createLog } from '../lib/log';
import { createNanoId } from '../lib/nanoid';

@ArgsType()
class ProductArgs {
  @Field(() => ID)
  id: string;
}

@InputType()
class AddProductItem {
  @Field()
  value: string;

  @Field(() => Int)
  price: number;
}

@InputType()
class EditProductItem extends AddProductItem {
  @Field(() => ID, { nullable: true })
  id?: string;
}

@ArgsType()
class AddProductArgs {
  @Field()
  name: string;

  @Field(() => ProductType)
  type: ProductType;

  @Field({ nullable: true })
  primaryFormName?: string;

  @Field({ nullable: true })
  secondaryFormName?: string;

  @Field()
  image: string;

  @Field()
  banner: string;

  @Field()
  description: string;

  @Field({ nullable: true })
  helperImage?: string;

  @Field({ nullable: true })
  helperText?: string;

  @Field(() => [EditProductItem])
  items: AddProductItem[];
}

@ArgsType()
class EditProductArgs {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  name?: string;

  @Field(() => ProductType, { nullable: true })
  type?: ProductType;

  @Field({ nullable: true })
  primaryFormName?: string;

  @Field({ nullable: true })
  secondaryFormName?: string;

  @Field({ nullable: true })
  image?: string;

  @Field({ nullable: true })
  banner?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  helperImage?: string;

  @Field({ nullable: true })
  helperText?: string;

  @Field(() => [EditProductItem], { nullable: true })
  items?: EditProductItem[];

  @Field({ nullable: true })
  deleted?: boolean;
}

@Resolver(() => Product)
class ProductResolver {
  @Query(() => [Product])
  async products(): Promise<Product[]> {
    return Product.find({ where: { deleted: false } });
  }

  @Query(() => Product)
  async product(@Args() { id }: ProductArgs): Promise<Product> {
    return Product.findOneOrFail({ where: { id } }).catch(() => {
      throw new ApolloError("Product wasn't exist");
    });
  }

  @Authorized(UserRole.ADMIN)
  @Mutation(() => Product)
  async addProduct(
    @Args()
    {
      name,
      type,
      primaryFormName,
      secondaryFormName,
      image,
      banner,
      description,
      helperImage,
      helperText,
      items,
    }: AddProductArgs,
    @Ctx() { req }: IContext
  ): Promise<Product> {
    if (!req.session.user) throw new ForbiddenError('Authorization Error');
    if (items.length === 0)
      throw new ApolloError('Product must have at least 1 item');

    const product = new Product();

    product.id = createNanoId();
    product.name = name;
    product.type = type;
    product.primaryFormName = primaryFormName;
    product.secondaryFormName = secondaryFormName;
    product.image = image;
    product.banner = banner;
    product.description = description;
    product.helperImage = helperImage;
    product.helperText = helperText;
    product.items = items.map((item) => {
      const newItem = new Item();
      newItem.id = createNanoId();
      newItem.value = item.value;
      newItem.price = item.price;
      return newItem;
    });

    await product.save().catch(() => {
      throw new ApolloError("Couldn't create new product");
    });

    createLog(
      LogType.AddProduct,
      `<b>${req.session.user.username}</b> menambahkan produk <b>${product.id}</>`
    );

    return product;
  }

  @Authorized(UserRole.ADMIN)
  @Mutation(() => Product)
  async editProduct(
    @Args() { id, ...editProduct }: EditProductArgs,
    @Ctx() { req }: IContext
  ): Promise<Product> {
    if (!req.session.user) throw new ForbiddenError('Authorization Error');

    const product = await Product.findOne(id);
    if (!product) throw new ApolloError("Product wasn't exist");

    product.name = editProduct.name || product.name;
    product.type = editProduct.type || product.type;
    product.primaryFormName =
      editProduct.primaryFormName || product.primaryFormName;
    product.secondaryFormName =
      editProduct.secondaryFormName || product.secondaryFormName;
    product.image = editProduct.image || product.image;
    product.banner = editProduct.banner || product.banner;
    product.description = editProduct.description || product.description;
    product.helperImage = editProduct.helperImage || product.helperImage;
    product.helperText = editProduct.helperText || product.helperText;
    product.deleted =
      typeof editProduct.deleted !== 'undefined'
        ? editProduct.deleted
        : product.deleted;

    if (editProduct.items && editProduct.items.length) {
      const items = await Item.find({ where: { product } });

      product.items = [
        ...items.map((itemDB) => {
          const index = editProduct.items!.findIndex(
            (item) => item.id && item.id === itemDB.id
          );

          if (typeof index === 'undefined') {
            if (!itemDB.deleted) itemDB.deleted = true;
            return itemDB;
          }

          const mustEdit = index !== -1;
          if (!mustEdit) {
            if (!itemDB.deleted) itemDB.deleted = true;
            return itemDB;
          }

          itemDB.value = editProduct.items![index].value;
          itemDB.price = editProduct.items![index].price;
          return itemDB;
        }),
        ...editProduct.items
          .filter((item) => !item.id)
          .map((item) => {
            const newItem = new Item();
            newItem.id = createNanoId();
            newItem.value = item.value;
            newItem.price = item.price;
            return newItem;
          }),
      ];
    }

    await product.save().catch(() => {
      throw new ApolloError("Couldn't update the product");
    });

    createLog(
      LogType.EditProduct,
      `<b>${req.session.user.username}</b> mengubah produk <b>${product.id}</b>`
    );

    return product;
  }

  @FieldResolver()
  async items(@Root() product: Product): Promise<Item[]> {
    return Item.find({ where: { product, deleted: false } });
  }
}

export default ProductResolver;
