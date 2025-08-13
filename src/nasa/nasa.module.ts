import { Module } from '@nestjs/common';
import { NasaService } from './nasa.service';

@Module({
  imports: [],
  providers: [NasaService],
  exports: [NasaService],
})
export class NasaModule {}
