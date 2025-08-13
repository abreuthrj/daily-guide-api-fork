import { UserSession } from '#/aws/dynamodb/entity/user-session.entity';
import { AuthUser } from '#/decorator/auth-user.decorator';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { CompletionResponse } from './interfaces/completion-response.interface';
import { OpenaiService } from './openai.service';

@ApiTags('openai')
@Controller('openai')
export class OpenaiController {
  constructor(private readonly openaiService: OpenaiService) {}

  @ApiResponse({
    description: 'Get openai autocomplete from prompt',
    status: 200,
  })
  @Get('autocomplete')
  async autocomplete(
    @AuthUser() userSession: UserSession,
    @Query('prompt') prompt: string,
  ): Promise<CompletionResponse> {
    return this.openaiService.autocomplete(userSession.userId, prompt);
  }
}
