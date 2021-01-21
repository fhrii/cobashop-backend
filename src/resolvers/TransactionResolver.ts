import { ApolloError, ForbiddenError } from 'apollo-server-express';
import {
  Args,
  ArgsType,
  Authorized,
  Ctx,
  Field,
  ID,
  Mutation,
  Query,
  Resolver,
} from 'type-graphql';
import { Item, Transaction, User } from '../entity';
import { LogType, ProductType, UserRole } from '../enum';
import { IContext } from '../interfaces/context';
import { createLog } from '../lib/log';
import { createNanoId } from '../lib/nanoid';

@ArgsType()
class BuyItemArgs {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  primaryFormValue?: string;

  @Field({ nullable: true })
  secondaryFormValue?: string;
}

@ArgsType()
class ConfirmCashArgs {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  message?: string;
}

@ArgsType()
class ConfirmVoucherArgs extends ConfirmCashArgs {
  @Field()
  voucher: string;
}

@ArgsType()
class CancelTransactionArgs extends ConfirmCashArgs {
  @Field({ nullable: true })
  message?: string;
}

@ArgsType()
class CancelMyTransaction {
  @Field(() => ID)
  id: string;
}

@ArgsType()
class AddProofOfPayment {
  @Field(() => ID)
  id: string;

  @Field()
  image: string;
}

@Resolver()
class TransactionResolver {
  @Authorized()
  @Query(() => [Transaction])
  async myTransactions(@Ctx() { req }: IContext): Promise<Transaction[]> {
    if (!req.session.user) throw new ForbiddenError('Authorization Error');

    return Transaction.createQueryBuilder('transaction')
      .leftJoin('transaction.user', 'user')
      .where('user.username= :username', {
        username: req.session.user.username,
      })
      .orderBy('transaction.createdAt', 'DESC')
      .getMany();
  }

  @Authorized(UserRole.ADMIN)
  @Query(() => [Transaction])
  async transcations(): Promise<Transaction[]> {
    return Transaction.createQueryBuilder('transaction')
      .leftJoin('transaction.user', 'user')
      .where('user.blocked= :blocked', { blocked: false })
      .orderBy('transaction.createdAt', 'DESC')
      .getMany();
  }

  @Authorized()
  @Mutation(() => Transaction)
  async cancelMyTransaction(
    @Args() { id }: CancelMyTransaction,
    @Ctx() { req }: IContext
  ): Promise<Transaction> {
    if (!req.session.user) throw new ForbiddenError('Authorization Error');

    const transaction = await Transaction.createQueryBuilder('transaction')
      .leftJoin('transaction.user', 'user')
      .where('transaction.id= :id', {
        id,
      })
      .andWhere('user.username= :username', {
        username: req.session.user.username,
      })
      .getOne();

    if (!transaction) throw new ApolloError("Transaction wasn't exist");
    if (!transaction.pending)
      throw new ApolloError('Transaction was already confirmed / canceled');

    transaction.pending = false;
    transaction.success = false;
    transaction.message = 'Transaksi dibatalkan olehmu';

    await transaction.save().catch(() => {
      throw new ApolloError("Transaction couldn't be canceled");
    });

    createLog(
      LogType.CancelMyTransaction,
      `<b>${req.session.user.username}</b> membatalkan transaksi <b>${transaction.id}</b>`
    );

    return transaction;
  }

  @Authorized(UserRole.USER)
  @Mutation(() => Transaction)
  async buyItem(
    @Args() { id, primaryFormValue, secondaryFormValue }: BuyItemArgs,
    @Ctx() { req }: IContext
  ): Promise<Transaction> {
    if (!req.session.user) throw new ForbiddenError('Authorization Error');

    const item = await Item.createQueryBuilder('item')
      .leftJoinAndSelect('item.product', 'product')
      .where('item.id= :id', { id })
      .andWhere('item.deleted= :deleted', { deleted: false })
      .getOne();

    if (!item) throw new ApolloError("Item wasn't exist");

    const theUser = await User.findOne({
      where: { username: req.session.user.username },
    });

    if (!theUser) throw new ForbiddenError('Authorization Error');

    const transaction = new Transaction();
    transaction.id = createNanoId();
    transaction.productName = item.product.name;
    transaction.productType = item.product.type;
    transaction.user = theUser;
    transaction.item = item;
    transaction.itemValue = item.value;
    transaction.itemPrice = item.price;
    transaction.primaryFormName = item.product.primaryFormName;
    transaction.secondaryFormName = item.product.secondaryFormName;
    transaction.primaryFormValue = primaryFormValue;
    transaction.secondaryFormValue = secondaryFormValue;
    transaction.message =
      'Pesanan belum diproses, silahkan upload bukti pembayaran';

    await transaction.save().catch(() => {
      throw new ApolloError("Transaction couldn't be processed");
    });

    createLog(
      LogType.BuyItem,
      `<b>${req.session.user.username}</b> membeli item <b>${item.id}</b>`
    );

    return transaction;
  }

