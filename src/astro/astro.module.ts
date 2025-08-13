import { OpenaiModule } from '#/openai/openai.module';
import { Module } from '@nestjs/common';
import { AstroController } from './astro.controller';
import { AstroService } from './astro.service';

@Module({
  imports: [OpenaiModule],
  controllers: [AstroController],
  providers: [AstroService],
  exports: [AstroService],
})
export class AstroModule {}
