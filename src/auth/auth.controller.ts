import { Public } from '#/decorator/public.decorator';
import { Body, Controller, Headers, Post } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { RefreshDto } from './dto/refresh.dto';
import { SigninDto } from './dto/signin.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @ApiResponse({
    description: 'Refresh user token',
    status: 200,
  })
  @Post('refresh')
  async refresh(@Body() refreshDto: RefreshDto) {
    return await this.authService.refresh(refreshDto);
  }

  @Public()
  @ApiResponse({
    description: 'Authenticate user with firebase',
    status: 200,
  })
  @Post('')
  async authenticate(
    @Body() authDto: AuthDto,
    @Headers('User-Agent') userAgent: string,
  ) {
    return await this.authService.authenticate(authDto, userAgent);
  }

  @Public()
  @ApiResponse({
    description: 'Authenticate user with password',
    status: 200,
  })
  @Post('signin')
  async signin(@Body() signinDto: SigninDto) {
    return await this.authService.signin(signinDto);
  }
}
