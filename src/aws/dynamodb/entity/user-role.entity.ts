export class UserRole {
  static readonly TableName = 'user-role';

  id: string;
  roles: UserRoleEnum[];
}

export enum UserRoleEnum {
  ADMIN = 'admin',
  DEVELOPER = 'developer',
  TESTER = 'tester',
  USER = 'user',
}
