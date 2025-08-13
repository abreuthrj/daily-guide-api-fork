import { Module } from '@nestjs/common';
import { GoogleDeveloperService } from './developer/developer.service';
import { GooglePlaceController } from './places/place.controller';
import { GooglePlaceService } from './places/place.service';

@Module({
  imports: [],
  controllers: [GooglePlaceController],
  providers: [GooglePlaceService, GoogleDeveloperService],
  exports: [GooglePlaceService, GoogleDeveloperService],
})
export class GoogleModule {}
