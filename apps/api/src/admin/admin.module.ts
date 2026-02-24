import { Module } from '@nestjs/common';
import { AdminEventsController } from './events/admin-events.controller';
import { AdminEventsService } from './events/admin-events.service';
import { AdminImagesService } from './events/admin-images.service';

@Module({
  controllers: [AdminEventsController],
  providers: [AdminEventsService, AdminImagesService],
})
export class AdminModule {}
