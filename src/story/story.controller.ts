import { StoryCategory } from '#/aws/dynamodb/entity/story-category.entity';
import { UserRoleEnum } from '#/aws/dynamodb/entity/user-role.entity';
import { UserSession } from '#/aws/dynamodb/entity/user-session.entity';
import { AuthUser } from '#/decorator/auth-user.decorator';
import { Public } from '#/decorator/public.decorator';
import { UserRole } from '#/decorator/role.decorator';
import { Result } from '#/entity/result.entity';
import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { FeedbackDto } from './dto/feedback.dto';
import { StoryResponse } from './entity/story-response';
import { Story } from './entity/story.entity';
import { StoryService } from './story.service';

@ApiTags('Story')
@Controller('story')
export class StoryController {
  constructor(private readonly storyService: StoryService) {}

  @Public()
  @ApiResponse({
    description: 'Get story sequences',
    status: 200,
    type: [StoryCategory],
  })
  @Get('')
  async sequences(): Promise<StoryCategory[]> {
    return this.storyService.sequences();
  }

  @ApiResponse({
    description: 'Get story sequences',
    status: 200,
    type: [String],
  })
  @Get('all')
  async today(@AuthUser() userSession: UserSession): Promise<Story[]> {
    return this.storyService.all(userSession);
  }

  @UserRole(UserRoleEnum.TESTER)
  @ApiResponse({
    description: 'Reload story',
    status: 200,
    type: StoryResponse,
  })
  @Post(':id/reload')
  async reload(
    @AuthUser() userSession: UserSession,
    @Param('id') storyId: string,
  ): Promise<StoryResponse> {
    return this.storyService.reload(userSession, storyId);
  }

  @ApiResponse({
    description: 'Save story feedback',
    status: 200,
    type: Result,
  })
  @Post(':id/feedback')
  async feedback(
    @AuthUser() userSession: UserSession,
    @Param('id') storyId: string,
    @Body() feedbackDto: FeedbackDto,
  ): Promise<Result> {
    return this.storyService.feedback(userSession, storyId, feedbackDto);
  }

  @ApiResponse({
    description: 'Get story content',
    status: 200,
    type: Story,
  })
  @Get(':id')
  async open(
    @AuthUser() userSesson: UserSession,
    @Param('id') storyCategoryId: string,
  ): Promise<StoryResponse> {
    return this.storyService.open(userSesson, storyCategoryId);
  }

  @ApiResponse({
    description: 'Delete user stories',
    status: 200,
    type: Story,
  })
  @Delete('')
  async delete(@AuthUser() userSession: UserSession): Promise<Result> {
    return this.storyService.delete(userSession);
  }
}
