import { registerEnumType } from 'type-graphql';

enum ProductType {
  CASH = 'cash',
  VOUCHER = 'voucher',
}

registerEnumType(ProductType, {
  name: 'ProductType',
  description: 'Type of product',
});

export default ProductType;
