import { registerEnumType } from 'type-graphql';

enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

registerEnumType(UserRole, {
  name: 'UserRole',
  description: 'Role of registered accounts',
});

export default UserRole;
