import { UserRoleEnum } from './user-role.entity';

export class UserSession {
  static readonly TableName = 'user-session';

  id: string;
  refreshToken: string;
  expiresAt: number;
  userId: string;
  email: string;
  roles: UserRoleEnum[];
  removedAt: number;
  invalidatedAt: number;
  createdAt: number;

  // Injected manually
  platform: string;
}
