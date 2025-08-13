import { Public } from '#/decorator/public.decorator';
import { Result } from '#/entity/result.entity';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { FirebaseNotificationDto } from './dto/firebase-notification.dto';
import { FirebaseService } from './firebase.service';

@Controller('firebase')
@ApiTags('firebase')
export class FirebaseController {
  constructor(private readonly firebaseService: FirebaseService) {}

  @Public()
  @ApiResponse({
    status: 200,
    description: 'Sends a test push with payload',
  })
  @Post('sendMessage')
  async sendMessage(
    @Body() firebaseNotificationDto: FirebaseNotificationDto,
  ): Promise<Result> {
    return await this.firebaseService.sendMessage(firebaseNotificationDto);
  }
}
