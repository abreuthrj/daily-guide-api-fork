import { UserRoleEnum } from '#/aws/dynamodb/entity/user-role.entity';
import { SetMetadata } from '@nestjs/common';

export const HAS_ROLE_KEY = 'hasRole';
export const UserRole = (...roles: UserRoleEnum[]) =>
  SetMetadata(HAS_ROLE_KEY, roles);
