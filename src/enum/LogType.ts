import { registerEnumType } from 'type-graphql';

enum LogType {
  Login = 'login',
  Register = 'register',
  Logout = 'logout',
  ChangePassword = 'changePassword',
  Block = 'block',
  AddProduct = 'addProduct',
  EditProduct = 'editProduct',
  BuyItem = 'buyItem',
  ConfirmCash = 'confirmCash',
  ConfirmVoucher = 'confirmVoucher',
  CancelTransaction = 'cancelTransaction',
  CancelMyTransaction = 'cancelMyTransaction',
  AddProofOfPayment = 'addProofOfPayment',
}

registerEnumType(LogType, { name: 'LogType', description: 'Type of Log' });

export default LogType;