  @Authorized(UserRole.ADMIN)
  @Mutation(() => Transaction)
  async confirmCash(
    @Args() { id, message }: ConfirmCashArgs,
    @Ctx() { req }: IContext
  ): Promise<Transaction> {
    if (!req.session.user) throw new ForbiddenError('Authorization Error');

    const transaction = await Transaction.createQueryBuilder('transaction')
      .leftJoin('transaction.user', 'user')
      .where('transaction.id= :id', { id })
      .andWhere('user.blocked= :blocked', { blocked: false })
      .getOne();

    if (!transaction) throw new ApolloError("Transaction wasn't exist");
    if (!transaction.pending)
      throw new ApolloError('Transaction was already confirmed / canceled');
    if (transaction.productType === ProductType.VOUCHER)
      throw new ApolloError("Item's type is Voucher, couldn't confirmed");

    transaction.message = message || 'Pesanan berhasil dilakukan';
    transaction.pending = false;
    transaction.success = true;

    await transaction.save().catch(() => {
      throw new ApolloError("Transaction couldn't be confirmed");
    });

    createLog(
      LogType.ConfirmCash,
      `<b>${req.session.user.username}</b> mengonfirmasi transaksi <b>${transaction.id}</b>`
    );

    return transaction;
  }

  @Authorized(UserRole.ADMIN)
  @Mutation(() => Transaction)
  async confirmVoucher(
    @Args() { id, voucher, message }: ConfirmVoucherArgs,
    @Ctx() { req }: IContext
  ): Promise<Transaction> {
    if (!req.session.user) throw new ForbiddenError('Authorization Error');

    const transaction = await Transaction.createQueryBuilder('transaction')
      .leftJoin('transaction.user', 'user')
      .where('transaction.id= :id', { id })
      .andWhere('user.blocked= :blocked', { blocked: false })
      .getOne();

    if (!transaction) throw new ApolloError("Transaction wasn't exist");
    if (!transaction.pending)
      throw new ApolloError('Transaction was already confirmed / canceled');
    if (transaction.productType === ProductType.CASH)
      throw new ApolloError("Item's type is Voucher, couldn't confirmed");

    transaction.message = message || 'Pesanan berhasil dilakukan';
    transaction.pending = false;
    transaction.success = true;
    transaction.voucher = voucher;

    await transaction.save().catch(() => {
      throw new ApolloError("Transaction couldn't be confirmed");
    });

    createLog(
      LogType.ConfirmVoucher,
      `<b>${req.session.user.username}</b> mengonfirmasi transaksi <b>${transaction.id}</b>`
    );

    return transaction;
  }

  @Authorized(UserRole.ADMIN)
  @Mutation(() => Transaction)
  async cancelTransaction(
    @Args() { id, message }: CancelTransactionArgs,
    @Ctx() { req }: IContext
  ): Promise<Transaction> {
    if (!req.session.user) throw new ForbiddenError('Authorization Error');

    const transaction = await Transaction.createQueryBuilder('transaction')
      .leftJoin('transaction.user', 'user')
      .where('transaction.id= :id', { id })
      .andWhere('user.blocked= :blocked', { blocked: false })
      .getOne();

    if (!transaction) throw new ApolloError("Transaction wasn't exist");
    if (!transaction.pending)
      throw new ApolloError('Transaction was already confirmed / canceled');

    transaction.message = message || 'Pesanan dibatalkan oleh admin';
    transaction.pending = false;
    transaction.success = false;

    await transaction.save().catch(() => {
      throw new ApolloError("Transaction couldn't be canceled");
    });

    createLog(
      LogType.CancelTransaction,
      `<b>${req.session.user.username}</b> membatalkan transaksi <b>${transaction.id}</b>`
    );

    return transaction;
  }

  @Authorized(UserRole.USER)
  @Mutation(() => Transaction)
  async addProofOfPayment(
    @Args() { id, image }: AddProofOfPayment,
    @Ctx() { req }: IContext
  ): Promise<Transaction> {
    if (!req.session.user) throw new ForbiddenError('Authorization Error');

    const transaction = await Transaction.createQueryBuilder('transaction')
      .leftJoin('transaction.user', 'user')
      .where('transaction.id= :id', { id })
      .andWhere('user.username= :username', {
        username: req.session.user.username,
      })
      .andWhere('user.blocked= :blocked', { blocked: false })
      .getOne();

    if (!transaction) throw new ApolloError("Transaction wasn't exists");

    transaction.proofOfPayment = image;
    transaction.message = 'Pesanan sedang diproses';

    await transaction.save().catch(() => {
      throw new ApolloError("Couldn't update transaction");
    });

    createLog(
      LogType.AddProofOfPayment,
      `<b>${req.session.user.username}</b> mengonfirmasi transaksi <b>${transaction.id}</b>`
    );

    return transaction;
  }
}

export default TransactionResolver;
