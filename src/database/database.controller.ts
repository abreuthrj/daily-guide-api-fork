import { UserRoleEnum } from '#/aws/dynamodb/entity/user-role.entity';
import { Development } from '#/decorator/development.decorator';
import { UserRole } from '#/decorator/role.decorator';
import { Result } from '#/entity/result.entity';
import { Controller, Delete, Post } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { DatabaseService } from './database.service';

@ApiTags('Database')
@Controller('database')
export class DatabaseController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Development()
  @UserRole(UserRoleEnum.ADMIN)
  @ApiResponse({
    description: 'Seed items',
  })
  @Post('seed')
  async seed(): Promise<Result> {
    return this.databaseService.seed();
  }

  @Development()
  @UserRole(UserRoleEnum.ADMIN)
  @ApiResponse({
    description: 'Flush items',
  })
  @Delete('')
  async flush(): Promise<Result> {
    return this.databaseService.flush();
  }

  @Development()
  @UserRole(UserRoleEnum.ADMIN)
  @ApiResponse({
    description: 'Drop seeded items',
  })
  @Delete('seed')
  async unseed(): Promise<Result> {
    return this.databaseService.unseed();
  }

  @Development()
  @UserRole(UserRoleEnum.ADMIN)
  @ApiResponse({
    description: 'Sync schema',
  })
  @Delete('sync')
  async sync(): Promise<Result> {
    return this.databaseService.sync();
  }
}
