import {
  ApolloError,
  AuthenticationError,
  ForbiddenError,
} from 'apollo-server-express';
import { Length, MinLength } from 'class-validator';
import {
  Arg,
  Args,
  ArgsType,
  Authorized,
  Ctx,
  Field,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  Root,
} from 'type-graphql';
import { Notification, Transaction, User } from '../entity';
import { LogType, UserRole } from '../enum';
import { IContext } from '../interfaces/context';
import { APP_SESSION_NAME } from '../lib/config';
import { createLog } from '../lib/log';
import { createNanoId } from '../lib/nanoid';
import { comparePassword, hashPassword } from '../lib/password';

@ArgsType()
class LoginArgs {
  @Field()
  username: string;

  @Field()
  password: string;
}

@ArgsType()
class RegisterArgs {
  @Length(8, 20, { message: 'Username harus 8 sampai 20 karakter' })
  @Field()
  username: string;

  @Length(8, 100, { message: 'Password minimal 8 sampai 100 karakter' })
  @Field()
  password: string;
}

@ArgsType()
class ChangePasswordArgs {
  @Field()
  password: string;

  @MinLength(8, { message: 'Password minimal 8 karakter' })
  @Field()
  newPassword: string;
}

@Resolver(() => User)
class UserResolver {
  @Authorized()
  @Query(() => User)
  async me(@Ctx() { req }: IContext): Promise<User> {
    if (!req.session.user) throw new ForbiddenError('Anda belum login');

    const itsMe = await User.findOne({
      where: { username: req.session.user.username },
    });
    if (!itsMe) throw new ApolloError('Terjadi kesalahan dalam mengambil data');

    return itsMe;
  }

  @Mutation(() => User)
  async login(
    @Args() { username, password }: LoginArgs,
    @Ctx() { req }: IContext
  ): Promise<User> {
    if (req.session.user) throw new ForbiddenError('Already Authenticated');
    const errMsg = 'Username atau password salah';

    const user = await User.findOne({ where: { username } });
    if (!user) throw new AuthenticationError(errMsg);

    const isPasswordSame = await comparePassword(password, user.password);
    if (!isPasswordSame) throw new AuthenticationError(errMsg);

    req.session.user = {
      username: user.username,
      role: user.role,
      version: user.version,
      blocked: user.blocked,
    };

    createLog(LogType.Login, `<b>${user.username}</b> masuk`);

    return user;
  }

  @Mutation(() => User)
  async register(
    @Args() { username, password }: RegisterArgs,
    @Ctx() { req }: IContext
  ): Promise<User> {
    if (req.session.user) throw new ForbiddenError('Already Authenticated');

    const user = new User();
    user.id = createNanoId();
    user.username = username;
    user.password = await hashPassword(password);

    await user.save().catch(() => {
      throw new ApolloError('Register was failed');
    });

    req.session.user = {
      username: user.username,
      role: user.role,
      version: user.version,
      blocked: user.blocked,
    };

    createLog(LogType.Register, `<b>${user.username}</b> mendaftar`);

    return user;
  }

  @Authorized()
  @Mutation(() => Boolean)
  async logout(@Ctx() { req, res }: IContext): Promise<Boolean> {
    if (!req.session.user) throw new ForbiddenError('Authorization error');

    const user = req.session.user;

    req.session.destroy((err) => {
      if (err) throw new ApolloError('Failed to logout');
    });

    res.clearCookie(APP_SESSION_NAME);

    createLog(LogType.Logout, `<b>${user.username}</b> keluar`);

    return true;
  }

  @Authorized()
  @Mutation(() => Boolean)
  async changePassword(
    @Args() { password, newPassword }: ChangePasswordArgs,
    @Ctx() { req }: IContext
  ): Promise<boolean> {
    if (!req.session.user) throw new ForbiddenError('Authorization Error');

    const theUser = await User.findOne({
      where: { username: req.session.user.username },
    });

    if (!theUser) throw new ForbiddenError('Authorization Error');

    const isPasswordSame = await comparePassword(password, theUser.password);
    if (!isPasswordSame) throw new ForbiddenError('Authorization Error');

    theUser.password = await hashPassword(newPassword);

    await theUser.save().catch(() => {
      throw new ApolloError("Couldn't save new user password");
    });

    createLog(LogType.Logout, `<b>${theUser.username}</b> keluar`);

    return true;
  }

  @Authorized(UserRole.ADMIN)
  @Mutation(() => User)
  async blockUser(
    @Arg('username') username: string,
    @Ctx() { req }: IContext
  ): Promise<User> {
    if (!req.session.user) throw new ForbiddenError('Authorization Error');

    const theUser = await User.findOne({ where: { username } });
    if (!theUser) throw new ApolloError("User wasn't exist");
    if (theUser.role === UserRole.ADMIN)
      throw new ApolloError("Couldn't block the user. User is an admin");

    theUser.blocked = !theUser.blocked;
    await theUser.save().catch(() => {
      throw new ApolloError("Couldn't block the user");
    });

    createLog(
      LogType.Block,
      `<b>${req.session.user.username}</b> memblokir <b>${username}</b>`
    );

    return theUser;
  }

  @FieldResolver()
  async transactions(@Root() user: User): Promise<Transaction[]> {
    return Transaction.find({ where: { user } });
  }

  @FieldResolver()
  async notifications(@Root() user: User): Promise<Notification[]> {
    return Notification.find({ where: { user } });
  }
}

export default UserResolver;
