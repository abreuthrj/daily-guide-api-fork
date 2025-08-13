import { UserRoleEnum } from '#/aws/dynamodb/entity/user-role.entity';
import { UserSession } from '#/aws/dynamodb/entity/user-session.entity';
import { AuthUser } from '#/decorator/auth-user.decorator';
import { UserRole } from '#/decorator/role.decorator';
import { Result } from '#/entity/result.entity';
import { Body, Controller, Delete, Get, Post, Put } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserDto } from './dto/user.dto';
import { UserAttribute } from './entity/user-attribute.entity';
import { User } from './entity/user.entity';
import { UserService } from './user.service';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UserRole(UserRoleEnum.ADMIN)
  @ApiResponse({
    status: 200,
    description: 'Get all users',
    type: User,
  })
  @Get('')
  async all(): Promise<User[]> {
    return await this.userService.all();
  }

  @ApiResponse({
    status: 200,
    description: 'Get user info',
    type: User,
  })
  @Get('me')
  async me(@AuthUser() userSession: UserSession): Promise<User> {
    return await this.userService.me(userSession);
  }

  @ApiResponse({
    status: 200,
    description: 'Generate attributes',
    type: [UserAttribute],
  })
  @Post('attributes')
  async generateAttributes(
    @AuthUser() userSession: UserSession,
  ): Promise<UserAttribute[]> {
    return await this.userService.generateAttributes(userSession);
  }

  @ApiResponse({
    status: 200,
    description: 'Update user',
    type: Result,
  })
  @Put('')
  async update(
    @AuthUser() userSession: UserSession,
    @Body() userDto: UserDto,
  ): Promise<User> {
    return await this.userService.update(userSession, userDto);
  }

  @UserRole(UserRoleEnum.ADMIN)
  @ApiResponse({
    status: 200,
    description: 'Flush user database',
    type: Result,
  })
  @Delete('')
  async flush(): Promise<Result> {
    return await this.userService.flush();
  }
}
