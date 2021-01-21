import TransactionResolver from './TransactionResolver';
import ProductResolver from './ProductResolver';
import UserResolver from './UserResolver';

const resolvers:
  | [Function, ...Function[]]
  | [Function, ...Function[]]
  | readonly [string, ...string[]]
  | [string, ...string[]] = [
  UserResolver,
  ProductResolver,
  TransactionResolver,
];

export default resolvers;
